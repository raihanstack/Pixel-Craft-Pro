export type ToolType = 'select' | 'brush' | 'rectangle' | 'circle' | 'text' | 'eraser' | 'crop';
export type SidebarTab = 'properties' | 'layers' | 'filters' | 'elements';

export interface CanvasState {
  color: string;
  strokeWidth: number;
  opacity: number;
  activeTool: ToolType;
}

export interface Layer {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
}
