# Image Text Composer

A desktop-only, single-page image editing tool built with Next.js and TypeScript that enables users to upload PNG images and overlay them with fully customizable text.

## 🚀 Quick Start

### Prerequisites

- Node.js (v24 or higher recommended, as per `Dockerfile`)
- pnpm

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/pipe-dev/image-text-composer.git
    cd image-text-composer
    ```

2. **Install dependencies**

    ```bash
    pnpm install
    ```

3. **Run the development server**

    ```bash
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser. The app uses Next.js's Turbopack for fast development.

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and CSS variables
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main editor page
├── components/
│   ├── canvas/
│   │   └── FabricCanvas.tsx # Main canvas component using Fabric.js
│   └── ui/                  # UI components from shadcn/ui (midday ui)
│   ├── ImageUpload.tsx      # Drag & drop image upload
│   ├── LayersPanel.tsx      # Layer management panel
│   ├── PropertiesPanel.tsx  # Text properties editor
│   └── Toolbar.tsx          # Main toolbar with actions
├── config/
│   └── env.ts               # Environment variable configuration
├── hooks/
│   └── useToast.ts          # Custom toast hook
├── lib/
│   ├── google-font.ts       # Google Fonts list
├── store/
│   └── editorStore.ts       # Zustand store for state management
└── utils/
    ├── constant.ts          # Application constants
    └── index.ts             # Helper functions
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file by copying `.env.example` and provide the necessary values:

```bash
# Public URL of the application
NEXT_PUBLIC_ROOT_DOMAIN="http://localhost:3000"

# Google Analytics ID (optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS="G-XXXXXXXXXX"
```

## 🏗️ Architecture Overview

### State Management (Zustand)

- **Centralized state** for canvas elements, layers, and history.
- **Undo/Redo system** for canvas actions.

### Canvas Rendering (Fabric.js)

- **Hardware-accelerated** text and image manipulation.
- **Real-time updates** for smooth interactions.
- **Export functionality** to download the canvas as a PNG.

### UI Components (shadcn/ui + Tailwind CSS)

- **Consistent design system** for a clean user interface.
- **Responsive layout** optimized for desktop use.
- **Accessible components** built on Radix UI.

## 🚀 Deployment

The project includes `Dockerfile` and `Dockerfile.bun` for containerized deployments.

### Vercel (Recommended)

1. **Push to a Git provider** (GitHub, GitLab, Bitbucket).
2. **Deploy to Vercel**
    - Connect your Git repository to Vercel.
    - Vercel will automatically detect the Next.js configuration and deploy the application.
    - Add the environment variables from your `.env.local` file to the Vercel project settings.

### Build Locally

```bash
pnpm build
pnpm start
```

## 🔥 Key Features Implemented

- ✅ **PNG Image Upload** with drag & drop.
- ✅ **Multiple Text Layers** with full customization (font, size, color, alignment).
- ✅ **Google Fonts Integration** with a curated list of fonts.
- ✅ **Drag, Resize, and Rotate** text directly on the canvas.
- ✅ **Layer Management** (add, delete, select).
- ✅ **Undo/Redo** functionality for canvas changes.
- ✅ **PNG Export** of the final composed image.
- ✅ **Code Generation** for SVG, React, and Vue components.

## 🧪 Development

The following scripts are available for maintaining code quality:

- **Type Checking**:

    ```bash
    pnpm type-check
    ```

- **Linting**:

    ```bash
    pnpm lint
    ```

- **Fix Linting Issues**:

    ```bash
    pnpm lint:fix
    ```

- **Code Formatting**:

    ```bash
    pnpm format
    ```

## 📝 Notes

- **Desktop-only**: The UI/UX is optimized for desktop browsers.
- **PNG-only**: Currently supports PNG for both upload and export.
- **Client-side**: All image processing and state management happen in the browser.
- **No backend**: The application is a fully static Next.js app.
