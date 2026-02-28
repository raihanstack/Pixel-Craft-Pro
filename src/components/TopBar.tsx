import React, { useState } from 'react';
import { Sparkles, Download, Save, FileImage, Wand2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface TopBarProps {
  onExport: () => void;
  onClear: () => void;
  onAISuggest: () => void;
  onResize: (width: number, height: number) => void;
  isProcessing: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onExport, onClear, onAISuggest, onResize, isProcessing }) => {
  const resizeOptions = [
    { label: 'IG Post', w: 1080, h: 1080 },
    { label: 'IG Story', w: 1080, h: 1920 },
    { label: 'FB Cover', w: 820, h: 312 },
    { label: 'YouTube', w: 1280, h: 720 },
  ];
  return (
    <div className="h-10 bg-[#2d2d2d] border-b border-[#1e1e1e] flex items-center justify-between px-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#0078d4] rounded flex items-center justify-center text-white font-bold text-xs">
            P
          </div>
          <span className="text-white font-semibold text-sm">PixelCraft Pro</span>
        </div>
        
        <nav className="flex gap-4 text-xs text-[#cccccc]">
          <div className="flex items-center gap-2 border-r border-[#444444] pr-4 mr-2">
            <span className="text-[10px] uppercase text-[#666666] font-bold">Resize:</span>
            {resizeOptions.map(opt => (
              <button 
                key={opt.label}
                onClick={() => onResize(opt.w, opt.h)}
                className="hover:text-white px-1"
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button className="hover:text-white">File</button>
          <button className="hover:text-white">Edit</button>
          <button className="hover:text-white">Image</button>
          <button className="hover:text-white">Layer</button>
          <button className="hover:text-white">Filter</button>
          <button className="hover:text-white">View</button>
          <button className="hover:text-white">Window</button>
          <button 
            className="hover:text-white group relative"
            onClick={() => alert('Keyboard Shortcuts:\n\nV: Select\nB: Brush\nR: Rectangle\nC: Circle\nT: Text\nE: Eraser\nK: Crop\n\nCtrl+Z: Undo\nCtrl+Y: Redo\nCtrl+C: Copy\nCtrl+V: Paste\nCtrl+X: Cut\nCtrl+A: Select All\nCtrl+S: Export\n\nCtrl + / -: Zoom\nCtrl + 0: Reset Zoom\n\n[: Dec Brush Size\n]: Inc Brush Size\n\nArrows: Nudge\nShift+Arrows: Fast Nudge\nDel/Backspace: Delete')}
          >
            Help
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onAISuggest}
          disabled={isProcessing}
          className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs rounded-full font-medium transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          AI Magic Edit
        </button>

        <div className="h-4 w-px bg-[#444444] mx-1" />

        <button 
          onClick={onClear}
          className="px-3 py-1 bg-[#444444] hover:bg-[#555555] text-white text-xs rounded transition-colors"
        >
          Clear
        </button>

        <button 
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-1 bg-[#444444] hover:bg-[#555555] text-white text-xs rounded transition-colors group relative"
        >
          <Download size={14} />
          Export
          <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1e1e1e] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
            Export (Ctrl+S)
          </span>
        </button>
      </div>
    </div>
  );
};
