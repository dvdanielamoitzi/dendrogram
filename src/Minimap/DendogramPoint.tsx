import * as React from 'react';

export function DendogramPoint({ xPos, yPos, label }: { xPos: number; yPos: number; label: string }) {
  return (
    // <Tooltip withinPortal label={label}>
    <circle r={2} fill="cornflowerblue" cx={xPos} cy={yPos} />
    // </Tooltip>
  );
}
