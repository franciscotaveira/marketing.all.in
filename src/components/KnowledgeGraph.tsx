import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { KnowledgeItem } from '../types';

interface KnowledgeGraphProps {
  knowledgeBase: KnowledgeItem[];
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ knowledgeBase }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || knowledgeBase.length === 0) return;

    const width = 600;
    const height = 400;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes = knowledgeBase.map(k => ({ id: k.id, name: k.topic, tags: k.tags }));
    
    // Create links based on shared tags
    const links: { source: string; target: string }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const sharedTags = nodes[i].tags.filter(tag => nodes[j].tags.includes(tag));
        if (sharedTags.length > 0) {
          links.push({ source: nodes[i].id, target: nodes[j].id });
        }
      }
    }

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6);

    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 8)
      .attr("fill", "#3b82f6");

    const label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d: any) => d.name)
      .attr("font-size", "10px")
      .attr("dx", 10)
      .attr("dy", 3);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
      
      label
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

  }, [knowledgeBase]);

  return <svg ref={svgRef} width="600" height="400" className="w-full h-full" />;
};
