import * as React from 'react';
import { useMemo } from 'react';
import * as d3 from 'd3v7';

// code taken from https://wattenberger.com/blog/react-and-d3
export function ScatterplotAxis({
  yScale,
  xRange,
  horizontalPosition,
  showAxisLabels,
}: {
  yScale: d3.ScaleLinear<number, number>;
  xRange: [number, number];
  horizontalPosition: number;
  showAxisLabels: boolean;
}) {
  const ticks = useMemo(() => {
    return yScale.domain().map((value) => ({
      value,
      yOffset: yScale(value),
    }));
  }, [yScale]);

  return (
    <>
      <path
        transform={`translate(${horizontalPosition}, 0)`}
        d={['M', 0, yScale.range()[0], 'V', yScale.range()[1]].join(' ')}
        fill="none"
        stroke="currentColor"
      />
      {ticks.map(({ value, yOffset }) => (
        <g key={value} transform={`translate(${horizontalPosition}, ${yOffset})`}>
          {showAxisLabels ? (
            <>
              <line x2="-6" stroke="currentColor" />{' '}
            </>
          ) : null}
          <line x2={`${xRange[1] - xRange[0]}`} stroke={`${'lightgray'}`} />
        </g>
      ))}
    </>
  );
}
