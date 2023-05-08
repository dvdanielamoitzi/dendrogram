import { Stage, Graphics } from '@inlet/react-pixi';
import * as React from 'react';
import * as PIXI from 'pixi.js';
import * as d3 from 'd3v7';

import { useMemo, useRef, useEffect } from 'react';
import { useEvent } from 'visyn_core';
import { dendogramData as dendogramDataRaw } from '../DendogramData';

import { parseNewick } from '../newickParser';
import { newickStr } from '../newick_RANDOM_1';
import { ITree } from '../interfaces';

const margin = {
  top: 20,
  bottom: 20,
  left: 20,
  right: 20,
};
const height = 1000;

function DFS(
  node: d3.HierarchyNode<ITree>,
  g: PIXI.Graphics,
  xScale: d3.ScaleLinear<number, number>,
  brushStart,
  brushEnd,
  yScale: d3.ScaleLinear<number, number>,
  pointSize: number,
) {
  const yPosition = node.children ? yScale(node.depth) : yScale(yScale.domain()[1]);

  if (node.children) {
    for (const child of node.children) {
      const yPositionChild = child.children ? yScale(child.depth) : yScale(yScale.domain()[1]);
      // @ts-ignore
      g.moveTo(xScale(node.x), yPosition).lineTo(xScale(child.x), yPosition);
      // @ts-ignore
      g.moveTo(xScale(child.x), yPosition).lineTo(xScale(child.x), yPositionChild);

      DFS(child, g, xScale, brushStart, brushEnd, yScale, pointSize);
    }
  }

  if (!brushStart || !brushEnd) {
    // @ts-ignore
    g.drawCircle(xScale(node.x), yPosition, pointSize);
    // @ts-ignore
  } else if (node.x > brushStart && node.x < brushEnd) {
    // @ts-ignore
    g.drawCircle(xScale(node.x), yPosition, pointSize);
  }
}

export function Dendogram({
  brushStart,
  brushEnd,
  xScale,
  setBrushStart,
  setBrushEnd,
  pointSize,
}: {
  brushStart: number;
  brushEnd: number;
  xScale: d3.ScaleLinear<number, number>;
  setBrushStart: (xStart) => void;
  setBrushEnd: (xEnd) => void;
  pointSize: number;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dendogramData = useMemo(() => {
    const myTree = parseNewick(newickStr);

    const hierarchy = d3.hierarchy(myTree);

    const dendogramCluster = d3
      .cluster<ITree>()
      .size([dendogramDataRaw.length, height])
      .separation((a, b) => 1);

    return dendogramCluster(hierarchy);
  }, []);

  const yScale = useMemo(() => {
    let maxDepth = 0;
    dendogramData.descendants().forEach((d) => {
      if (d.depth > maxDepth) {
        maxDepth = d.depth;
      }
    });
    return d3
      .scaleLinear()
      .range([margin.top, height - margin.bottom])
      .domain([0, maxDepth]);
  }, [dendogramData]);

  const draw = React.useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.lineStyle(1, 0x808080, 1);
      g.beginFill(0x000000, 1);
      DFS(dendogramData, g, xScale, brushStart, brushEnd, yScale, pointSize);
      g.endFill();
    },
    [brushEnd, brushStart, dendogramData, pointSize, xScale, yScale],
  );

  const wheelListener = useEvent((e: WheelEvent) => {
    const brushLength = brushEnd - brushStart;
    const brushX1Percentage = (xScale.invert(e.clientX) - brushStart) / brushLength;
    const brushX2Percentage = (brushEnd - xScale.invert(e.clientX)) / brushLength;
    const newBrushX1 = brushStart - (e.deltaY / 1000) * brushLength * brushX1Percentage;
    const newBrushX2 = brushEnd + (e.deltaY / 1000) * brushLength * brushX2Percentage;

    if (newBrushX1 > newBrushX2) {
      return;
    }
    if (newBrushX1 > 0) {
      setBrushStart(newBrushX1);
    } else {
      setBrushStart(0);
    }
    if (newBrushX2 < dendogramDataRaw.length) {
      setBrushEnd(newBrushX2);
    } else {
      setBrushEnd(dendogramDataRaw.length);
    }
    e.stopPropagation();
    e.preventDefault();
  });

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.addEventListener('wheel', wheelListener);
    }
  }, [wheelListener]);

  return (
    <div ref={canvasRef}>
      <Stage
        width={2000}
        height={height}
        options={{
          backgroundColor: 0xeef1f5,
          antialias: true,
        }}
      >
        <Graphics draw={draw} />
      </Stage>
    </div>
  );
}
