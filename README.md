# Image Text Composer

Desktop only image editing tool built with nextjs, zustand and tailwindcss for Adomate

## Live Demo

[View Live Application](https://image-composer.brimble.app)

## Features

### Core Functionality
- **Image Upload**: Drag & drop PNG images with automatic canvas aspect ratio matching
- **Multi-layer Text Editing**: Add unlimited text layers with comprehensive styling options
- **Advanced Text Properties**:
  - Font family selection (all Google Fonts available)
  - Font size, weight, color, and opacity controls
  - Text alignment (left, center, right)
  - Multi-line text support
- **Interactive Transformations**: Drag, resize, and rotate text layers with precision handles
- **Layer Management**: Reorder layers with drag-and-drop z-index control
- **Undo/Redo**: 20-step history with visual indicators
- **Auto-save**: Automatic localStorage persistence
- **PNG Export**: Export original image dimensions

### Bonus Features Implemented
- **Lock/Unlock Layers**: Prevent accidental modifications
- **Duplicate Layers**: Clone layers with offset positioning
- **Advanced Typography**: Line-height and letter-spacing controls
- **Keyboard Shortcuts**: Efficient workflow with key combinations
- **Theme Management**: Light/Dark Mode Support

## 🛠 Technology Stack

### Core Technologies
- **Next.js 14**
- **TypeScript**
- **Fabric.js**
- **Zustand**
- **Tailwind CSS**
- **Google Fonts API**

### State Management
The application uses Zustand for global state management with a centralized store pattern:

```
src/store/editorStore.ts - Central state management
├── Editor state (background, layers, selection)
├── History management (undo/redo with 20 steps)
├── Multi-layer operations (select, transform, delete)
└── Auto-save with localStorage persistence
```

### Component Structure
```
src/components/
├── canvas/
│   └── FabricCanvas.tsx
├── panels/
│   ├── LayersPanel.tsx
│   ├── PropertiesPanel.tsx
│   └── ToolsPanel.tsx
└── ui/
```

### Key Design Decisions

**Fabric.js Choice**: Selected for its mature canvas manipulation capabilities, built-in transformation handles, and extensive text rendering features. Provides smooth interactions and precise object control.

**Zustand over Redux**: Chosen for its minimal boilerplate, excellent TypeScript support, and built-in persistence middleware. Reduces complexity while maintaining powerful state management.

**Component Separation**: Clear separation between canvas operations (FabricCanvas) and UI controls (panels), enabling independent development and testing.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pipethedev/image-composer.git
cd image-composer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage Guide

1. **Upload Image**: Drag and drop a PNG file or click to browse
2. **Add Text**: Click "Add Text" to create a new text layer
3. **Edit Text**: Double-click any text layer to edit content inline
4. **Style Text**: Use the Properties panel to adjust font, size, color, etc.
5. **Transform**: Drag to move, use corner handles to resize/rotate
6. **Layer Management**: Reorder layers in the Layers panel
7. **Multi-select**: Hold Ctrl/Cmd and click multiple layers, or use "Select All"
8. **Export**: Click "Export PNG" to download your design

### Keyboard Shortcuts
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Y`: Redo
- `Delete/Backspace`: Delete selected layers

## Some Technical Highlights

### Performance Optimizations
- **Selective Re-rendering**: Only affected components update when state changes
- **Efficient Canvas Operations**: Fabric.js object pooling and optimized rendering
- **Font Caching**: Google Fonts are cached after first load

### Code Quality
- **TypeScript Strict Mode**: Full type safety throughout the application
- **Modular Architecture**: Clear separation of concerns with reusable components
- **Custom Hooks**: Encapsulated logic for canvas operations and state management
- **Error Boundaries**: Robust error handling and recovery

## Known Limitations

- Multi-select with group transforms
 
---

Built by Muritala David for the Adomate Full Stack Engineer Challenge
