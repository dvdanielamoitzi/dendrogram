import React, { useCallback } from "react";
import { Graphics } from "@inlet/react-pixi";

export function Circle({ x, y }: { x: number; y: number }) {
  const draw = useCallback(
    (g) => {
      g.beginFill(0x000000, 1);
      g.drawCircle(x, y, 3);
      g.endFill();
    },
    [x, y]
  );

  return <Graphics draw={draw} />;
}
