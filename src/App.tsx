import React, { useState, useRef, useEffect } from 'react';
import * as fabric from 'fabric';
import { TopBar } from './components/TopBar';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { ToolType, Layer } from './types';
import { GoogleGenAI } from "@google/genai";

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [color, setColor] = useState('#0078d4');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [clipboard, setClipboard] = useState<fabric.Object | null>(null);
  
  const canvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current && historyIndex === -1) {
      saveState();
    }
  }, [canvasRef.current]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.set('backgroundColor', bgColor);
      canvasRef.current.renderAll();
      saveState();
    }
  }, [bgColor]);

  // Undo/Redo Logic
  const saveState = () => {
    if (!canvasRef.current) return;
    const json = JSON.stringify(canvasRef.current.toJSON(['id', 'name', 'locked']));
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    if (newHistory.length > 50) newHistory.shift(); // Limit history
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0 && canvasRef.current) {
      const prevIndex = historyIndex - 1;
      const state = history[prevIndex];
      canvasRef.current.loadFromJSON(state).then(() => {
        canvasRef.current?.renderAll();
        setHistoryIndex(prevIndex);
      });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && canvasRef.current) {
      const nextIndex = historyIndex + 1;
      const state = history[nextIndex];
      canvasRef.current.loadFromJSON(state).then(() => {
        canvasRef.current?.renderAll();
        setHistoryIndex(nextIndex);
      });
    }
  };

  // Copy/Paste Logic
  const handleCopy = async () => {
    if (!canvasRef.current) return;
    const activeObject = canvasRef.current.getActiveObject();
    if (activeObject) {
      const cloned = await activeObject.clone(['id', 'name', 'locked']);
      setClipboard(cloned);
    }
  };

  const handlePaste = async () => {
    if (!canvasRef.current || !clipboard) return;
    const clonedObj = await clipboard.clone(['id', 'name', 'locked']);
    canvasRef.current.discardActiveObject();
    clonedObj.set({
      left: (clonedObj.left || 0) + 20,
      top: (clonedObj.top || 0) + 20,
      evented: true,
    });
    if (clonedObj instanceof fabric.ActiveSelection) {
      clonedObj.canvas = canvasRef.current;
      clonedObj.forEachObject((obj) => {
        canvasRef.current?.add(obj);
      });
      clonedObj.setCoords();
    } else {
      canvasRef.current.add(clonedObj);
    }
    setClipboard(clonedObj);
    canvasRef.current.setActiveObject(clonedObj);
    canvasRef.current.requestRenderAll();
    saveState();
  };

  const handleCut = async () => {
    await handleCopy();
    handleDelete();
  };

  // Zoom Logic
  const handleZoom = (delta: number) => {
    if (!canvasRef.current) return;
    let zoom = canvasRef.current.getZoom();
    zoom *= delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvasRef.current.setZoom(zoom);
    canvasRef.current.renderAll();
  };

  const resetZoom = () => {
    if (!canvasRef.current) return;
    canvasRef.current.setZoom(1);
    canvasRef.current.renderAll();
  };

  const handleDelete = () => {
    if (canvasRef.current && selectedObject) {
      canvasRef.current.remove(selectedObject);
      canvasRef.current.discardActiveObject();
      canvasRef.current.renderAll();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvasRef.current) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      fabric.Image.fromURL(data).then((img) => {
        img.scaleToWidth(400);
        canvasRef.current?.add(img);
        canvasRef.current?.centerObject(img);
        canvasRef.current?.setActiveObject(img);
        canvasRef.current?.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    if (canvasRef.current && window.confirm('Are you sure you want to clear the canvas?')) {
      canvasRef.current.clear();
      canvasRef.current.set('backgroundColor', bgColor);
      canvasRef.current.renderAll();
    }
  };

  const handleResize = (width: number, height: number) => {
    if (!canvasRef.current) return;
    
    // Calculate scale to fit in the container
    const container = document.querySelector('.canvas-container')?.parentElement;
    if (!container) return;
    
    const containerWidth = container.clientWidth - 64;
    const containerHeight = container.clientHeight - 64;
    
    const scale = Math.min(containerWidth / width, containerHeight / height);
    
    canvasRef.current.setDimensions({
      width: width * scale,
      height: height * scale,
    });
    
    // We might want to zoom the canvas instead of just resizing it
    canvasRef.current.setZoom(scale);
    canvasRef.current.renderAll();
  };

  const handleExport = () => {
    if (!canvasRef.current) return;
    const dataURL = canvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
    });
    const link = document.createElement('a');
    link.download = 'pixelcraft-export.png';
    link.href = dataURL;
    link.click();
  };

  const handleApplyFilter = (filterType: string, value?: any) => {
    if (!canvasRef.current || !selectedObject || selectedObject.type !== 'image') return;
    
    const img = selectedObject as fabric.Image;
    if (filterType === 'Reset') {
      img.filters = [];
    } else {
      let filter;
      switch (filterType) {
        case 'Grayscale': filter = new fabric.filters.Grayscale(); break;
        case 'Sepia': filter = new fabric.filters.Sepia(); break;
        case 'Invert': filter = new fabric.filters.Invert(); break;
        case 'Blur': filter = new fabric.filters.Blur({ blur: value || 0.1 }); break;
        case 'Brightness': filter = new fabric.filters.Brightness({ brightness: value || 0.1 }); break;
        case 'Contrast': filter = new fabric.filters.Contrast({ contrast: value || 0.1 }); break;
      }
      
      if (filter) {
        // Remove existing filter of same type if it exists
        img.filters = img.filters?.filter(f => f.type !== filter.type) || [];
        img.filters.push(filter);
      }
    }
    
    img.applyFilters();
    canvasRef.current.renderAll();
  };

  const handleRemoveBackground = async () => {
    if (!canvasRef.current || !selectedObject || selectedObject.type !== 'image') return;
    setIsProcessing(true);

    try {
      const img = selectedObject as fabric.Image;
      const dataURL = img.toDataURL({ format: 'png' });
      const base64Data = dataURL.split(',')[1];

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/png',
              },
            },
            {
              text: 'Remove the background from this image. Return ONLY the subject with a transparent background. If transparency is not possible, return the subject on a pure white background.',
            },
          ],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const newBase64 = part.inlineData.data;
          const newImageUrl = `data:image/png;base64,${newBase64}`;
          
          fabric.Image.fromURL(newImageUrl).then((newImg) => {
            newImg.set({
              left: img.left,
              top: img.top,
              scaleX: img.scaleX,
              scaleY: img.scaleY,
              angle: img.angle,
            });
            canvasRef.current?.remove(img);
            canvasRef.current?.add(newImg);
            canvasRef.current?.setActiveObject(newImg);
            canvasRef.current?.renderAll();
          });
        }
      }
    } catch (error) {
      console.error('AI Error:', error);
      alert('Background removal failed. AI model might be busy or image is too complex.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddElement = (type: string) => {
    if (!canvasRef.current) return;
    
    let element: fabric.Object | null = null;
    const commonProps = {
      left: 100,
      top: 100,
      fill: color,
      stroke: color,
      strokeWidth: 0,
    };

    switch (type) {
      case 'rect':
        element = new fabric.Rect({ ...commonProps, width: 100, height: 100 });
        break;
      case 'circle':
        element = new fabric.Circle({ ...commonProps, radius: 50 });
        break;
      case 'triangle':
        element = new fabric.Triangle({ ...commonProps, width: 100, height: 100 });
        break;
      case 'star':
        // Custom star shape using Path
        element = new fabric.Path('M 128 0 L 168 80 L 256 93 L 192 155 L 207 243 L 128 202 L 49 243 L 64 155 L 0 93 L 88 80 L 128 0 Z', {
          ...commonProps,
          scaleX: 0.4,
          scaleY: 0.4,
        });
        break;
      case 'heart':
        element = new fabric.Path('M 272 8 C 234 8 201 30 184 64 C 167 30 134 8 96 8 C 43 8 0 51 0 104 C 0 165 56 216 140 292 L 184 332 L 228 292 C 312 216 368 165 368 104 C 368 51 325 8 272 8 Z', {
          ...commonProps,
          scaleX: 0.3,
          scaleY: 0.3,
        });
        break;
    }

    if (element) {
      canvasRef.current.add(element);
      canvasRef.current.setActiveObject(element);
      canvasRef.current.renderAll();
    }
  };

  const handleAISuggest = async () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);

    try {
      const dataURL = canvasRef.current.toDataURL({ format: 'png' });
      const base64Data = dataURL.split(',')[1];

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/png',
              },
            },
            {
              text: 'Enhance this image or add creative elements. If it is empty, generate a beautiful artistic background.',
            },
          ],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const newBase64 = part.inlineData.data;
          const newImageUrl = `data:image/png;base64,${newBase64}`;
          
          fabric.Image.fromURL(newImageUrl).then((img) => {
            canvasRef.current?.clear();
            if (canvasRef.current) {
              canvasRef.current.set('backgroundColor', '#ffffff');
            }
            img.scaleToWidth(canvasRef.current?.width || 800);
            canvasRef.current?.add(img);
            canvasRef.current?.centerObject(img);
            canvasRef.current?.renderAll();
          });
        }
      }
    } catch (error) {
      console.error('AI Error:', error);
      alert('AI processing failed. Please check your API key and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleVisibility = (id: string) => {
    const obj = canvasRef.current?.getObjects().find((o: any) => o.id === id);
    if (obj) {
      obj.visible = !obj.visible;
      canvasRef.current?.renderAll();
      // Trigger layers update
      setLayers([...layers]); 
    }
  };

  const toggleLock = (id: string) => {
    const obj = canvasRef.current?.getObjects().find((o: any) => o.id === id);
    if (obj) {
      const isLocked = !obj.lockMovementX;
      obj.set({
        lockMovementX: isLocked,
        lockMovementY: isLocked,
        lockRotation: isLocked,
        lockScalingX: isLocked,
        lockScalingY: isLocked,
      });
      canvasRef.current?.renderAll();
      setLayers([...layers]);
    }
  };

  const selectLayer = (id: string) => {
    const obj = canvasRef.current?.getObjects().find((o: any) => o.id === id);
    if (obj) {
      canvasRef.current?.setActiveObject(obj);
      canvasRef.current?.renderAll();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const isCtrl = e.ctrlKey || e.metaKey;
      const step = e.shiftKey ? 10 : 1;

      if (isCtrl) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) handleRedo();
            else handleUndo();
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 'c':
            e.preventDefault();
            handleCopy();
            break;
          case 'v':
            e.preventDefault();
            handlePaste();
            break;
          case 'x':
            e.preventDefault();
            handleCut();
            break;
          case 'a':
            e.preventDefault();
            if (canvasRef.current) {
              canvasRef.current.discardActiveObject();
              const sel = new fabric.ActiveSelection(canvasRef.current.getObjects(), {
                canvas: canvasRef.current,
              });
              canvasRef.current.setActiveObject(sel);
              canvasRef.current.requestRenderAll();
            }
            break;
          case 's':
            e.preventDefault();
            handleExport();
            break;
          case '=':
          case '+':
            e.preventDefault();
            handleZoom(1.1);
            break;
          case '-':
            e.preventDefault();
            handleZoom(0.9);
            break;
          case '0':
            e.preventDefault();
            resetZoom();
            break;
        }
      } else {
        switch (e.key.toLowerCase()) {
          case 'v': setActiveTool('select'); break;
          case 'b': setActiveTool('brush'); break;
          case 'r': setActiveTool('rectangle'); break;
          case 'c': setActiveTool('circle'); break;
          case 't': setActiveTool('text'); break;
          case 'e': setActiveTool('eraser'); break;
          case 'k': setActiveTool('crop'); break;
          case '[':
            setStrokeWidth(prev => Math.max(1, prev - 1));
            break;
          case ']':
            setStrokeWidth(prev => Math.min(100, prev + 1));
            break;
          case 'delete':
          case 'backspace':
            handleDelete();
            break;
          case 'arrowleft':
            if (selectedObject) {
              selectedObject.set('left', (selectedObject.left || 0) - step);
              canvasRef.current?.renderAll();
              saveState();
            }
            break;
          case 'arrowright':
            if (selectedObject) {
              selectedObject.set('left', (selectedObject.left || 0) + step);
              canvasRef.current?.renderAll();
              saveState();
            }
            break;
          case 'arrowup':
            if (selectedObject) {
              selectedObject.set('top', (selectedObject.top || 0) - step);
              canvasRef.current?.renderAll();
              saveState();
            }
            break;
          case 'arrowdown':
            if (selectedObject) {
              selectedObject.set('top', (selectedObject.top || 0) + step);
              canvasRef.current?.renderAll();
              saveState();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObject, clipboard, historyIndex, history, bgColor]);

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] select-none">
      <TopBar 
        onExport={handleExport} 
        onClear={handleClear}
        onResize={handleResize}
        onAISuggest={handleAISuggest} 
        isProcessing={isProcessing} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Toolbar 
          activeTool={activeTool} 
          setActiveTool={setActiveTool}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onDelete={handleDelete}
          onImageUpload={handleImageUpload}
        />
        
        <Canvas 
          activeTool={activeTool}
          color={color}
          strokeWidth={strokeWidth}
          onLayersUpdate={setLayers}
          onObjectSelected={setSelectedObject}
          onStateChange={saveState}
          canvasRef={canvasRef}
        />
        
        <Sidebar 
          color={color}
          setColor={setColor}
          bgColor={bgColor}
          setBgColor={setBgColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          layers={layers}
          onToggleVisibility={toggleVisibility}
          onToggleLock={toggleLock}
          onSelectLayer={selectLayer}
          selectedObject={selectedObject}
          onApplyFilter={handleApplyFilter}
          onRemoveBackground={handleRemoveBackground}
          isProcessing={isProcessing}
          onAddElement={handleAddElement}
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#0078d4] text-white text-[10px] flex items-center px-3 justify-between">
        <div className="flex gap-4">
          <span>Tool: {activeTool.toUpperCase()}</span>
          <span>Layers: {layers.length}</span>
        </div>
        <div className="flex gap-4">
          <span>{selectedObject ? `Selected: ${selectedObject.type}` : 'No selection'}</span>
          <span>100% Zoom</span>
        </div>
      </div>
    </div>
  );
}
