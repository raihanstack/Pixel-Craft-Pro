import React from 'react';
import { 
  MousePointer2, 
  Pencil, 
  Square, 
  Circle as CircleIcon, 
  Type, 
  Eraser, 
  Crop,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Trash2
} from 'lucide-react';
import { ToolType } from '../types';
import { cn } from '../lib/utils';

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  onUndo,
  onRedo,
  onDelete,
  onImageUpload
}) => {
  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select (V)' },
    { id: 'brush', icon: Pencil, label: 'Brush (B)' },
    { id: 'rectangle', icon: Square, label: 'Rectangle (R)' },
    { id: 'circle', icon: CircleIcon, label: 'Circle (C)' },
    { id: 'text', icon: Type, label: 'Text (T)' },
    { id: 'eraser', icon: Eraser, label: 'Eraser (E)' },
    { id: 'crop', icon: Crop, label: 'Crop (K)' },
  ];

  return (
    <div className="w-12 bg-[#252526] border-r border-[#3c3c3c] flex flex-col items-center py-4 gap-4">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(tool.id as ToolType)}
          className={cn(
            "p-2 rounded-md transition-colors group relative",
            activeTool === tool.id ? "bg-[#0078d4] text-white" : "text-[#cccccc] hover:bg-[#37373d]"
          )}
          title={tool.label}
        >
          <tool.icon size={20} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-[#1e1e1e] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
            {tool.label}
          </span>
        </button>
      ))}

      <div className="h-px w-8 bg-[#3c3c3c] my-2" />

      <label className="p-2 rounded-md text-[#cccccc] hover:bg-[#37373d] cursor-pointer group relative">
        <ImageIcon size={20} />
        <input type="file" className="hidden" accept="image/*" onChange={onImageUpload} />
        <span className="absolute left-full ml-2 px-2 py-1 bg-[#1e1e1e] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
          Import Image
        </span>
      </label>

      <button onClick={onUndo} className="p-2 rounded-md text-[#cccccc] hover:bg-[#37373d] group relative">
        <Undo2 size={20} />
        <span className="absolute left-full ml-2 px-2 py-1 bg-[#1e1e1e] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
          Undo (Ctrl+Z)
        </span>
      </button>

      <button onClick={onRedo} className="p-2 rounded-md text-[#cccccc] hover:bg-[#37373d] group relative">
        <Redo2 size={20} />
        <span className="absolute left-full ml-2 px-2 py-1 bg-[#1e1e1e] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
          Redo (Ctrl+Y)
        </span>
      </button>

      <button onClick={onDelete} className="p-2 rounded-md text-[#cccccc] hover:bg-[#37373d] hover:text-red-400 group relative">
        <Trash2 size={20} />
        <span className="absolute left-full ml-2 px-2 py-1 bg-[#1e1e1e] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
          Delete (Del/Backspace)
        </span>
      </button>
    </div>
  );
};
