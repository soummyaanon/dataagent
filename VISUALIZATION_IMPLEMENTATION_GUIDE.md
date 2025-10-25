# Visualization & Canvas Implementation Guide

## 🎯 Overview

This guide provides a step-by-step implementation plan for integrating a sidebar with canvas capabilities for generating graphs and visualizations in the DataAgent application.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Implementation Phases](#implementation-phases)
3. [Detailed Implementation Steps](#detailed-implementation-steps)
4. [File Structure](#file-structure)
5. [Dependencies](#dependencies)
6. [Testing Strategy](#testing-strategy)
7. [Best Practices](#best-practices)

---

## 🏗️ Architecture Overview

### Current State
- ✅ Sidebar component exists (`src/components/ui/sidebar.tsx`)
- ✅ Canvas component exists (`src/components/ai-elements/canvas.tsx`)
- ✅ Chart component exists (`src/components/ui/chart.tsx`)
- ✅ AI agent with tool calling capability
- ✅ Chat interface with streaming

### Target Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                          App Layout                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            SidebarProvider (State Management)                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────┬──────────────────────────────────┬──────────────┐   │
│  │          │                                  │              │   │
│  │  Left    │        Main Content              │   Right      │   │
│  │ Sidebar  │        (Chat Area)               │  Sidebar     │   │
│  │ (Always) │                                  │  (Canvas)    │   │
│  │          │                                  │ (Conditional)│   │
│  │ ┌──────┐ │  ┌────────────────────────────┐ │              │   │
│  │ │Chat  │ │  │                            │ │ ┌──────────┐ │   │
│  │ │Histo │ │  │    Chat Messages           │ │ │          │ │   │
│  │ │ry    │ │  │                            │ │ │ Chart 1  │ │   │
│  │ └──────┘ │  │    ┌─────────────────┐     │ │ │          │ │   │
│  │          │  │    │ User Message    │     │ │ └──────────┘ │   │
│  │ ┌──────┐ │  │    └─────────────────┘     │ │              │   │
│  │ │New   │ │  │                            │ │ ┌──────────┐ │   │
│  │ │Chat  │ │  │    ┌─────────────────┐     │ │ │          │ │   │
│  │ └──────┘ │  │    │ Agent Response  │     │ │ │ Chart 2  │ │   │
│  │          │  │    │ + Visualization │────────►│          │ │   │
│  │ ┌──────┐ │  │    └─────────────────┘     │ │ └──────────┘ │   │
│  │ │Setti │ │  │                            │ │              │   │
│  │ │ngs   │ │  │    [Input Area]            │ │ [Canvas     │   │
│  │ └──────┘ │  │                            │ │  Controls]   │   │
│  │          │  └────────────────────────────┘ │              │   │
│  └──────────┴──────────────────────────────────┴──────────────┘   │
└────────────────────────────────────────────────────────────────────┘

Flow:
1. User chats in main area
2. Agent generates visualization → Right canvas sidebar opens automatically
3. Charts appear in right sidebar canvas
4. User can toggle canvas on/off, but auto-opens when needed
```

---

## 🚀 Implementation Phases

### Phase 1: Base Layout Structure (Week 1)
**Goal:** Create the foundational layout with left sidebar (history) and right sidebar (canvas)

**Tasks:**
1. Install required dependencies
2. Create AppLayout component with dual sidebars
3. Left sidebar: Always visible, contains chat history
4. Right sidebar: Canvas that auto-opens when agent creates visualizations
5. Add canvas visibility state management
6. Test responsive behavior

**Deliverables:**
- Left sidebar with chat history (always visible, collapsible)
- Right sidebar with canvas (opens automatically when needed)
- Toggle button to manually show/hide canvas
- Responsive mobile layout (sidebars become sheets/modals)

---

### Phase 2: Visualization Tools for Agent (Week 1-2)
**Goal:** Extend AI agent with visualization capabilities

**Tasks:**
1. Define visualization tool schemas
2. Implement chart generation tools
3. Add streaming support for visualizations
4. Create data transformation utilities
5. Test agent tool calling

**Deliverables:**
- Agent can generate bar charts
- Agent can generate line charts
- Agent can generate pie charts
- Agent can auto-select appropriate chart type
- Streaming visualization data works

---

### Phase 3: Chart Components (Week 2)
**Goal:** Build reusable chart components that work on canvas

**Tasks:**
1. Create ChartNode wrapper component
2. Implement BarChartNode
3. Implement LineChartNode
4. Implement PieChartNode
5. Implement ScatterPlotNode
6. Add chart configuration UI

**Deliverables:**
- 4+ chart types available
- Charts render as ReactFlow nodes
- Charts are interactive
- Charts support theming

---

### Phase 4: Canvas Integration (Week 3)
**Goal:** Full canvas functionality with drag, drop, and positioning

**Tasks:**
1. Enhance VisualizationCanvas component
2. Implement drag-and-drop from sidebar
3. Add auto-layout algorithms
4. Implement chart linking/relationships
5. Add export functionality

**Deliverables:**
- Charts can be dragged on canvas
- Charts auto-position intelligently
- Canvas can be exported as image
- Canvas state persists

---

## 📝 Detailed Implementation Steps

### Step 1: Install Dependencies

```bash
# Add these to package.json
pnpm add react-resizable-panels@^2.0.0
pnpm add html2canvas@^1.4.1
pnpm add zustand@^4.5.0  # For canvas state management
```

**Why these packages:**
- `react-resizable-panels`: Smooth resizable UI panels
- `html2canvas`: Export canvas to images
- `zustand`: Lightweight state management for canvas

---

### Step 2: Create Type Definitions

**File:** `src/types/visualization.ts`

```typescript
export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'composed';

export interface VisualizationConfig {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  data: ChartDataPoint[];
  config: ChartConfig;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface ChartDataPoint {
  [key: string]: string | number | null;
}

export interface ChartConfig {
  xAxis?: string;
  yAxis?: string | string[];
  colors?: string[];
  legend?: boolean;
  grid?: boolean;
  tooltip?: boolean;
  // ... more config options
}

export interface VisualizationToolInput {
  type: ChartType;
  data: any[];
  title: string;
  config?: Partial<ChartConfig>;
}

export interface CanvasState {
  visualizations: Map<string, VisualizationConfig>;
  selectedId: string | null;
  zoom: number;
}
```

**File:** `src/types/canvas.ts`

```typescript
import type { Node, Edge } from '@xyflow/react';
import type { VisualizationConfig } from './visualization';

export interface CanvasNode extends Node {
  data: {
    visualization: VisualizationConfig;
    onUpdate?: (config: VisualizationConfig) => void;
    onDelete?: (id: string) => void;
  };
}

export interface CanvasEdge extends Edge {
  data?: {
    relationship: 'datasource' | 'filter' | 'calculation';
  };
}

export interface CanvasExportOptions {
  format: 'png' | 'svg' | 'pdf';
  quality?: number;
  backgroundColor?: string;
}
```

---

### Step 3: Create Canvas State Management

**File:** `src/hooks/useCanvasStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VisualizationConfig, CanvasState } from '@/types/visualization';
import { nanoid } from 'nanoid';

interface CanvasStore extends CanvasState {
  addVisualization: (viz: Omit<VisualizationConfig, 'id'>) => string;
  updateVisualization: (id: string, updates: Partial<VisualizationConfig>) => void;
  removeVisualization: (id: string) => void;
  selectVisualization: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  clearCanvas: () => void;
  exportCanvas: () => VisualizationConfig[];
  importCanvas: (visualizations: VisualizationConfig[]) => void;
}

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set, get) => ({
      visualizations: new Map(),
      selectedId: null,
      zoom: 1,

      addVisualization: (viz) => {
        const id = nanoid();
        const newViz = { ...viz, id };
        set((state) => ({
          visualizations: new Map(state.visualizations).set(id, newViz),
          selectedId: id,
        }));
        return id;
      },

      updateVisualization: (id, updates) => {
        set((state) => {
          const viz = state.visualizations.get(id);
          if (!viz) return state;
          const updated = { ...viz, ...updates };
          return {
            visualizations: new Map(state.visualizations).set(id, updated),
          };
        });
      },

      removeVisualization: (id) => {
        set((state) => {
          const newViz = new Map(state.visualizations);
          newViz.delete(id);
          return {
            visualizations: newViz,
            selectedId: state.selectedId === id ? null : state.selectedId,
          };
        });
      },

      selectVisualization: (id) => set({ selectedId: id }),
      setZoom: (zoom) => set({ zoom }),
      clearCanvas: () => set({ visualizations: new Map(), selectedId: null }),
      
      exportCanvas: () => Array.from(get().visualizations.values()),
      
      importCanvas: (visualizations) => {
        const vizMap = new Map(visualizations.map(v => [v.id, v]));
        set({ visualizations: vizMap, selectedId: null });
      },
    }),
    {
      name: 'canvas-storage',
      // Custom serialization for Map
      serialize: (state) => JSON.stringify({
        ...state,
        state: {
          ...state.state,
          visualizations: Array.from(state.state.visualizations.entries()),
        },
      }),
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        return {
          ...parsed,
          state: {
            ...parsed.state,
            visualizations: new Map(parsed.state.visualizations),
          },
        };
      },
    }
  )
);
```

---

### Step 4: Create Layout Components

**File:** `src/components/layout/AppLayout.tsx`

```typescript
'use client';

import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { ChatHistorySidebar } from '@/components/sidebar/ChatHistorySidebar';
import { Button } from '@/components/ui/button';
import { PanelRightIcon, XIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface AppLayoutProps {
  children: React.ReactNode;
  canvasContent?: React.ReactNode;
  showCanvas?: boolean;
  onCanvasToggle?: (show: boolean) => void;
}

export function AppLayout({ 
  children, 
  canvasContent, 
  showCanvas = false,
  onCanvasToggle 
}: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [isCanvasOpen, setIsCanvasOpen] = useState(showCanvas);

  const handleCanvasToggle = (open: boolean) => {
    setIsCanvasOpen(open);
    onCanvasToggle?.(open);
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Left Sidebar - Chat History */}
        <Sidebar side="left" variant="sidebar" collapsible="icon">
          <SidebarContent>
            <ChatHistorySidebar />
          </SidebarContent>
        </Sidebar>

        {/* Main Content Area - Chat */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Canvas Toggle Button */}
          {!isCanvasOpen && (
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 z-10"
              onClick={() => handleCanvasToggle(true)}
            >
              <PanelRightIcon className="h-4 w-4 mr-2" />
              Show Canvas
            </Button>
          )}
          
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>

        {/* Right Sidebar - Canvas (Desktop) */}
        {!isMobile && isCanvasOpen && (
          <aside className="w-[500px] border-l flex flex-col bg-background">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-sm">Visualizations</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCanvasToggle(false)}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              {canvasContent}
            </div>
          </aside>
        )}

        {/* Right Sidebar - Canvas (Mobile Sheet) */}
        {isMobile && (
          <Sheet open={isCanvasOpen} onOpenChange={handleCanvasToggle}>
            <SheetContent side="right" className="w-full sm:max-w-lg p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="font-semibold">Visualizations</h2>
                </div>
                <div className="flex-1 overflow-auto">
                  {canvasContent}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </SidebarProvider>
  );
}
```

---

### Step 5: Create Sidebar Components

**File:** `src/components/sidebar/ChatHistorySidebar.tsx`

```typescript
'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlusIcon, MessageSquareIcon, HistoryIcon } from 'lucide-react';

export function ChatHistorySidebar() {
  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HistoryIcon className="h-4 w-4" />
          <h2 className="text-sm font-semibold">History</h2>
        </div>
        <Button size="sm" variant="ghost" title="New Chat">
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        {/* Chat history items will go here */}
        <div className="space-y-2">
          {/* Example history item */}
          <Button
            variant="ghost"
            className="w-full justify-start text-left h-auto py-3 px-3"
          >
            <MessageSquareIcon className="h-4 w-4 mr-2 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">Sales analysis Q1</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
          </Button>
          
          <div className="text-sm text-muted-foreground px-3 py-2">
            No more history
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
```

**Note:** We removed the VisualizationToolsSidebar since charts are now added automatically by the agent. The left sidebar only shows chat history.

---

### Step 6: Create Visualization Tools for Agent

**File:** `src/lib/tools/visualization-tools.ts`

```typescript
import { tool } from 'ai';
import { z } from 'zod';
import type { VisualizationConfig, ChartType } from '@/types/visualization';

// Schema definitions
const ChartDataSchema = z.array(
  z.record(z.union([z.string(), z.number(), z.null()]))
);

const ChartConfigSchema = z.object({
  xAxis: z.string().optional(),
  yAxis: z.union([z.string(), z.array(z.string())]).optional(),
  colors: z.array(z.string()).optional(),
  legend: z.boolean().optional(),
  grid: z.boolean().optional(),
  tooltip: z.boolean().optional(),
});

const VisualizationInputSchema = z.object({
  type: z.enum(['bar', 'line', 'pie', 'scatter', 'area', 'composed']),
  title: z.string(),
  description: z.string().optional(),
  data: ChartDataSchema,
  config: ChartConfigSchema.optional(),
});

// Tool: Generate Bar Chart
export const generateBarChartTool = tool({
  description: `Generate a bar chart visualization from data. Use this to compare values across different categories. 
  Best for: categorical comparisons, rankings, frequency distributions.`,
  parameters: VisualizationInputSchema.extend({
    type: z.literal('bar'),
  }),
  execute: async (input) => {
    return {
      visualization: {
        id: '', // Will be generated by store
        type: 'bar' as ChartType,
        title: input.title,
        description: input.description,
        data: input.data,
        config: input.config || {},
      },
      message: `Created bar chart: ${input.title}`,
    };
  },
});

// Tool: Generate Line Chart
export const generateLineChartTool = tool({
  description: `Generate a line chart visualization from data. Use this to show trends over time or continuous data.
  Best for: time series, trends, continuous data changes.`,
  parameters: VisualizationInputSchema.extend({
    type: z.literal('line'),
  }),
  execute: async (input) => {
    return {
      visualization: {
        id: '',
        type: 'line' as ChartType,
        title: input.title,
        description: input.description,
        data: input.data,
        config: input.config || {},
      },
      message: `Created line chart: ${input.title}`,
    };
  },
});

// Tool: Generate Pie Chart
export const generatePieChartTool = tool({
  description: `Generate a pie chart visualization from data. Use this to show proportions or percentages of a whole.
  Best for: percentage breakdowns, composition, market share.`,
  parameters: VisualizationInputSchema.extend({
    type: z.literal('pie'),
  }),
  execute: async (input) => {
    return {
      visualization: {
        id: '',
        type: 'pie' as ChartType,
        title: input.title,
        description: input.description,
        data: input.data,
        config: input.config || {},
      },
      message: `Created pie chart: ${input.title}`,
    };
  },
});

// Tool: Generate Scatter Plot
export const generateScatterPlotTool = tool({
  description: `Generate a scatter plot visualization from data. Use this to show relationships between two variables.
  Best for: correlations, distributions, outlier detection.`,
  parameters: VisualizationInputSchema.extend({
    type: z.literal('scatter'),
  }),
  execute: async (input) => {
    return {
      visualization: {
        id: '',
        type: 'scatter' as ChartType,
        title: input.title,
        description: input.description,
        data: input.data,
        config: input.config || {},
      },
      message: `Created scatter plot: ${input.title}`,
    };
  },
});

// Tool: Auto-select best chart type
export const autoSelectVisualizationTool = tool({
  description: `Automatically select and generate the best chart type based on the data structure and analysis goal.
  The AI will analyze the data and choose the most appropriate visualization.`,
  parameters: z.object({
    data: ChartDataSchema,
    goal: z.string().describe('What insight are you trying to show?'),
    title: z.string(),
    description: z.string().optional(),
  }),
  execute: async (input) => {
    // Simple heuristics for chart selection
    const { data, goal } = input;
    
    let selectedType: ChartType = 'bar';
    
    // Check if data has time-like columns
    const hasTimeColumn = data.some(row => 
      Object.keys(row).some(key => 
        /date|time|month|year|day/i.test(key)
      )
    );
    
    // Check if data has exactly two columns (potential for scatter)
    const columnCount = Object.keys(data[0] || {}).length;
    
    // Selection logic
    if (goal.toLowerCase().includes('trend') || hasTimeColumn) {
      selectedType = 'line';
    } else if (goal.toLowerCase().includes('proportion') || goal.toLowerCase().includes('percentage')) {
      selectedType = 'pie';
    } else if (goal.toLowerCase().includes('relationship') || goal.toLowerCase().includes('correlation')) {
      selectedType = 'scatter';
    } else if (columnCount === 2 && data.length > 20) {
      selectedType = 'scatter';
    } else if (hasTimeColumn) {
      selectedType = 'area';
    } else {
      selectedType = 'bar';
    }
    
    return {
      visualization: {
        id: '',
        type: selectedType,
        title: input.title,
        description: input.description,
        data: input.data,
        config: {},
      },
      message: `Auto-selected ${selectedType} chart: ${input.title}`,
      reasoning: `Selected ${selectedType} chart because: ${
        selectedType === 'line' ? 'data shows trends over time' :
        selectedType === 'pie' ? 'goal is to show proportions' :
        selectedType === 'scatter' ? 'analyzing relationship between variables' :
        'comparing values across categories'
      }`,
    };
  },
});

// Export all tools
export const visualizationTools = {
  generateBarChart: generateBarChartTool,
  generateLineChart: generateLineChartTool,
  generatePieChart: generatePieChartTool,
  generateScatterPlot: generateScatterPlotTool,
  autoSelectVisualization: autoSelectVisualizationTool,
};
```

---

### Step 7: Create Chart Node Components

**File:** `src/components/charts/ChartNode.tsx`

```typescript
'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XIcon, SettingsIcon } from 'lucide-react';
import type { VisualizationConfig } from '@/types/visualization';

interface ChartNodeProps {
  data: {
    visualization: VisualizationConfig;
    onDelete?: (id: string) => void;
    onConfigure?: (id: string) => void;
  };
}

export const ChartNode = memo(({ data }: ChartNodeProps) => {
  const { visualization, onDelete, onConfigure } = data;

  return (
    <>
      <Handle type="target" position={Position.Left} />
      
      <Card className="min-w-[400px] max-w-[600px]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{visualization.title}</CardTitle>
              {visualization.description && (
                <CardDescription className="text-xs mt-1">
                  {visualization.description}
                </CardDescription>
              )}
            </div>
            <div className="flex gap-1">
              {onConfigure && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => onConfigure(visualization.id)}
                >
                  <SettingsIcon className="h-3.5 w-3.5" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => onDelete(visualization.id)}
                >
                  <XIcon className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Chart content will be rendered here based on type */}
          <div className="w-full h-[300px] flex items-center justify-center bg-muted/20 rounded">
            <span className="text-sm text-muted-foreground">
              {visualization.type.toUpperCase()} Chart
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Right} />
    </>
  );
});

ChartNode.displayName = 'ChartNode';
```

---

### Step 8: Create Visualization Canvas

**File:** `src/components/canvas/VisualizationCanvas.tsx`

```typescript
'use client';

import { useCallback, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ChartNode } from '@/components/charts/ChartNode';
import { useCanvasStore } from '@/hooks/useCanvasStore';
import { Button } from '@/components/ui/button';
import { DownloadIcon, TrashIcon } from 'lucide-react';
import type { CanvasNode, CanvasEdge } from '@/types/canvas';

const nodeTypes = {
  chart: ChartNode,
};

export function VisualizationCanvas() {
  const { visualizations, removeVisualization, clearCanvas } = useCanvasStore();
  
  // Convert visualizations to ReactFlow nodes
  const initialNodes = useMemo(() => {
    return Array.from(visualizations.values()).map((viz, index) => ({
      id: viz.id,
      type: 'chart',
      position: viz.position || { x: 50 + index * 50, y: 50 + index * 50 },
      data: {
        visualization: viz,
        onDelete: removeVisualization,
        onConfigure: (id: string) => console.log('Configure', id),
      },
    })) as CanvasNode[];
  }, [visualizations, removeVisualization]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CanvasEdge>([]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const handleExport = async () => {
    // TODO: Implement export functionality
    console.log('Export canvas');
  };

  if (visualizations.size === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            No visualizations yet
          </p>
          <p className="text-sm text-muted-foreground">
            Ask the AI to create charts or add them from the sidebar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button size="sm" variant="secondary" onClick={handleExport}>
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button size="sm" variant="destructive" onClick={clearCanvas}>
          <TrashIcon className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
```

---

### Step 9: Integration with Agent

**File:** Update `src/lib/agent.ts` to include visualization tools

```typescript
// Add to existing agent.ts
import { visualizationTools } from './tools/visualization-tools';

// In your agent configuration, add the tools:
const agent = createAgent({
  // ... existing config
  tools: {
    // ... existing tools
    ...visualizationTools,
  },
});
```

**File:** Update streaming handler to process visualization results

```typescript
// In your chat API route or streaming handler
case 'tool-result':
  if (result.toolName.startsWith('generate') && result.result.visualization) {
    // Add visualization to canvas
    const vizId = canvasStore.getState().addVisualization(result.result.visualization);
    
    // Stream back confirmation
    stream.writeData({
      type: 'visualization-added',
      visualizationId: vizId,
      message: result.result.message,
    });
  }
  break;
```

---

### Step 10: Update Main Page & Canvas State Hook

**File:** `src/hooks/useCanvasVisibility.ts` (NEW)

```typescript
'use client';

import { create } from 'zustand';

interface CanvasVisibilityStore {
  isOpen: boolean;
  openCanvas: () => void;
  closeCanvas: () => void;
  toggleCanvas: () => void;
}

export const useCanvasVisibility = create<CanvasVisibilityStore>((set) => ({
  isOpen: false,
  openCanvas: () => set({ isOpen: true }),
  closeCanvas: () => set({ isOpen: false }),
  toggleCanvas: () => set((state) => ({ isOpen: !state.isOpen })),
}));
```

**File:** `src/app/page.tsx`

```typescript
'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import ChatBotDemo from '@/components/chat/ChatLayout';
import { VisualizationCanvas } from '@/components/canvas/VisualizationCanvas';
import { useCanvasVisibility } from '@/hooks/useCanvasVisibility';
import { useCanvasStore } from '@/hooks/useCanvasStore';
import { useEffect } from 'react';

export default function HomePage() {
  const { isOpen, openCanvas, closeCanvas } = useCanvasVisibility();
  const visualizationCount = useCanvasStore((state) => state.visualizations.size);

  // Auto-open canvas when visualizations are added
  useEffect(() => {
    if (visualizationCount > 0 && !isOpen) {
      openCanvas();
    }
  }, [visualizationCount, isOpen, openCanvas]);

  return (
    <AppLayout
      showCanvas={isOpen}
      onCanvasToggle={(show) => show ? openCanvas() : closeCanvas()}
      canvasContent={<VisualizationCanvas />}
    >
      <ChatBotDemo />
    </AppLayout>
  );
}
```

---

## 📁 Complete File Structure

```
src/
├── app/
│   └── page.tsx                                    (UPDATED - with canvas auto-open)
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx                          (NEW - dual sidebar layout)
│   ├── sidebar/
│   │   └── ChatHistorySidebar.tsx                (NEW - left sidebar only)
│   ├── canvas/
│   │   └── VisualizationCanvas.tsx               (NEW - right sidebar canvas)
│   ├── charts/
│   │   ├── ChartNode.tsx                         (NEW)
│   │   ├── BarChartNode.tsx                      (TODO)
│   │   ├── LineChartNode.tsx                     (TODO)
│   │   ├── PieChartNode.tsx                      (TODO)
│   │   └── ScatterChartNode.tsx                  (TODO)
│   └── ai-elements/                               (EXISTING)
├── lib/
│   ├── tools/
│   │   └── visualization-tools.ts                 (NEW - agent tools)
│   └── agent.ts                                   (UPDATE - add viz tools)
├── hooks/
│   ├── useCanvasStore.ts                          (NEW - visualization state)
│   ├── useCanvasVisibility.ts                     (NEW - sidebar visibility)
│   └── use-mobile.ts                              (EXISTING)
└── types/
    ├── visualization.ts                            (NEW)
    └── canvas.ts                                   (NEW)
```

---

## 📦 Dependencies Checklist

- [ ] `zustand` - For canvas and visibility state management
- [ ] `html2canvas` - For exporting canvas (optional)
- [ ] `@xyflow/react` - Already installed ✅
- [ ] `recharts` - Already installed ✅

**Note:** We removed `react-resizable-panels` since we're using a fixed right sidebar that slides in/out instead of resizable panels.

---

## 🧪 Testing Strategy

### Unit Tests
- Test canvas state management (add, update, remove visualizations)
- Test chart data transformations
- Test tool parameter validation

### Integration Tests
- Test agent tool calling with visualization tools
- Test visualization rendering on canvas
- Test export functionality

### E2E Tests
- User asks for chart → chart appears on canvas
- User drags chart on canvas → position updates
- User exports canvas → image downloads

---

## ✅ Best Practices

### Performance
- Memoize chart components to prevent unnecessary re-renders
- Use virtualization for large datasets
- Debounce canvas updates
- Lazy load chart libraries

### Accessibility
- Keyboard navigation for canvas
- ARIA labels for charts
- Screen reader support for data
- High contrast mode support

### UX
- Loading states for chart generation
- Error handling with fallbacks
- Undo/redo for canvas operations
- Autosave canvas state

### Code Quality
- TypeScript for type safety
- ESLint for code consistency
- Prettier for formatting
- Component documentation

---

## 🚦 Implementation Checklist

### Phase 1: Foundation (Days 1-2)
- [ ] Install dependencies
- [ ] Create type definitions
- [ ] Set up canvas state management
- [ ] Create AppLayout component
- [ ] Add resizable panels

### Phase 2: Sidebar (Days 2-3)
- [ ] Create ChatHistorySidebar (left side - always visible)
- [ ] Add right canvas sidebar with auto-open logic
- [ ] Test sidebar toggle and auto-open behavior
- [ ] Test responsive behavior (mobile uses sheets)

### Phase 3: Agent Tools (Days 3-4)
- [ ] Create visualization tool schemas
- [ ] Implement bar chart tool
- [ ] Implement line chart tool
- [ ] Implement pie chart tool
- [ ] Implement auto-select tool
- [ ] Add tool to agent configuration

### Phase 4: Canvas (Days 4-5)
- [ ] Create VisualizationCanvas component (for right sidebar)
- [ ] Create ChartNode wrapper
- [ ] Implement drag and drop on canvas
- [ ] Add minimap and controls
- [ ] Test canvas interactions
- [ ] Test auto-open when visualizations are added

### Phase 5: Chart Components (Days 5-7)
- [ ] Create BarChartNode
- [ ] Create LineChartNode
- [ ] Create PieChartNode
- [ ] Create ScatterChartNode
- [ ] Add chart theming

### Phase 6: Integration (Days 7-8)
- [ ] Connect agent to canvas store
- [ ] Add streaming support for visualizations
- [ ] Handle visualization events → auto-open right sidebar
- [ ] Test end-to-end flow (chat → viz → canvas opens)
- [ ] Test manual toggle of canvas sidebar

### Phase 7: Polish (Days 8-10)
- [ ] Add export functionality
- [ ] Implement canvas persistence
- [ ] Add error handling
- [ ] Write documentation
- [ ] Performance optimization

---

## 📚 Resources

### Documentation
- [ReactFlow Docs](https://reactflow.dev/)
- [Recharts Docs](https://recharts.org/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)

### Examples
- Look at existing `canvas.tsx` for ReactFlow patterns
- Look at existing `chart.tsx` for Recharts patterns
- Look at existing `sidebar.tsx` for sidebar patterns

---

## 🎯 Success Criteria

The implementation is successful when:

1. ✅ User can chat with agent in main area
2. ✅ Left sidebar shows chat history (always visible, collapsible)
3. ✅ Agent can generate visualizations via tool calls
4. ✅ Right sidebar canvas auto-opens when agent creates visualization
5. ✅ User can manually toggle canvas sidebar on/off
6. ✅ Charts appear automatically on right canvas when generated
7. ✅ Charts are draggable and interactive on canvas
8. ✅ Canvas state persists across sessions
9. ✅ Canvas can be exported as image
10. ✅ Responsive on mobile (sidebars become sheets/drawers)
11. ✅ No performance issues with multiple charts
12. ✅ All TypeScript types are properly defined

---

## 🔄 Next Steps After Implementation

1. **Advanced Features**
   - Chart linking and filtering
   - Real-time data updates
   - Collaborative editing
   - Custom chart templates

2. **Optimizations**
   - Server-side rendering for charts
   - Caching strategies
   - Bundle size reduction
   - Performance monitoring

3. **Extensions**
   - More chart types (heatmaps, treemaps, etc.)
   - Custom color themes
   - Animation options
   - Interactive chart editing

---

**Ready to implement?** Let's start with Phase 1! 🚀
 