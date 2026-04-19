import { FunctionDeclaration, Type } from "@google/genai";

export interface ToolDefinition {
  declaration: FunctionDeclaration;
  execute: (args: any) => Promise<any>;
}

export const AVAILABLE_TOOLS: Record<string, ToolDefinition> = {
  query_analytics: {
    declaration: {
      name: "query_analytics",
      description: "Consulta métricas de performance (ROI, Conversão, CPA, CAC) de canais como Meta Ads, Google Ads ou GA4.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          channel: { type: Type.STRING, description: "Canal a ser consultado (ex: 'meta', 'google', 'ga4')" },
          metric: { type: Type.STRING, description: "Métrica desejada (ex: 'roi', 'cpa', 'conversion_rate')" },
          period: { type: Type.STRING, description: "Período (ex: '7d', '30d')" }
        },
        required: ["channel", "metric"]
      }
    },
    execute: async (args) => {
      // Simulação de banco de dados/API real para Analytics
      console.log(`[Tool] query_analytics called with:`, args);
      return { 
        channel: args.channel, 
        metric: args.metric, 
        period: args.period || '30d',
        value: args.metric === 'roi' ? 24.5 : args.metric === 'cpa' ? 12.40 : 3.8,
        trend: "up",
        status: "success",
        mocked: true
      };
    }
  },
  analyze_website: {
    declaration: {
      name: "analyze_website",
      description: "Realiza o scraping e leitura do conteúdo principal de uma URL para extrair contexto de negócio ou falhas de SEO.",
      parameters: {
        type: Type.OBJECT,
        properties: { url: { type: Type.STRING, description: "URL do site a ser lido" } },
        required: ["url"]
      }
    },
    execute: async (args) => {
      console.log(`[Tool] analyze_website real fetch:`, args.url);
      try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(args.url)}`);
        const data = await response.json();
        const html = data.contents;
        if (!html) throw new Error("Conteúdo não retornado ou URL inacessível");
        
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : "Sem título";
        
        const textContent = html
          .replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '')
          .replace(/<style[^>]*>([\S\s]*?)<\/style>/gmi, '')
          .replace(/<\/?[^>]+(>|$)/g, " ")
          .replace(/\s+/g, ' ')
          .substring(0, 4000); 

        return { 
          url: args.url, 
          title, 
          content: textContent, 
          status: "success", 
          characterCount: textContent.length 
        };
      } catch (e: any) {
        return { error: true, message: `Falha no scraping da URL: ${e.message}`, url: args.url };
      }
    }
  },
  n8n_webhook: {
    declaration: {
      name: "n8n_webhook",
      description: "Dispara um webhook para o n8n iniciar uma automação de backend (ex: enviar email, atualizar CRM).",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING, description: "Ação que o n8n deve realizar (ex: 'send_email', 'update_crm')" },
          payload: { type: Type.OBJECT, description: "Dados a serem enviados em JSON" }
        },
        required: ["action", "payload"]
      }
    },
    execute: async (args) => {
      console.log(`[Tool] n8n_webhook trigger:`, args);
      const webhookUrl = localStorage.getItem("n8n_webhook_url");
      if (!webhookUrl) {
        return { 
          error: true, 
          message: "URL do Webhook do n8n não configurada no cliente. Informe ao usuário para configurar a chave 'n8n_webhook_url' no painel/localStorage." 
        };
      }
      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(args)
        });
        return { success: res.ok, status: res.status, message: "Webhook disparado e processado pelo n8n." };
      } catch (e: any) {
        return { error: true, message: `Falha na requisição ao webhook do n8n: ${e.message}` };
      }
    }
  }
};

export const getToolDeclarations = (toolIds: string[] = []) => {
  return toolIds
    .map(id => AVAILABLE_TOOLS[id]?.declaration)
    .filter(Boolean) as FunctionDeclaration[];
};

export const executeToolCall = async (name: string, args: any) => {
  const tool = AVAILABLE_TOOLS[name];
  if (!tool) throw new Error(`Ferramenta ${name} não encontrada.`);
  return await tool.execute(args);
};
