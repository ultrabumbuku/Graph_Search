import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const KnowledgeGraph = ({ data }) => {
  const svgRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('KnowledgeGraph useEffect triggered');
    console.log('Data received in KnowledgeGraph:', data);

    if (!data || !svgRef.current) {
      console.log('Data or SVG ref is missing');
      setError('データまたはSVG要素が見つかりません');
      return;
    }

    try {
      console.log('Selecting SVG element');
      const svg = d3.select(svgRef.current);
      console.log('Clearing previous content');
      svg.selectAll("*").remove();

      const width = 800;
      const height = 600;
      console.log('Setting SVG attributes');
      svg.attr('width', width).attr('height', height)
         .attr('viewBox', [0, 0, width, height])
         .style('border', '1px solid #ddd');

      if (!data.nodes || !data.links || data.nodes.length === 0) {
        throw new Error('無効なデータ構造です');
      }

      console.log('Creating force simulation');
      const simulation = d3.forceSimulation(data.nodes)
        .force('link', d3.forceLink(data.links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2));

      console.log('Drawing links');
      const link = svg.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(data.links)
        .join('line');

      console.log('Drawing nodes');
      const node = svg.append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('circle')
        .data(data.nodes)
        .join('circle')
        .attr('r', d => d.id === data.nodes[0].id ? 15 : 10)
        .attr('fill', d => d.id === data.nodes[0].id ? '#ff0000' : '#69b3a2')
        .call(drag(simulation));

      console.log('Adding labels');
      const label = svg.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .selectAll('text')
        .data(data.nodes)
        .join('text')
        .text(d => d.label)
        .attr('dx', 12)
        .attr('dy', '.35em');

      console.log('Setting up simulation tick');
      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);

        label
          .attr('x', d => d.x)
          .attr('y', d => d.y);
      });

      console.log('D3 simulation created and nodes/links drawn');
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error in KnowledgeGraph rendering:', error);
      setError(`グラフの描画中にエラーが発生しました: ${error.message}`);
    }
  }, [data]);

  function drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  return (
    <div>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <svg 
        ref={svgRef}
        style={{
          border: '1px solid #ddd',
          maxWidth: '100%',
          height: 'auto',
          aspectRatio: '4 / 3'
        }}
      />
    </div>
  );
};

export default KnowledgeGraph;