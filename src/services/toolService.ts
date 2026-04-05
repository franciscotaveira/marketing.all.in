import { FunctionDeclaration, Type } from "@google/genai";

export interface ToolDefinition {
  declaration: FunctionDeclaration;
  execute: (args: any) => Promise<any>;
}

// Placeholder for future tools
export const AVAILABLE_TOOLS: Record<string, ToolDefinition> = {};

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
