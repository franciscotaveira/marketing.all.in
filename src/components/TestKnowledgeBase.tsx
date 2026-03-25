import React from 'react';
import { firebaseService } from '../lib/firebaseService';

export const TestKnowledgeBase: React.FC = () => {
  const runTest = async () => {
    console.log("Iniciando teste de persistência da Base de Conhecimento...");
    
    const testItem = {
      agentId: "test-agent",
      topic: "Teste de Conexão",
      content: "Este é um item de teste para verificar permissões.",
      confidence: 0.9,
      tags: ["teste", "firebase"]
    };

    try {
      // Test Write
      const { data, error: writeError } = await firebaseService.saveKnowledge(testItem);
      if (writeError) {
        console.error("Erro ao escrever no Firestore:", writeError);
        return;
      }
      console.log("Escrita bem-sucedida! ID:", data?.id);

      // Test Read
      const { data: knowledge, error: readError } = await firebaseService.getKnowledge();
      if (readError) {
        console.error("Erro ao ler do Firestore:", readError);
        return;
      }
      console.log("Leitura bem-sucedida! Itens encontrados:", knowledge?.length);
      console.log("Teste concluído com sucesso.");
    } catch (e) {
      console.error("Erro inesperado no teste:", e);
    }
  };

  return (
    <button 
      onClick={runTest}
      className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-green-700 transition-colors"
    >
      Testar Base de Conhecimento
    </button>
  );
};
