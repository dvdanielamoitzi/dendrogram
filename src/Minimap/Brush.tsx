/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import { useCallback, useState, useRef } from 'react';
import * as d3 from 'd3v7';
import { useEvent } from 'visyn_core';

export function Brush({
  width,
  height,
  onBrushX1,
  onBrushX2,
  brushX1,
  brushX2,
}: {
  width: number;
  height: number;
  onBrushX1: (brushStart: number) => void;
  onBrushX2: (brushEnd: number) => void;
  // brushedArea: [number, number];
  brushX1: number;
  brushX2: number;
}) {
  // const [brushWidth, setBrushWidth] = useState<number>(0);
  const brushRef = useRef<SVGRectElement>(null);
  const [brushStart, setBrushStart] = useState<number>(0);
  // const [brushX1, setBrushX1] = useState<number>(0);
  // const [brushX2, setBrushX2] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDraggingBrush, setIsDraggingBrush] = useState<boolean>(false);
  const [brushX1OnDragStart, setBrushX1OnDragStart] = useState<number>(0);
  const [brushX2OnDragStart, setBrushX2OnDragStart] = useState<number>(0);

  const [isMoving, setIsMoving] = useState<boolean>(false);

  const _setBrushX1 = useCallback(
    (x1: number) => {
      if (x1 < 0) {
        onBrushX1(0);
      } else {
        onBrushX1(x1);
      }
    },
    [onBrushX1],
  );

  const _setBrushX2 = useCallback(
    (x2: number) => {
      if (x2 > width) {
        onBrushX2(width);
      } else {
        onBrushX2(x2);
      }
    },
    [onBrushX2, width],
  );

  const onMouseMove = useEvent((e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    if (Math.abs(brushStart - e.clientX) < 5) return;

    if (isDragging) {
      setIsMoving(true);
      if (e.clientX < brushStart) {
        _setBrushX1(e.clientX);
        _setBrushX2(brushStart);
      } else {
        _setBrushX1(brushStart);
        _setBrushX2(e.clientX);
      }
      // setBrushWidth(Math.abs(e.clientX - brushStart));
      // onBrush(brushX1, brushX2);
    } else if (isDraggingBrush) {
      if (e.clientX - brushStart + brushX1OnDragStart < 0) {
        _setBrushX1(0);
        _setBrushX2(brushX2OnDragStart - brushX1OnDragStart);
        return;
      }
      if (e.clientX - brushStart + brushX2OnDragStart > width) {
        _setBrushX1(width - (brushX2OnDragStart - brushX1OnDragStart));
        _setBrushX2(width);
        return;
      }

      setIsMoving(true);
      _setBrushX1(e.clientX - brushStart + brushX1OnDragStart);
      _setBrushX2(e.clientX - brushStart + brushX2OnDragStart);
    }
  });

  const onScroll = useCallback(
    (e: React.WheelEvent<SVGRectElement>) => {
      e.stopPropagation();
      _setBrushX1(brushX1 - e.deltaY / 10);
      _setBrushX2(brushX2 + e.deltaY / 10);
    },
    [_setBrushX1, brushX1, _setBrushX2, brushX2],
  );

  const onMouseUp = useEvent(() => {
    if (!isMoving) {
      _setBrushX1(null);
      _setBrushX2(null);
    }

    d3.select(window).on('mousemove', null).on('mouseup', null);

    setIsDragging(false);
    setIsDraggingBrush(false);
    setIsMoving(false);
  });

  const onMouseDown = useCallback(
    (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
      // setBrushWidth(0);

      setIsDragging(true);
      setIsMoving(false);
      setBrushStart(e.clientX); // clientX is a problem --> use getboundingclientrect instead
      // _setBrushX1(e.clientX);
      // _setBrushX2(e.clientX);
      d3.select(window).on('mousemove', onMouseMove).on('mouseup', onMouseUp);
    },
    [_setBrushX1, _setBrushX2, onMouseMove, onMouseUp],
  );

  const onBrushClick = useCallback(
    (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
      setIsDraggingBrush(true);
      setBrushX1OnDragStart(brushX1);
      setBrushX2OnDragStart(brushX2);
      setBrushStart(e.clientX);
      d3.select(window).on('mousemove', onMouseMove).on('mouseup', onMouseUp);
    },
    [brushX1, brushX2, onMouseMove, onMouseUp],
  );

  return (
    <>
      <rect ref={brushRef} width={width} height={height} opacity="0" fill="white" onMouseDown={onMouseDown} />
      <rect width={(brushX2 || 0) - (brushX1 || 0)} height={height} x={brushX1 || 0} opacity=".2" fill="black" onMouseDown={onBrushClick} onWheel={onScroll} />
    </>
  );
}
