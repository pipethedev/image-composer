"use client";

import { Download, ImageIcon, Plus, Redo2, RotateCcw, Undo2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import type { FabricCanvasHandle } from "@/components/canvas/FabricCanvas";
import { ImageUpload } from "@/components/ImageUpload";
import { LayersPanel } from "@/components/LayersPanel";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { Toolbar } from "@/components/Toolbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/Seperator";
import { useEditorStore } from "@/store/editorStore";

//  jsdom error - prevents from being rendered on the server
//  ensures it's rendered on the client
const FabricCanvas = dynamic(
    () =>
        import("@/components/canvas/FabricCanvas").then((mod) => mod.FabricCanvas),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <div className="text-gray-500">Loading Canvas...</div>
            </div>
        ),
    },
);

export default function EditorPage() {
    const canvasRef = useRef<FabricCanvasHandle>(null);
    const {
        backgroundImage,
        imageWidth,
        imageHeight,
        textLayers,
        selectedLayerId,
        history,
        historyIndex,
        addTextLayer,
        undo,
        redo,
        reset,
        loadFromLocalStorage,
    } = useEditorStore();

    useEffect(() => {
        loadFromLocalStorage();
    }, [loadFromLocalStorage]);

    const handleAddText = useCallback(() => {
        if (!backgroundImage) return;

        const newLayer = {
            content: "Double click to edit",
            x: imageWidth / 2 - 100,
            y: imageHeight / 2 - 25,
            width: 200,
            height: 50,
            rotation: 0,
            fontSize: 24,
            fontFamily: "Arial",
            fontWeight: "400",
            color: "#000000",
            opacity: 1,
            alignment: "center" as const,
            isSelected: true,
        };

        addTextLayer(newLayer);
    }, [addTextLayer, backgroundImage, imageWidth, imageHeight]);

    const handleExport = useCallback(() => {
        const dataURL = canvasRef.current?.exportCanvas();
        if (dataURL) {
            const link = document.createElement("a");
            link.download = "image-composition.png";
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, []);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;
    const canReset = !!backgroundImage;

    if (!backgroundImage) {
        return (
            <div className="flex h-screen flex-col">
                <header className="border-b bg-background p-4">
                    <div className="flex items-center justify-between">
                         <div
                            className="flex items-center space-x-2"
                         >
                            <ImageIcon className="h-8 w-8" />
                            <h1 className="text-xl font-bold opacity-80">
                                ImgTC.
                            </h1>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={reset}
                            className="text-destructive hover:text-destructive"
                            disabled={!canReset}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
                    </div>
                </header>
                <main className="flex flex-1 items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        <ImageUpload />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-background">
            <header className="border-b bg-background p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div
                            className="flex items-center space-x-2"
                        >
                            <ImageIcon className="h-8 w-8" />
                            <h1 className="text-xl font-bold opacity-80">
                                ImgTC.
                            </h1>
                        </div>
                        <Separator orientation="vertical" className="h-6" />
                        <div className="flex items-center space-x-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={undo}
                                disabled={!canUndo}
                                title="Undo (Ctrl+Z)"
                            >
                                <Undo2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={redo}
                                disabled={!canRedo}
                                title="Redo (Ctrl+Y)"
                            >
                                <Redo2 className="h-4 w-4" />
                            </Button>
                            <span className="px-2 text-sm text-muted-foreground">
                                {historyIndex + 1}/{history.length}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={handleAddText}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Text
                        </Button>
                        <Button
                            onClick={handleExport}
                            disabled={textLayers.length === 0}
                            size="sm"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export PNG
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={reset}
                            className="text-destructive hover:text-destructive"
                            disabled={!canReset}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex flex-1 overflow-hidden">
                <aside className="w-80 overflow-y-auto border-r bg-muted/20 p-4">
                    <div className="space-y-6">
                        <Toolbar />
                        {selectedLayerId && <PropertiesPanel />}
                        <LayersPanel />
                    </div>
                </aside>

                <div className="flex flex-1 items-center justify-center bg-slate-50 p-8">
                    <div className="relative">
                        <FabricCanvas
                            ref={canvasRef}
                            width={imageWidth}
                            height={imageHeight}
                            className="max-w-full max-h-full"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
