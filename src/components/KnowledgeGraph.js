import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const KnowledgeGraph = ({ data }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) {
      setError('データまたはSVG要素が見つかりません');
      return;
    }

    try {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      svg.attr('width', width).attr('height', height);

      if (!data.nodes || !data.links || data.nodes.length === 0) {
        throw new Error('無効なデータ構造です');
      }

      const simulation = d3.forceSimulation(data.nodes)
        .force('link', d3.forceLink(data.links).id(d => d.id).distance(150))
        .force('charge', d3.forceManyBody().strength(-1000))
        .force('collide', d3.forceCollide().radius(60))
        .force('center', d3.forceCenter(width / 2, height / 2));

      const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });

      svg.call(zoom);

      const g = svg.append('g');

      const link = g.append('g')
        .selectAll('line')
        .data(data.links)
        .join('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6);

      const node = g.append('g')
        .selectAll('circle')
        .data(data.nodes)
        .join('circle')
        .attr('r', d => d.id === data.nodes[0].id ? 20 : 15)
        .attr('fill', d => d.id === data.nodes[0].id ? '#ff0000' : '#69b3a2')
        .call(drag(simulation));

      const labelBackground = g.append('g')
        .selectAll('rect')
        .data(data.nodes)
        .join('rect')
        .attr('fill', 'white')
        .attr('opacity', 0.8);

      const label = g.append('g')
        .selectAll('text')
        .data(data.nodes)
        .join('text')
        .text(d => d.label)
        .attr('font-size', 12)
        .attr('dy', 4)
        .each(function(d) {
          const bbox = this.getBBox();
          d.width = bbox.width;
          d.height = bbox.height;
        });

      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);

        labelBackground
          .attr('x', d => d.x + (d.x < width / 2 ? 20 : -d.width - 25))
          .attr('y', d => d.y - d.height / 2 - 2)
          .attr('width', d => d.width + 10)
          .attr('height', d => d.height + 4);

        label
          .attr('x', d => d.x + (d.x < width / 2 ? 25 : -d.width - 20))
          .attr('y', d => d.y);
      });

      setError(null);
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
    <div ref={containerRef} style={{ width: '100%', height: '80vh', maxHeight: '600px' }}>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default KnowledgeGraph;