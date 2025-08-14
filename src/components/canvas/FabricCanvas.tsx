"use client";

import * as fabric from "fabric";
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
} from "react";
import { useEditorStore } from "@/store/editorStore";
import type { TextLayer } from "@/types";
import { loadGoogleFont, loadImage } from "@/utils/canvas";

interface FabricCanvasProps {
    width?: number;
    height?: number;
    className?: string;
}

export interface FabricCanvasHandle {
    exportCanvas: () => string;
}

export const FabricCanvas = forwardRef<FabricCanvasHandle, FabricCanvasProps>(
    ({ width = 800, height = 600, className = "" }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

        const {
            backgroundImage,
            imageWidth,
            imageHeight,
            textLayers,
            updateTextLayer,
            updateTextLayerImmediate,
            selectLayer,
            deleteTextLayer,
        } = useEditorStore();

        useImperativeHandle(ref, () => ({
            exportCanvas: () => {
                const canvas = fabricCanvasRef.current;
                if (!canvas) return "";
                return canvas.toDataURL({ format: "png", quality: 1, multiplier: 1 });
            },
        }));

        const updateLayerFromFabricObject = useCallback(
            (fabricObject: fabric.Object) => {
                const layerId = (fabricObject as any).data?.layerId;
                if (!layerId) return;

                const updates: Partial<TextLayer> = {
                    x: fabricObject.left ?? 0,
                    y: fabricObject.top ?? 0,
                    rotation: fabricObject.angle ?? 0,
                };

                if (fabricObject.scaleX && fabricObject.scaleY) {
                    updates.width = (fabricObject.width ?? 0) * fabricObject.scaleX;
                    updates.height = (fabricObject.height ?? 0) * fabricObject.scaleY;
                    fabricObject.set({ scaleX: 1, scaleY: 1 });
                }

                updateTextLayer(layerId, updates);
            },
            [updateTextLayer],
        );

        const moveActiveObject = useCallback(
            (deltaX: number, deltaY: number) => {
                const canvas = fabricCanvasRef.current;
                if (!canvas) return;

                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    activeObject.set({
                        left: (activeObject.left ?? 0) + deltaX,
                        top: (activeObject.top ?? 0) + deltaY,
                    });
                    canvas.renderAll();
                    updateLayerFromFabricObject(activeObject);
                }
            },
            [updateLayerFromFabricObject],
        );

        useEffect(() => {
            if (!canvasRef.current || fabricCanvasRef.current) return;

            const canvas = new fabric.Canvas(canvasRef.current, {
                width,
                height,
                backgroundColor: "#f8f9fa",
                preserveObjectStacking: true,
            });
            fabricCanvasRef.current = canvas;

            const handleSelection = (e: { selected?: fabric.Object[] }) => {
                const activeObject = e.selected?.[0];
                selectLayer(activeObject ? (activeObject as any).data.layerId : null);
            };

            canvas.on("selection:created", handleSelection);
            canvas.on("selection:updated", handleSelection);
            canvas.on("selection:cleared", () => selectLayer(null));
            canvas.on("object:modified", (e) => {
                if (e.target) updateLayerFromFabricObject(e.target);
            });

            canvas.on("text:changed", (e) => {
                const target = e.target as fabric.Textbox;
                const layerId = (target as any).data?.layerId;
                if (layerId && target.text) {
                    updateTextLayerImmediate(layerId, { content: target.text });
                }
            });

            canvas.on("editing:exited", (e) => {
                const target = e.target as fabric.Textbox;
                const layerId = (target as any).data?.layerId;
                if (layerId && target.text) {
                    updateTextLayer(layerId, { content: target.text });
                }
            });

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.target !== document.body) return;
                const activeObject = canvas.getActiveObject();

                switch (e.key) {
                    case "Delete":
                    case "Backspace":
                        if (activeObject && (activeObject as any).data?.layerId) {
                            deleteTextLayer((activeObject as any).data.layerId);
                        }
                        break;
                    case "ArrowUp":
                        e.preventDefault();
                        moveActiveObject(0, e.shiftKey ? -10 : -1);
                        break;
                    case "ArrowDown":
                        e.preventDefault();
                        moveActiveObject(0, e.shiftKey ? 10 : 1);
                        break;
                    case "ArrowLeft":
                        e.preventDefault();
                        moveActiveObject(e.shiftKey ? -10 : -1, 0);
                        break;
                    case "ArrowRight":
                        e.preventDefault();
                        moveActiveObject(e.shiftKey ? 10 : 1, 0);
                        break;
                }
            };

            document.addEventListener("keydown", handleKeyDown);

            return () => {
                document.removeEventListener("keydown", handleKeyDown);
                canvas.dispose();
                fabricCanvasRef.current = null;
            };
        }, [
            width,
            height,
            selectLayer,
            deleteTextLayer,
            updateLayerFromFabricObject,
            moveActiveObject,
            updateTextLayer,
            updateTextLayerImmediate,
        ]);

        useEffect(() => {
            const canvas = fabricCanvasRef.current;
            if (!canvas || !imageWidth || !imageHeight) return;

            const maxDisplayWidth = 1200;
            const maxDisplayHeight = 650;

            const scale = Math.min(
                maxDisplayWidth / imageWidth,
                maxDisplayHeight / imageHeight,
                1,
            );

            const displayWidth = imageWidth * scale;
            const displayHeight = imageHeight * scale;

            canvas.setDimensions({ width: displayWidth, height: displayHeight });
            canvas.setZoom(scale);
            canvas.renderAll();
        }, [imageWidth, imageHeight]);

        useEffect(() => {
            const canvas = fabricCanvasRef.current;
            if (!canvas || !backgroundImage) return;

            loadImage(backgroundImage).then((img) => {
                const fabricImg = new fabric.Image(img, {
                    selectable: false,
                    evented: false,
                    excludeFromExport: false,
                });

                const canvasWidth = imageWidth ?? width;
                const canvasHeight = imageHeight ?? height;
                const scaleX = canvasWidth / fabricImg.width!;
                const scaleY = canvasHeight / fabricImg.height!;
                fabricImg.set({ scaleX, scaleY });

                canvas.backgroundImage = fabricImg;
                canvas.renderAll();
            });
        }, [backgroundImage, imageWidth, imageHeight, width, height]);

        const createFabricTextObject = useCallback(async (layer: TextLayer) => {
            const canvas = fabricCanvasRef.current;
            if (!canvas) return;

            await loadGoogleFont(layer.fontFamily);

            const textObject = new fabric.Textbox(layer.content, {
                left: layer.x,
                top: layer.y,
                width: layer.width,
                height: layer.height,
                fontSize: layer.fontSize,
                fontFamily: layer.fontFamily,
                fontWeight: layer.fontWeight,
                fill: layer.color,
                opacity: layer.opacity,
                textAlign: layer.alignment,
                angle: layer.rotation,
                cornerStyle: "circle",
                cornerColor: "#4f46e5",
                cornerSize: 8,
                transparentCorners: false,
                borderColor: "#4f46e5",
                borderScaleFactor: 2,
                padding: 8,
                splitByGrapheme: true,
                data: { layerId: layer.id },
            });

            canvas.add(textObject);
            if (layer.isSelected) {
                canvas.setActiveObject(textObject);
            }
        }, []);

        const updateFabricTextObject = useCallback(
            async (fabricObject: fabric.Textbox, layer: TextLayer) => {
                const canvas = fabricCanvasRef.current;
                if (!canvas) return;

                await loadGoogleFont(layer.fontFamily);

                fabricObject.set({
                    text: layer.content,
                    left: layer.x,
                    top: layer.y,
                    width: layer.width,
                    height: layer.height,
                    fontSize: layer.fontSize,
                    fontFamily: layer.fontFamily,
                    fontWeight: layer.fontWeight,
                    fill: layer.color,
                    opacity: layer.opacity,
                    textAlign: layer.alignment,
                    angle: layer.rotation,
                });

                if (layer.isSelected && canvas.getActiveObject() !== fabricObject) {
                    canvas.setActiveObject(fabricObject);
                } else if (
                    !layer.isSelected &&
                    canvas.getActiveObject() === fabricObject
                ) {
                    canvas.discardActiveObject();
                }
            },
            [],
        );

        useEffect(() => {
            const canvas = fabricCanvasRef.current;
            if (!canvas) return;

            const existingLayerIds = new Set(textLayers.map((l) => l.id));
            const objectsOnCanvas = canvas.getObjects();

            objectsOnCanvas.forEach((obj) => {
                const layerId = (obj as any).data?.layerId;
                if (layerId && !existingLayerIds.has(layerId)) {
                    canvas.remove(obj);
                }
            });

            textLayers.forEach((layer) => {
                const fabricObject = objectsOnCanvas.find(
                    (obj) => (obj as any).data?.layerId === layer.id,
                ) as fabric.Textbox | undefined;

                if (fabricObject) {
                    updateFabricTextObject(fabricObject, layer);
                } else {
                    createFabricTextObject(layer);
                }
            });

            canvas.renderAll();
        }, [textLayers, createFabricTextObject, updateFabricTextObject]);

        return (
            <div className={`relative ${className}`}>
                <canvas
                    ref={canvasRef}
                    className="border border-gray-300 shadow-lg"
                    style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                    }}
                />
            </div>
        );
    },
);

FabricCanvas.displayName = "FabricCanvas";
