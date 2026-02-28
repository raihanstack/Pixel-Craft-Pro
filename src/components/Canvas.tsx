import React, { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { ToolType } from '../types';

interface CanvasProps {
  activeTool: ToolType;
  color: string;
  strokeWidth: number;
  onLayersUpdate: (layers: any[]) => void;
  onObjectSelected: (obj: fabric.Object | null) => void;
  onStateChange: () => void;
  canvasRef: React.MutableRefObject<fabric.Canvas | null>;
}

export const Canvas: React.FC<CanvasProps> = ({
  activeTool,
  color,
  strokeWidth,
  onLayersUpdate,
  onObjectSelected,
  onStateChange,
  canvasRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = new fabric.Canvas('main-canvas', {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;
    canvasRef.current = canvas;

    const updateLayers = () => {
      const objects = canvas.getObjects().map((obj: any, index) => ({
        id: obj.id || `layer-${index}`,
        name: obj.name || `${obj.type} ${index + 1}`,
        type: obj.type,
        visible: obj.visible,
        locked: obj.lockMovementX,
      }));
      onLayersUpdate(objects.reverse());
    };

    canvas.on('object:added', () => {
      updateLayers();
      onStateChange();
    });
    canvas.on('object:removed', () => {
      updateLayers();
      onStateChange();
    });
    canvas.on('object:modified', onStateChange);
    canvas.on('selection:created', (e) => onObjectSelected(e.selected[0]));
    canvas.on('selection:updated', (e) => onObjectSelected(e.selected[0]));
    canvas.on('selection:cleared', () => onObjectSelected(null));

    const handleResize = () => {
      if (containerRef.current) {
        canvas.setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
        canvas.renderAll();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === 'brush' || activeTool === 'eraser';
    
    if (canvas.isDrawingMode) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = activeTool === 'eraser' ? '#ffffff' : color;
      canvas.freeDrawingBrush.width = strokeWidth;
    }

    // Tool logic
    const handleMouseDown = (options: fabric.TPointerEventInfo) => {
      if (activeTool === 'select' || canvas.isDrawingMode) return;

      const pointer = canvas.getScenePoint(options.e);
      let newObj: fabric.Object | null = null;

      if (activeTool === 'rectangle') {
        newObj = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          fill: color,
          width: 2,
          height: 2,
          stroke: color,
          strokeWidth: 0,
        });
      } else if (activeTool === 'circle') {
        newObj = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          fill: color,
          radius: 1,
          stroke: color,
          strokeWidth: 0,
        });
      } else if (activeTool === 'text') {
        newObj = new fabric.IText('Double click to edit', {
          left: pointer.x,
          top: pointer.y,
          fill: color,
          fontSize: 20,
        });
        canvas.add(newObj);
        canvas.setActiveObject(newObj);
        return;
      }

      if (newObj) {
        canvas.add(newObj);
        canvas.setActiveObject(newObj);
        
        const onMouseMove = (moveOpts: fabric.TPointerEventInfo) => {
          const movePointer = canvas.getScenePoint(moveOpts.e);
          if (activeTool === 'rectangle' && newObj instanceof fabric.Rect) {
            newObj.set({
              width: Math.abs(pointer.x - movePointer.x),
              height: Math.abs(pointer.y - movePointer.y),
              left: Math.min(pointer.x, movePointer.x),
              top: Math.min(pointer.y, movePointer.y),
            });
          } else if (activeTool === 'circle' && newObj instanceof fabric.Circle) {
            const radius = Math.sqrt(
              Math.pow(pointer.x - movePointer.x, 2) + Math.pow(pointer.y - movePointer.y, 2)
            );
            newObj.set({ radius });
          }
          canvas.renderAll();
        };

        const onMouseUp = () => {
          canvas.off('mouse:move', onMouseMove);
          canvas.off('mouse:up', onMouseUp);
        };

        canvas.on('mouse:move', onMouseMove);
        canvas.on('mouse:up', onMouseUp);
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    return () => {
      canvas.off('mouse:down', handleMouseDown);
    };
  }, [activeTool, color, strokeWidth]);

  return (
    <div ref={containerRef} className="flex-1 bg-[#121212] flex items-center justify-center p-8 overflow-hidden relative">
      <div className="canvas-container bg-white">
        <canvas id="main-canvas" />
      </div>
    </div>
  );
};
