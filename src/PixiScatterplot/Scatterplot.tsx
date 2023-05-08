import { Stage, Graphics, SimpleMesh, ParticleContainer } from '@inlet/react-pixi';
import * as React from 'react';
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
  // const [brushedArea, setBrushedArea] = useState<[number, number]>([null, null]);
  const [brushStart, setBrushStart] = useState<number>(null);
  const [brushEnd, setBrushEnd] = useState<number>(null);

  const circleScale = useMemo(() => {
    return d3.scaleLinear().range([2, 5]).domain([1, 0]);
  }, []);

  const zoomLevel = useMemo(() => {
    if (brushStart !== null && brushEnd !== null) {
      return (brushEnd - brushStart) / dendogramData.length;
    }
    return 1;
  }, [brushEnd, brushStart]);

  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .range([0, width])
      .domain(brushStart !== null && brushEnd !== null ? [brushStart, brushEnd] : [0, dendogramData.length]);
  }, [brushEnd, brushStart]);

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
          g.drawCircle(xScale(d.index), yScale(d['2_finalEC50']), circleScale(zoomLevel));
        });
      g.endFill();
    },
    [circleScale, xScale, yScale, zoomLevel],
  );

  return (
    <div>
      <Minimap setBrushStart={setBrushStart} setBrushEnd={setBrushEnd} brushStart={brushStart} brushEnd={brushEnd} />
      <Dendogram
        brushStart={brushStart}
        brushEnd={brushEnd}
        setBrushStart={setBrushStart}
        setBrushEnd={setBrushEnd}
        xScale={xScale}
        pointSize={circleScale(zoomLevel)}
      />
      <Stage
        width={width}
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
