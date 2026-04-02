import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { z } from "zod";
import admin from "firebase-admin";
import dotenv from "dotenv";
import { google } from "googleapis";

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

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Google Drive Auth Routes
  app.get("/api/auth/google/url", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
      ],
      prompt: "consent"
    });
    res.json({ url });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      res.send(`
        <html>
          <body style="background: #0A0A0A; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center;">
              <h2 style="color: #3b82f6;">Autenticação Concluída!</h2>
              <p style="color: #9ca3af;">Esta janela fechará automaticamente.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', tokens: ${JSON.stringify(tokens)} }, '*');
                  setTimeout(() => window.close(), 1000);
                } else {
                  window.location.href = '/';
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  app.post("/api/drive/read-folder", async (req, res) => {
    const { folderId, tokens } = req.body;
    if (!tokens) return res.status(401).json({ error: "No tokens provided" });

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    auth.setCredentials(tokens);
    const drive = google.drive({ version: "v3", auth });

    try {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "files(id, name, mimeType)",
      });

      const files = response.data.files || [];
      const fileContents = await Promise.all(files.map(async (file) => {
        try {
          if (file.mimeType === "application/vnd.google-apps.document") {
            const docResponse = await drive.files.export({
              fileId: file.id!,
              mimeType: "text/plain",
            });
            return { name: file.name, content: docResponse.data as string };
          } else if (file.mimeType === "text/plain" || file.mimeType === "application/json" || file.mimeType?.startsWith("text/")) {
             const fileResponse = await drive.files.get({
               fileId: file.id!,
               alt: "media"
             });
             return { name: file.name, content: typeof fileResponse.data === 'string' ? fileResponse.data : JSON.stringify(fileResponse.data) };
          }
          return { name: file.name, content: `[Arquivo do tipo ${file.mimeType} não suportado para leitura direta automática]` };
        } catch (e) {
          return { name: file.name, content: `[Erro ao ler arquivo: ${(e as Error).message}]` };
        }
      }));

      res.json({ files: fileContents });
    } catch (error) {
      console.error("Drive API error:", error);
      res.status(500).json({ error: "Failed to read Drive folder" });
    }
  });

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
