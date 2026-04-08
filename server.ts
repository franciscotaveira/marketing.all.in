import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { z } from "zod";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
import { google } from "googleapis";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

dotenv.config();

// Load Firebase Config
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = {};
if (fs.existsSync(firebaseConfigPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
}

// Initialize Firebase Admin
let adminApp;
let db: admin.firestore.Firestore | null = null;
let hasValidServiceAccount = false;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      hasValidServiceAccount = true;
    } catch (parseError) {
      console.warn("⚠️ Aviso: FIREBASE_SERVICE_ACCOUNT_KEY não é um JSON válido. Verifique se você não colou um caminho de arquivo em vez do conteúdo JSON. O servidor tentará usar as credenciais padrão.");
    }

    if (serviceAccount) {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: firebaseConfig.projectId,
      });
    } else {
      adminApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: firebaseConfig.projectId,
      });
    }
  } else {
    adminApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: firebaseConfig.projectId,
    });
  }
  db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
}

// Initialize Gemini Client for Backend
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Backend Routine Executor
function startRoutineExecutor() {
  console.log("[Backend] Starting Routine Executor...");
  
  if (!hasValidServiceAccount) {
    console.warn("\n⚠️ AVISO: Para que o backend acesse o Firestore 24/7, você precisa configurar a variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY com um JSON válido.");
    console.warn("Sem ela, o servidor não tem permissão para ler/escrever no banco de dados do usuário e as rotinas automáticas não serão executadas.\n");
  }
  
  setInterval(async () => {
    if (!hasValidServiceAccount || !db) {
      return; // Skip execution if no valid service account key is provided or db is not initialized
    }

    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      // Get all users
      const usersSnapshot = await db.collection('users').get();
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const routinesSnapshot = await db.collection('users').doc(userId).collection('routines').get();
        
        for (const routineDoc of routinesSnapshot.docs) {
          const routine = { id: routineDoc.id, ...routineDoc.data() } as any;
          
          // Check day
          if (routine.days && routine.days.length > 0 && !routine.days.includes(currentDay)) continue;
          
          // Check time
          if (!routine.startTime) continue;
          const [startHour, startMinute] = routine.startTime.split(':').map(Number);
          
          if (currentHour === startHour && currentMinute === startMinute) {
            // Check if already executed today
            const lastExecuted = routine.lastExecutedAt?.toDate();
            const isAlreadyExecutedToday = lastExecuted && 
              lastExecuted.getDate() === now.getDate() && 
              lastExecuted.getMonth() === now.getMonth() && 
              lastExecuted.getFullYear() === now.getFullYear();

            if (!isAlreadyExecutedToday) {
              console.log(`[Backend] Executing routine ${routine.title} for user ${userId}`);
              
              // 1. Fetch pending tasks for context
              const tasksSnapshot = await db.collection('users').doc(userId).collection('tasks')
                .where('status', '!=', 'done').get();
              const pendingTasks = tasksSnapshot.docs.map(d => d.data());
              
              // 2. Prepare prompt
              const agentId = routine.agentId || 'productivity-strategist';
              const prompt = `
                ROTINA AUTOMÁTICA: "${routine.title}"
                
                Contexto Atual:
                - Tarefas Pendentes: ${pendingTasks.length}
                - Data/Hora: ${now.toLocaleString()}
                
                Sua missão: Como ${agentId}, analise o cenário atual e forneça uma recomendação estratégica curta (1 parágrafo) ou uma lista de 3 ações prioritárias para o usuário agora.
              `;

              try {
                // 3. Call Gemini
                const response = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: prompt,
                  config: {
                    systemInstruction: 'Você é um assistente de produtividade executando uma rotina agendada.'
                  }
                });

                // 4. Save Notification
                await db.collection('users').doc(userId).collection('notifications').add({
                  title: `Rotina Executada: ${routine.title}`,
                  message: response.text || "Rotina concluída sem mensagem.",
                  type: 'success',
                  read: false,
                  createdAt: admin.firestore.FieldValue.serverTimestamp(),
                  metadata: {
                    routineId: routine.id,
                    agentId: agentId,
                    executedBy: 'backend'
                  }
                });

                // 5. Update Routine
                await routineDoc.ref.update({
                  lastExecutedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                
                console.log(`[Backend] Successfully executed routine ${routine.title}`);
              } catch (err) {
                console.error(`[Backend] Error calling Gemini for routine ${routine.id}:`, err);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("[Backend] Routine executor error:", error);
    }
  }, 60000); // Check every minute
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Start the background routine executor
  startRoutineExecutor();

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
      if (!db) {
        return res.status(500).json({ error: "Database not initialized" });
      }
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
      if (!db) {
        return res.status(500).json({ error: "Database not initialized" });
      }
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
