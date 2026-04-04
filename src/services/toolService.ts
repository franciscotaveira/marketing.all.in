import { FunctionDeclaration, Type } from "@google/genai";

export interface ToolDefinition {
  declaration: FunctionDeclaration;
  execute: (args: any) => Promise<any>;
}

export const WINDMILL_TOOLS: Record<string, ToolDefinition> = {
  analyze_website: {
    declaration: {
      name: "analyze_website",
      description: "Analisa o conteúdo e SEO de um website específico.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          url: {
            type: Type.STRING,
            description: "A URL do site para analisar."
          }
        },
        required: ["url"]
      }
    },
    execute: async ({ url }) => {
      // Simulação de chamada ao Windmill
      console.log(`[Windmill] Analisando site: ${url}`);
      return {
        status: "success",
        data: {
          title: "Exemplo de Site",
          seo_score: 85,
          keywords: ["marketing", "ai", "automation"],
          summary: "Um site focado em inovação tecnológica."
        }
      };
    }
  },
  search_trends: {
    declaration: {
      name: "search_trends",
      description: "Busca tendências de mercado para um nicho específico.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          niche: {
            type: Type.STRING,
            description: "O nicho de mercado (ex: SaaS, E-commerce)."
          }
        },
        required: ["niche"]
      }
    },
    execute: async ({ niche }) => {
      console.log(`[Windmill] Buscando tendências para: ${niche}`);
      return {
        trends: [
          `Aumento de 20% em buscas por ${niche} automatizado`,
          `Nova regulamentação impactando ${niche}`,
          `Influenciadores de ${niche} migrando para novas plataformas`
        ]
      };
    }
  }
};

export const getToolDeclarations = (toolIds: string[] = []) => {
  return toolIds
    .map(id => WINDMILL_TOOLS[id]?.declaration)
    .filter(Boolean) as FunctionDeclaration[];
};

export const executeToolCall = async (name: string, args: any) => {
  const tool = WINDMILL_TOOLS[name];
  if (!tool) throw new Error(`Ferramenta ${name} não encontrada.`);
  return await tool.execute(args);
};
