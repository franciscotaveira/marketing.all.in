import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { z } from "zod";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/agent-config/:agentId", async (req, res) => {
    try {
      const { agentId } = req.params;
      const doc = await db.collection("agents").doc(agentId).get();
      
      if (!doc.exists) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      res.json(doc.data());
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const chatSchema = z.object({
    agentId: z.string(),
    message: z.string(),
    systemInstruction: z.string().optional(),
    tools: z.array(z.any()).optional(),
    images: z.array(z.string()).optional(),
    history: z.array(z.any()).optional(),
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { agentId, message, systemInstruction, tools, images, history } = chatSchema.parse(req.body);
      
      // Fetch agent config to determine model
      const doc = await db.collection("agents").doc(agentId).get();
      if (!doc.exists) {
        return res.status(404).json({ error: "Agent not found" });
      }
      const agentConfig = doc.data();
      
      // If model is not Gemini, call OpenRouter
      if (agentConfig?.model && !agentConfig.model.startsWith("gemini")) {
        let userContent: any = message;
        
        if (images && images.length > 0) {
          userContent = [
            { type: "text", text: message },
            ...images.map(img => ({
              type: "image_url",
              image_url: { url: img }
            }))
          ];
        }

        const openRouterMessages: any[] = [];
        if (systemInstruction) {
          openRouterMessages.push({ role: "system", content: systemInstruction });
        }

        if (history && history.length > 0) {
          history.forEach(msg => {
            const role = msg.role === 'ai' ? 'assistant' : 'user';
            let content: any = msg.content;
            if (msg.images && msg.images.length > 0) {
               content = [
                 { type: "text", text: msg.content },
                 ...msg.images.map((img: string) => ({
                   type: "image_url",
                   image_url: { url: img }
                 }))
               ];
            }
            openRouterMessages.push({ role, content });
          });
        }

        openRouterMessages.push({ role: "user", content: userContent });

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: agentConfig.model,
            messages: openRouterMessages,
            tools: tools,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json();
        res.json({ response: data.choices[0].message.content });
      } else {
        res.status(400).json({ error: "Gemini models must be called from frontend" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request", details: (error as any).errors });
      } else {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
