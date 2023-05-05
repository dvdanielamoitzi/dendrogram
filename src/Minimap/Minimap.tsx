import * as React from 'react';
import { ReactSVGElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ReactDOMServer from 'react-dom/server';

import * as d3 from 'd3v7';
import * as PIXI from 'pixi.js';
import { Brush } from './Brush';
import { dendogramData } from '../DendogramData';
import { DendogramPoint } from './DendogramPoint';

const margin = {
  top: 20,
  bottom: 20,
  left: 20,
  right: 20,
};

export function Minimap({
  setBrushStart,
  setBrushEnd,
  brushStart,
  brushEnd,
}: {
  setBrushStart: (brushStart: number) => void;
  setBrushEnd: (brushEnd: number) => void;
  brushStart: number;
  brushEnd: number;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .range([margin.top, 300 - margin.bottom])
      .domain([d3.max(dendogramData.map((d) => d['2_finalEC50'])), d3.min(dendogramData.map((d) => d['2_finalEC50']))]);
  }, []);

  const xScale = useMemo(() => {
    return d3.scaleLinear().range([0, 2000]).domain([0, dendogramData.length]);
  }, []);

  const points = useMemo(() => {
    const usedData = dendogramData.slice(Math.round(xScale.domain()[0]), Math.round(xScale.domain()[1]));
    return usedData.map((p) => <DendogramPoint key={p.index} label={p.compoundNo} xPos={xScale(p.index)} yPos={yScale(p['2_finalEC50'])} />);
  }, [xScale, yScale]);

  const convertBrushX1ToScale = useCallback(
    (xStart) => {
      if (!xStart) {
        setBrushStart(null);
        return;
      }
      setBrushStart(xScale.invert(xStart));
    },
    [setBrushStart, xScale],
  );

  const convertBrushX2ToScale = useCallback(
    (xEnd) => {
      if (!xEnd) {
        setBrushEnd(null);
        return;
      }
      setBrushEnd(xScale.invert(xEnd));
    },
    [xScale, setBrushEnd],
  );

  // const mySvg = useMemo(() => {
  //   return (
  //     <svg height="300px" width="2000px">
  //       {points}
  //     </svg>
  //   );
  // }, [points]);

  // const svgResource = new PIXI.SVGResource(ReactDOMServer.renderToString(mySvg), {});

  // const sprite = PIXI.Sprite.from(svgResource.source);

  // console.log(sprite.texture);

  return (
    <svg height={300} width="2000px">
      {points}
      <Brush onBrushX1={setBrushStart} onBrushX2={setBrushEnd} x={0} y={0} width={2000} height={300} brushX1={brushStart} brushX2={brushEnd} />
    </svg>
  );
}
