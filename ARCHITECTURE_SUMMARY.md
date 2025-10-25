# Architecture Summary: Dual Sidebar Layout

## 📐 Layout Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Left Sidebar │      Main Chat Area      │  Right Sidebar  │
│   (History)   │                          │    (Canvas)     │
│               │                          │                 │
│  Always Open  │   User ↔️ Agent Chat     │  Auto-Opens     │
│  Collapsible  │                          │  When Needed    │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Key Design Decisions

### Left Sidebar (Chat History)
- **Always visible** (but can be collapsed to icon mode)
- Shows chat history and navigation
- Fixed width: `16rem` (can be adjusted)
- Keyboard shortcut: `Cmd/Ctrl + B` to toggle

### Main Area (Chat Interface)
- Full chat conversation
- User messages and agent responses
- Input area at bottom
- Takes full width when canvas is closed

### Right Sidebar (Visualization Canvas)
- **Conditionally visible** - only appears when needed
- **Auto-opens** when agent creates visualizations
- Can be manually toggled with button
- Fixed width: `500px` on desktop
- Contains ReactFlow canvas with charts
- On mobile: Becomes a slide-out sheet

## 🔄 User Flow

### Flow 1: Normal Chat (No Visualizations)
```
1. User types query → 2. Agent responds with text → 3. No canvas
```

### Flow 2: Visualization Request
```
1. User: "Show me sales by region as a chart"
2. Agent processes query
3. Agent calls generateBarChart tool
4. Canvas sidebar automatically opens on the right →
5. Chart appears on canvas
6. User can continue chatting while viewing chart
```

### Flow 3: Manual Canvas Toggle
```
1. User clicks "Show Canvas" button
2. Right sidebar slides in
3. Shows existing visualizations or empty state
```

## 🛠️ State Management

### Canvas Visibility State
- **Hook:** `useCanvasVisibility()`
- **Controls:** Open/Close/Toggle canvas
- **Trigger:** Auto-opens when `visualizations.size > 0`

### Canvas Content State
- **Hook:** `useCanvasStore()`
- **Manages:** All visualizations on canvas
- **Persists:** To localStorage
- **Operations:** Add, update, remove, clear

## 📱 Responsive Behavior

### Desktop (> 768px)
- Left sidebar: Fixed, collapsible
- Main area: Flexible width
- Right sidebar: Fixed 500px when open

### Tablet (768px - 1024px)
- Left sidebar: Collapsed to icons by default
- Main area: Takes most space
- Right sidebar: Overlay/sheet mode

### Mobile (< 768px)
- Left sidebar: Sheet/drawer that slides from left
- Main area: Full width
- Right sidebar: Sheet/drawer that slides from right

## 🎨 Visual States

### State 1: Initial Load
```
[Sidebar] [        Chat Area          ]
```

### State 2: First Visualization Created
```
[Sidebar] [    Chat Area    ] [Canvas ✨]
                              ↑ Auto-opens
```

### State 3: Canvas Manually Closed
```
[Sidebar] [        Chat Area         ] [Show Canvas 🔘]
```

### State 4: Multiple Charts
```
[Sidebar] [  Chat  ] [Canvas with 3 charts stacked]
```

## 🔧 Implementation Components

### New Files Required
1. `src/components/layout/AppLayout.tsx` - Main layout wrapper
2. `src/components/sidebar/ChatHistorySidebar.tsx` - Left sidebar
3. `src/components/canvas/VisualizationCanvas.tsx` - Right sidebar canvas
4. `src/hooks/useCanvasVisibility.ts` - Canvas visibility state
5. `src/hooks/useCanvasStore.ts` - Canvas content state
6. `src/types/visualization.ts` - Type definitions
7. `src/types/canvas.ts` - Canvas-specific types

### Modified Files
1. `src/app/page.tsx` - Use AppLayout with auto-open logic
2. `src/lib/agent.ts` - Add visualization tools
3. `src/app/api/chat/route.ts` - Handle viz tool results

## 📊 Data Flow

```
User Query
    ↓
Agent Processing
    ↓
Determines need for visualization
    ↓
Calls visualization tool
    ↓
Tool returns viz config
    ↓
useCanvasStore.addVisualization()
    ↓
useEffect detects count > 0
    ↓
useCanvasVisibility.openCanvas()
    ↓
Right sidebar slides in
    ↓
Chart renders on canvas
```

## ✨ Key Features

1. **Smart Auto-Open**: Canvas only appears when there's something to show
2. **Manual Control**: Users can close/open canvas anytime
3. **Persistent State**: Canvas and visualizations persist across sessions
4. **Mobile Friendly**: Adapts to sheet/drawer on small screens
5. **Keyboard Shortcuts**: Quick access with Cmd+B
6. **Multiple Charts**: Canvas can hold multiple visualizations
7. **Export Ready**: Canvas can be exported as image

## 🚀 Benefits of This Architecture

- ✅ **Focused UX**: Users see chat by default, visualizations appear only when needed
- ✅ **Space Efficient**: Full width for chat when no visualizations
- ✅ **Intuitive**: Natural flow from left (history) → center (current) → right (results)
- ✅ **Flexible**: Canvas can be toggled manually anytime
- ✅ **Responsive**: Works great on all screen sizes
- ✅ **Performant**: Only renders canvas when visible

## 📝 Implementation Priority

### Phase 1: Core Layout ⭐⭐⭐
- AppLayout with dual sidebars
- Basic visibility toggling

### Phase 2: Auto-Open Logic ⭐⭐⭐
- useCanvasVisibility hook
- Auto-open on visualization add

### Phase 3: Canvas Content ⭐⭐
- VisualizationCanvas component
- Chart rendering

### Phase 4: Agent Integration ⭐⭐
- Visualization tools
- Streaming handlers

### Phase 5: Polish ⭐
- Animations
- Keyboard shortcuts
- Export functionality
