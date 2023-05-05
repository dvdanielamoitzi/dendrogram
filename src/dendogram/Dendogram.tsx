import { Stage, Graphics } from '@inlet/react-pixi';
import * as React from 'react';
import '../styles.css';
import * as PIXI from 'pixi.js';
import * as d3 from 'd3v7';

import { useMemo } from 'react';
import { dendogramData as dendogramDataRaw } from '../DendogramData';

import { parseNewick } from '../newickParser';
import { newickStr } from '../newick_RANDOM_1';
import { ITree } from '../interfaces';

const DOT_SIZE = 5;
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
  brushArea: [number, number],
  yScale: d3.ScaleLinear<number, number>,
) {
  const yPosition = node.children ? yScale(node.depth) : yScale(yScale.domain()[1]);
  if (brushArea === null || brushArea[0] === null || brushArea[1] === null) {
    // @ts-ignore
    g.drawCircle(xScale(node.x), yPosition, DOT_SIZE);
    // @ts-ignore
  } else if (node.x > brushArea[0] && node.x < brushArea[1]) {
    // @ts-ignore
    g.drawCircle(xScale(node.x), yPosition, DOT_SIZE);
  }
  if (node.children) {
    for (let child of node.children) {
      const yPositionChild = child.children ? yScale(child.depth) : yScale(yScale.domain()[1]);
      // @ts-ignore
      g.moveTo(xScale(node.x), yPosition).lineTo(xScale(child.x), yPosition);
      // @ts-ignore
      g.moveTo(xScale(child.x), yPosition).lineTo(xScale(child.x), yPositionChild);

      DFS(child, g, xScale, brushArea, yScale);
    }
  }
}
export function Dendogram({ brushArea, xScale }: { brushArea: [number, number]; xScale: d3.ScaleLinear<number, number> }) {
  const dendogramData = useMemo(() => {
    const myTree = parseNewick(newickStr);

    const hierarchy = d3.hierarchy(myTree);

    const dendogramCluster = d3.cluster<ITree>().size([dendogramDataRaw.length, height]);

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
  // console.log(parseNewick(newickStr));

  const draw = React.useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.lineStyle(1, 0x000000, 1);
      g.beginFill(0x000000, 1);
      DFS(dendogramData, g, xScale, brushArea, yScale);
      g.endFill();
    },
    [brushArea, dendogramData, xScale, yScale],
  );

  const mask = new PIXI.Graphics();
  mask.beginFill(0xff3300);
  mask.drawRect(0, 0, 2000, height);
  mask.endFill();

  return (
    <div>
      <Stage
        width={2000}
        height={height}
        options={{
          backgroundColor: 0xeef1f5,
          antialias: true,
        }}
        onWheel={(e) => {
          // e.clientX;
          // e.deltaY;
          console.log('---> ', e);
        }}
      >
        {/* <Container pivot={[2000, 0]} position={[2000, 0]}> */}
        <Graphics draw={draw} />
        {/* </Container> */}
      </Stage>
    </div>
  );
}
