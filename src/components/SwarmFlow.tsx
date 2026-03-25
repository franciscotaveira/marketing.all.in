import React, { useEffect, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

interface SwarmFlowProps {
  agents: { id: string, name: string, status: string }[];
}

export const SwarmFlow: React.FC<SwarmFlowProps> = ({ agents }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    // Criar nós para cada agente
    const newNodes = agents.map((agent, index) => ({
      id: agent.id,
      data: { label: agent.name },
      position: { x: (index % 3) * 200, y: Math.floor(index / 3) * 150 },
      style: { 
        background: agent.status === 'thinking' ? '#eab308' : '#2563eb', 
        color: '#fff',
        borderRadius: '12px',
        padding: '10px',
        width: 150
      },
    }));

    // Criar conexões aleatórias para simular colaboração
    const newEdges = agents.slice(1).map((agent, index) => ({
      id: `e${index}`,
      source: agents[index].id,
      target: agent.id,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [agents]);

  return (
    <div className="h-full w-full bg-[#0A0A0A] rounded-2xl border border-white/10">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="#333" gap={20} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
