import React, { useState } from 'react';
import { ChromePicker } from 'react-color';
import { 
  Settings2, 
  Layers, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Palette, 
  Shapes, 
  Filter,
  Image as ImageIcon,
  Wand2,
  Maximize2,
  Type
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SidebarTab } from '../types';
import * as fabric from 'fabric';

interface SidebarProps {
  color: string;
  setColor: (color: string) => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  layers: any[];
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onSelectLayer: (id: string) => void;
  selectedObject: fabric.Object | null;
  onApplyFilter: (filterType: string, value?: any) => void;
  onRemoveBackground: () => void;
  isProcessing: boolean;
  onAddElement: (type: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  color,
  setColor,
  bgColor,
  setBgColor,
  strokeWidth,
  setStrokeWidth,
  layers,
  onToggleVisibility,
  onToggleLock,
  onSelectLayer,
  selectedObject,
  onApplyFilter,
  onRemoveBackground,
  isProcessing,
  onAddElement
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('properties');

  const tabs = [
    { id: 'properties', icon: Settings2, label: 'Props' },
    { id: 'elements', icon: Shapes, label: 'Elements' },
    { id: 'filters', icon: Filter, label: 'Filters' },
    { id: 'layers', icon: Layers, label: 'Layers' },
  ];

  const filterList = [
    { id: 'Grayscale', label: 'Grayscale' },
    { id: 'Sepia', label: 'Sepia' },
    { id: 'Invert', label: 'Invert' },
    { id: 'Blur', label: 'Blur', hasValue: true, min: 0, max: 1, step: 0.1 },
    { id: 'Brightness', label: 'Brightness', hasValue: true, min: -1, max: 1, step: 0.1 },
    { id: 'Contrast', label: 'Contrast', hasValue: true, min: -1, max: 1, step: 0.1 },
  ];

  const elements = [
    { id: 'rect', label: 'Rectangle', icon: Shapes },
    { id: 'circle', label: 'Circle', icon: Shapes },
    { id: 'triangle', label: 'Triangle', icon: Shapes },
    { id: 'star', label: 'Star', icon: Shapes },
    { id: 'heart', label: 'Heart', icon: Shapes },
  ];

  return (
    <div className="w-72 bg-[#252526] border-l border-[#3c3c3c] flex flex-col overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#3c3c3c]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SidebarTab)}
            className={cn(
              "flex-1 py-3 flex flex-col items-center gap-1 transition-colors border-b-2",
              activeTab === tab.id 
                ? "text-[#0078d4] border-[#0078d4] bg-[#2d2d2d]" 
                : "text-[#888888] border-transparent hover:text-[#cccccc] hover:bg-[#2d2d2d]"
            )}
          >
            <tab.icon size={18} />
            <span className="text-[10px] uppercase font-bold tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#888888] uppercase tracking-widest">Global Settings</h3>
              <div>
                <label className="block text-[10px] text-[#666666] mb-2 uppercase">Canvas Background</label>
                <div className="flex justify-center">
                  <ChromePicker 
                    color={bgColor} 
                    onChange={(c) => setBgColor(c.hex)}
                    disableAlpha
                    styles={{
                      default: {
                        picker: {
                          background: '#333333',
                          boxShadow: 'none',
                          border: '1px solid #444444',
                          width: '100%'
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#666666] mb-2 uppercase">Primary Color</label>
                <div className="flex justify-center">
                  <ChromePicker 
                    color={color} 
                    onChange={(c) => setColor(c.hex)}
                    disableAlpha
                    styles={{
                      default: {
                        picker: {
                          background: '#333333',
                          boxShadow: 'none',
                          border: '1px solid #444444',
                          width: '100%'
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#666666] mb-2 uppercase flex justify-between">
                  Brush / Stroke Width
                  <span>{strokeWidth}px</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                  className="w-full accent-[#0078d4]"
                />
              </div>
            </div>

            {selectedObject && (
              <div className="pt-6 border-t border-[#3c3c3c] space-y-4">
                <h3 className="text-xs font-bold text-[#0078d4] uppercase tracking-widest flex items-center gap-2">
                  <Settings2 size={14} />
                  Selection: {selectedObject.type}
                </h3>
                
                {selectedObject.type === 'image' && (
                  <button
                    onClick={onRemoveBackground}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Wand2 size={14} />
                    )}
                    Remove Background (AI)
                  </button>
                )}

                {selectedObject.type === 'i-text' && (
                  <div className="bg-[#333333] p-3 rounded border border-[#444444] space-y-3">
                    <span className="block text-[10px] text-[#666666] uppercase font-bold">Text Settings</span>
                    <div>
                      <label className="block text-[9px] text-[#888888] mb-1">Font Size</label>
                      <input 
                        type="range" 
                        min="10" 
                        max="200" 
                        defaultValue={(selectedObject as fabric.IText).fontSize}
                        onChange={(e) => {
                          (selectedObject as fabric.IText).set('fontSize', parseInt(e.target.value));
                          selectedObject.canvas?.renderAll();
                        }}
                        className="w-full accent-[#0078d4]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#888888] mb-1">Font Family</label>
                      <select 
                        className="w-full bg-[#1e1e1e] border border-[#444444] text-[#cccccc] text-[11px] p-1 rounded"
                        onChange={(e) => {
                          (selectedObject as fabric.IText).set('fontFamily', e.target.value);
                          selectedObject.canvas?.renderAll();
                        }}
                      >
                        <option value="Inter">Inter</option>
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      selectedObject.bringToFront();
                      selectedObject.canvas?.renderAll();
                    }}
                    className="flex items-center justify-center gap-2 py-2 bg-[#333333] hover:bg-[#444444] text-white rounded text-[10px] font-bold border border-[#444444]"
                  >
                    Bring to Front
                  </button>
                  <button
                    onClick={() => {
                      selectedObject.sendToBack();
                      selectedObject.canvas?.renderAll();
                    }}
                    className="flex items-center justify-center gap-2 py-2 bg-[#333333] hover:bg-[#444444] text-white rounded text-[10px] font-bold border border-[#444444]"
                  >
                    Send to Back
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#333333] p-2 rounded border border-[#444444]">
                    <span className="block text-[9px] text-[#666666] uppercase">Opacity</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      defaultValue={selectedObject.opacity}
                      onChange={(e) => {
                        selectedObject.set('opacity', parseFloat(e.target.value));
                        selectedObject.canvas?.renderAll();
                      }}
                      className="w-full accent-[#0078d4]"
                    />
                  </div>
                  <div className="bg-[#333333] p-2 rounded border border-[#444444]">
                    <span className="block text-[9px] text-[#666666] uppercase">Rotation</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="360" 
                      defaultValue={selectedObject.angle}
                      onChange={(e) => {
                        selectedObject.set('angle', parseInt(e.target.value));
                        selectedObject.canvas?.renderAll();
                      }}
                      className="w-full accent-[#0078d4]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Elements Tab */}
        {activeTab === 'elements' && (
          <div className="p-4">
            <h3 className="text-xs font-bold text-[#888888] mb-4 uppercase tracking-widest">Shapes & Elements</h3>
            <div className="grid grid-cols-3 gap-2">
              {elements.map((el) => (
                <button
                  key={el.id}
                  onClick={() => onAddElement(el.id)}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-[#333333] hover:bg-[#3c3c3c] rounded border border-[#444444] transition-colors group"
                >
                  <el.icon size={20} className="text-[#888888] group-hover:text-white" />
                  <span className="text-[9px] text-[#666666] group-hover:text-[#cccccc] uppercase truncate w-full text-center">
                    {el.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters Tab */}
        {activeTab === 'filters' && (
          <div className="p-4 space-y-4">
            <h3 className="text-xs font-bold text-[#888888] mb-4 uppercase tracking-widest">Image Filters</h3>
            {!selectedObject || selectedObject.type !== 'image' ? (
              <div className="text-center py-12 text-[#555555] text-xs italic">
                Select an image to apply filters
              </div>
            ) : (
              <div className="space-y-2">
                {filterList.map((f) => (
                  <div key={f.id} className="bg-[#333333] p-3 rounded border border-[#444444] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#cccccc] font-medium">{f.label}</span>
                      <button
                        onClick={() => onApplyFilter(f.id)}
                        className="px-2 py-1 bg-[#0078d4] hover:bg-[#0086ed] text-white text-[9px] rounded uppercase font-bold"
                      >
                        Apply
                      </button>
                    </div>
                    {f.hasValue && (
                      <input 
                        type="range" 
                        min={f.min} 
                        max={f.max} 
                        step={f.step} 
                        defaultValue={0}
                        onChange={(e) => onApplyFilter(f.id, parseFloat(e.target.value))}
                        className="w-full accent-[#0078d4]"
                      />
                    )}
                  </div>
                ))}
                <button
                  onClick={() => onApplyFilter('Reset')}
                  className="w-full py-2 mt-4 bg-[#444444] hover:bg-[#555555] text-white text-[10px] rounded uppercase font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Layers Tab */}
        {activeTab === 'layers' && (
          <div className="p-4 flex flex-col min-h-0">
            <h3 className="text-xs font-bold text-[#888888] mb-4 uppercase tracking-widest">Layers Stack</h3>
            <div className="space-y-1">
              {layers.length === 0 ? (
                <div className="text-center py-12 text-[#555555] text-xs italic">
                  No layers yet
                </div>
              ) : (
                layers.map((layer) => (
                  <div 
                    key={layer.id}
                    onClick={() => onSelectLayer(layer.id)}
                    className={cn(
                      "group flex items-center gap-2 px-3 py-2 rounded transition-all cursor-pointer border",
                      selectedObject && (selectedObject as any).id === layer.id
                        ? "bg-[#0078d4]/20 border-[#0078d4] text-white"
                        : "bg-[#333333] hover:bg-[#3c3c3c] border-transparent text-[#cccccc]"
                    )}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
                      className="text-[#888888] hover:text-white"
                    >
                      {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id); }}
                      className="text-[#888888] hover:text-white"
                    >
                      {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                    <span className="flex-1 text-[11px] truncate">
                      {layer.name}
                    </span>
                    <span className="text-[9px] text-[#666666] uppercase font-mono">
                      {layer.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
