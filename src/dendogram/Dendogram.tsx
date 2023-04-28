import { Stage, Graphics, Container } from '@inlet/react-pixi';
import * as React from 'react';
import '../styles.css';
import * as PIXI from 'pixi.js';
import * as d3 from 'd3v7';

import { useMemo } from 'react';

import { parseNewick } from '../newickParser';
import { newickStr } from '../newick_RANDOM_1';
import { ITree } from '../interfaces';

function DFS(node: d3.HierarchyNode<ITree>, g: PIXI.Graphics) {
  console.log(node);
  g.drawCircle(3, 3, 2);
  if (node.children) {
    for (let child of node.children) {
      DFS(child, g);
    }
  }
}
export function Dendogram() {
  // console.log(parseNewick(newickStr));

  const dendogramData = useMemo(() => {
    const myTree = parseNewick(newickStr);

    const hierarchy = d3.hierarchy(myTree);

    const dendogramCluster = d3.cluster<ITree>().size([2000, 1000]);

    return dendogramCluster(hierarchy);
  }, []);

  const draw = React.useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(0x000000, 1);

      DFS(dendogramData, g);
      g.endFill();
    },
    [dendogramData],
  );

  const mask = new PIXI.Graphics();
  mask.beginFill(0xff3300);
  mask.drawRect(0, 0, 2000, 1000);
  mask.endFill();

  return (
    <div>
      <Stage
        width={2000}
        height={1000}
        options={{
          backgroundColor: 0xeef1f5,
          antialias: true,
        }}
      >
        <Container pivot={[1000, 0]} position={[1000, 0]}>
          <Graphics draw={draw} />
        </Container>
      </Stage>
    </div>
  );
}
