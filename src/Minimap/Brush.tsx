/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import { useCallback, useState } from 'react';

export function Brush({
  x,
  y,
  width,
  height,
  onBrush,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  onBrush: (xStart: number, xEnd: number) => void;
}) {
  const [brushWidth, setBrushWidth] = useState<number>(0);
  const [brushStart, setBrushStart] = useState<number>(0);
  const [brushX1, setBrushX1] = useState<number>(0);
  const [brushX2, setBrushX2] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDraggingBrush, setIsDraggingBrush] = useState<boolean>(false);
  const [brushX1OnDragStart, setBrushX1OnDragStart] = useState<number>(0);
  const [brushX2OnDragStart, setBrushX2OnDragStart] = useState<number>(0);

  const [isMoving, setIsMoving] = useState<boolean>(false);

  const _setBrushX1 = useCallback((x1: number) => {
    if (x1 < 0) {
      setBrushX1(0);
    } else {
      setBrushX1(x1);
    }
  }, []);

  const _setBrushX2 = useCallback((x2: number) => {
    if (x2 < 0) {
      setBrushX2(0);
    } else {
      setBrushX2(x2);
    }
  }, []);
  const onMouseDown = useCallback(
    (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
      setBrushWidth(0);
      setIsDragging(true);
      setIsMoving(false);
      setBrushStart(e.clientX); // clientX is a problem --> use getboundingclientrect instead
      _setBrushX1(e.clientX);
      _setBrushX2(e.clientX);
    },
    [_setBrushX1, _setBrushX2],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
      if (isDragging) {
        if (Math.abs(brushStart - e.clientX) < 5) return;
        setIsMoving(true);
        if (e.clientX < brushX2) {
          setBrushX1(e.clientX);
        } else {
          setBrushX2(e.clientX);
        }
        // setBrushWidth(Math.abs(e.clientX - brushStart));
        // onBrush(brushX1, brushX2);
      } else if (isDraggingBrush) {
        if (Math.abs(brushStart - e.clientX) < 5) return;
        setIsMoving(true);
        _setBrushX1(e.clientX - brushStart + brushX1OnDragStart);
        _setBrushX2(e.clientX - brushStart + brushX2OnDragStart);
      }
    },
    [isDragging, isDraggingBrush, brushStart, brushX2, _setBrushX1, brushX1OnDragStart, _setBrushX2, brushX2OnDragStart],
  );

  const onBrushClick = useCallback(
    (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
      setIsDraggingBrush(true);
      setBrushX1OnDragStart(brushX1);
      setBrushX2OnDragStart(brushX2);
      setBrushStart(e.clientX);
    },
    [brushX1, brushX2],
  );

  const onScroll = useCallback(
    (e: React.WheelEvent<SVGRectElement>) => {
      e.preventDefault();
      e.stopPropagation();
      _setBrushX1(brushX1 - e.deltaY / 10);
      _setBrushX2(brushX2 + e.deltaY / 10);
    },
    [brushX1, brushX2, _setBrushX1, _setBrushX2],
  );

  React.useEffect(() => {
    onBrush(brushX1, brushX2);
  }, [brushX1, brushX2, onBrush]);

  const onMouseUp = useCallback(() => {
    if (!isMoving) {
      setBrushX1(null);
      setBrushX2(null);
    }
    setIsDragging(false);
    setIsDraggingBrush(false);
    setIsMoving(false);
  }, [isMoving]);

  return (
    <>
      <rect width={width} height={height} opacity="0" fill="white" onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} />
      <rect
        width={brushX2 - brushX1}
        height={height}
        x={brushX1}
        opacity=".2"
        fill="black"
        onMouseDown={onBrushClick}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onWheel={onScroll}
      />
    </>
  );
}
