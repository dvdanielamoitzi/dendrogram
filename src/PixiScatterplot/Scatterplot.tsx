import { Stage, Graphics, SimpleMesh, ParticleContainer } from '@inlet/react-pixi';
import * as React from 'react';
import '../styles.css';
import * as PIXI from 'pixi.js';
import * as d3 from 'd3v7';
import { useCallback, useMemo, useState } from 'react';
import { Minimap } from '../Minimap/Minimap';
import { Dendogram } from '../dendogram/Dendogram';

import { dendogramData } from '../DendogramData';

import { parseNewick } from '../newickParser';
import { newickStr } from '../newick_RANDOM_1';

const height = 1000;
const width = 2000;
const margin = {
  top: 20,
  bottom: 20,
  left: 20,
  right: 20,
};

export function Scatterplot() {
  const [brushedArea, setBrushedArea] = useState<[number, number]>(null);

  const onBrush = useCallback((xStart, xEnd) => setBrushedArea([xStart, xEnd]), []);

  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .range([0, width])
      .domain(brushedArea && brushedArea[0] !== null && brushedArea[1] !== null ? brushedArea : [0, dendogramData.length]);
  }, [brushedArea]);

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .range([margin.top, height - margin.bottom])
      .domain([d3.max(dendogramData.map((d) => d['2_finalEC50'])), d3.min(dendogramData.map((d) => d['2_finalEC50']))]);
  }, []);

  const draw = React.useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(0x000000, 1);

      dendogramData
        .filter((d) => d.index >= xScale.domain()[0] && d.index <= xScale.domain()[1])
        .forEach((d) => {
          g.drawCircle(xScale(d.index), yScale(d['2_finalEC50']), 2);
        });
      g.endFill();
    },
    [xScale, yScale],
  );

  return (
    <div>
      <Minimap onBrush={onBrush} />
      <Dendogram brushArea={brushedArea} xScale={xScale} />
      <Stage
        width={width}
        height={height}
        options={{
          backgroundColor: 0xeef1f5,
          antialias: true,
        }}
      >
        {/* <ParticleContainer position={[0, 0]} properties={{ position: true }}>
          {dendogramData
            .filter(
              (d) =>
                d.index >= xScale.domain()[0] && d.index <= xScale.domain()[1]
            )
            .map((d) => {
              return (
                <Graphics
                  x={xScale(d.index)}
                  y={yScale(d["2_finalEC50"])}
                  draw={(g) => {
                    g.beginFill(0x000000, 1);
                    g.drawCircle(0, 0, 2);
                    g.endFill();
                  }}
                />
              );
            })}
        </ParticleContainer> */}
        {/* actual scatterplot: */}
        <Graphics draw={draw} />
        {/* <SimpleMesh
          texture="https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/placeholder.png"
          drawMode={PIXI.DRAW_MODES.TRIANGLES}
        /> */}
        {/* <AppConsumer>{(app) => <Plane app={app} />}</AppConsumer> */}
      </Stage>
    </div>
  );
}
