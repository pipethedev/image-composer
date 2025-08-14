'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';

import { useEditorStore } from '@/store/editorStore';
import type { TextLayer } from '@/types';
import { loadFont, loadImage } from '@/utils/canvas';

import * as fabric from 'fabric';

interface FabricCanvasProps {
    width?: number;
    height?: number;
    className?: string;
}

export interface FabricCanvasHandle {
    exportCanvas: () => string;
}

export const FabricCanvas = forwardRef<FabricCanvasHandle, FabricCanvasProps>(
    ({ width = 800, height = 600, className = '' }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
        const activeSelectionRef = useRef<fabric.ActiveSelection | null>(null);

        const {
            backgroundImage,
            imageWidth,
            imageHeight,
            textLayers,
            selectedLayerIds,
            updateTextLayer,
            updateTextLayerImmediate,
            selectLayer,
            selectMultipleLayers,
            deleteTextLayer,
            customFonts
        } = useEditorStore();

        useImperativeHandle(ref, () => ({
            exportCanvas: () => {
                const canvas = fabricCanvasRef.current;
                if (!canvas) return '';
                return canvas.toDataURL({ format: 'png', quality: 1, multiplier: 1 });
            }
        }));

        const updateLayerFromFabricObject = useCallback(
            (fabricObject: fabric.Object) => {
                const layerId = (fabricObject as any).data?.layerId;
                if (!layerId) return;

                const updates: Partial<TextLayer> = {
                    x: fabricObject.left ?? 0,
                    y: fabricObject.top ?? 0,
                    rotation: fabricObject.angle ?? 0
                };

                if (fabricObject.scaleX && fabricObject.scaleY) {
                    updates.width = (fabricObject.width ?? 0) * fabricObject.scaleX;
                    updates.height = (fabricObject.height ?? 0) * fabricObject.scaleY;
                    fabricObject.set({ scaleX: 1, scaleY: 1 });
                }

                updateTextLayer(layerId, updates);
            },
            [updateTextLayer]
        );

        const updateMultipleLayersFromActiveSelection = useCallback(
            (activeSelection: fabric.ActiveSelection) => {
                const objects = activeSelection.getObjects();

                objects.forEach((obj) => {
                    const layerId = (obj as any).data?.layerId;
                    if (!layerId) return;

                    const groupLeft = activeSelection.left ?? 0;
                    const groupTop = activeSelection.top ?? 0;
                    const groupAngle = activeSelection.angle ?? 0;
                    const groupScaleX = activeSelection.scaleX ?? 1;
                    const groupScaleY = activeSelection.scaleY ?? 1;

                    const objLeft = obj.left ?? 0;
                    const objTop = obj.top ?? 0;
                    const objAngle = obj.angle ?? 0;
                    const objScaleX = obj.scaleX ?? 1;
                    const objScaleY = obj.scaleY ?? 1;

                    const cos = Math.cos((groupAngle * Math.PI) / 180);
                    const sin = Math.sin((groupAngle * Math.PI) / 180);

                    const scaledX = objLeft * groupScaleX;
                    const scaledY = objTop * groupScaleY;

                    const rotatedX = scaledX * cos - scaledY * sin;
                    const rotatedY = scaledX * sin + scaledY * cos;

                    const finalX = groupLeft + rotatedX;
                    const finalY = groupTop + rotatedY;
                    const finalAngle = objAngle + groupAngle;
                    const finalScaleX = objScaleX * groupScaleX;
                    const finalScaleY = objScaleY * groupScaleY;

                    const updates: Partial<TextLayer> = {
                        x: finalX,
                        y: finalY,
                        rotation: finalAngle % 360
                    };

                    if (finalScaleX !== 1 || finalScaleY !== 1) {
                        updates.width = (obj.width ?? 0) * finalScaleX;
                        updates.height = (obj.height ?? 0) * finalScaleY;
                        obj.set({ scaleX: 1, scaleY: 1 });
                    }

                    updateTextLayer(layerId, updates);
                });

                activeSelection.set({
                    scaleX: 1,
                    scaleY: 1,
                    angle: 0
                });
            },
            [updateTextLayer]
        );

        const moveActiveObject = useCallback(
            (deltaX: number, deltaY: number) => {
                const canvas = fabricCanvasRef.current;
                if (!canvas) return;

                const activeObject = canvas.getActiveObject();
                if (!activeObject) return;

                if (activeObject.type === 'activeSelection') {
                    const activeSelection = activeObject as fabric.ActiveSelection;
                    activeSelection.set({
                        left: (activeSelection.left ?? 0) + deltaX,
                        top: (activeSelection.top ?? 0) + deltaY
                    });
                    canvas.renderAll();
                    updateMultipleLayersFromActiveSelection(activeSelection);
                } else {
                    activeObject.set({
                        left: (activeObject.left ?? 0) + deltaX,
                        top: (activeObject.top ?? 0) + deltaY
                    });
                    canvas.renderAll();
                    updateLayerFromFabricObject(activeObject);
                }
            },
            [updateLayerFromFabricObject, updateMultipleLayersFromActiveSelection]
        );

        const createActiveSelection = useCallback(() => {
            const canvas = fabricCanvasRef.current;
            if (!canvas || selectedLayerIds.length <= 1) return;

            const objectsToSelect = canvas.getObjects().filter((obj) => {
                const layerId = (obj as any).data?.layerId;
                return layerId && selectedLayerIds.includes(layerId);
            });

            if (objectsToSelect.length > 1) {
                const activeSelection = new fabric.ActiveSelection(objectsToSelect, {
                    canvas: canvas,
                    cornerStyle: 'circle',
                    cornerColor: '#4f46e5',
                    cornerSize: 8,
                    transparentCorners: false,
                    borderColor: '#4f46e5',
                    borderScaleFactor: 2
                });

                canvas.setActiveObject(activeSelection);
                activeSelectionRef.current = activeSelection;
                canvas.renderAll();
            }
        }, [selectedLayerIds]);

        useEffect(() => {
            if (!canvasRef.current || fabricCanvasRef.current) return;

            const canvas = new fabric.Canvas(canvasRef.current, {
                width,
                height,
                backgroundColor: '#f8f9fa',
                preserveObjectStacking: true,
                selection: true,
                enableRetinaScaling: true
            });
            fabricCanvasRef.current = canvas;

            const handleSelection = (e: { selected?: fabric.Object[] }) => {
                const activeObject = canvas.getActiveObject();

                if (activeObject && activeObject.type === 'activeSelection') {
                    const selection = activeObject as fabric.ActiveSelection;
                    const selectedIds = selection
                        .getObjects()
                        .map((obj) => (obj as any).data?.layerId)
                        .filter(Boolean);
                    selectMultipleLayers(selectedIds);
                    activeSelectionRef.current = selection;
                } else if (activeObject) {
                    const layerId = (activeObject as any).data?.layerId;
                    selectLayer(layerId || null);
                    activeSelectionRef.current = null;
                } else {
                    selectLayer(null);
                    activeSelectionRef.current = null;
                }
            };

            canvas.on('selection:created', handleSelection);
            canvas.on('selection:updated', handleSelection);
            canvas.on('selection:cleared', () => {
                selectLayer(null);
                activeSelectionRef.current = null;
            });

            canvas.on('object:modified', (e) => {
                if (!e.target) return;

                if (e.target.type === 'activeSelection') {
                    updateMultipleLayersFromActiveSelection(e.target as fabric.ActiveSelection);
                } else {
                    updateLayerFromFabricObject(e.target);
                }
            });

            canvas.on('text:changed', (e) => {
                const target = e.target as fabric.Textbox;
                const layerId = (target as any).data?.layerId;
                if (layerId && target.text) {
                    updateTextLayerImmediate(layerId, { content: target.text });
                }
            });

            canvas.on('text:editing:exited', (e: any) => {
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
                    case 'Delete':
                    case 'Backspace':
                        if (activeObject && activeObject.type === 'activeSelection') {
                            const selection = activeObject as fabric.ActiveSelection;
                            const layerIds = selection
                                .getObjects()
                                .map((obj) => (obj as any).data?.layerId)
                                .filter(Boolean);
                            layerIds.forEach((layerId) => deleteTextLayer(layerId));
                        } else if (activeObject && (activeObject as any).data?.layerId) {
                            deleteTextLayer((activeObject as any).data.layerId);
                        }
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        moveActiveObject(0, e.shiftKey ? -10 : -1);
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        moveActiveObject(0, e.shiftKey ? 10 : 1);
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        moveActiveObject(e.shiftKey ? -10 : -1, 0);
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        moveActiveObject(e.shiftKey ? 10 : 1, 0);
                        break;
                    case 'Escape':
                        canvas.discardActiveObject();
                        canvas.renderAll();
                        break;
                }
            };

            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                canvas.dispose();
                fabricCanvasRef.current = null;
                activeSelectionRef.current = null;
            };
        }, [
            width,
            height,
            selectLayer,
            selectMultipleLayers,
            deleteTextLayer,
            updateLayerFromFabricObject,
            updateMultipleLayersFromActiveSelection,
            moveActiveObject,
            updateTextLayer,
            updateTextLayerImmediate
        ]);

        useEffect(() => {
            const canvas = fabricCanvasRef.current;
            if (!canvas || !imageWidth || !imageHeight) return;

            const maxDisplayWidth = 1200;
            const maxDisplayHeight = 650;

            const scale = Math.min(maxDisplayWidth / imageWidth, maxDisplayHeight / imageHeight, 1);

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
                    excludeFromExport: false
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

            try {
                await loadFont(customFonts, layer.fontFamily);

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
                    lineHeight: layer.lineHeight ?? 1.16,
                    charSpacing: layer.letterSpacing ? (layer.letterSpacing * 1000) / layer.fontSize : 0,
                    cornerStyle: 'circle',
                    cornerColor: '#4f46e5',
                    cornerSize: 8,
                    transparentCorners: false,
                    borderColor: '#4f46e5',
                    borderScaleFactor: 2,
                    padding: 8,
                    splitByGrapheme: true,
                    data: { layerId: layer.id },
                    selectable: !layer.isLocked,
                    evented: !layer.isLocked,
                    hasControls: !layer.isLocked,
                    hasBorders: !layer.isLocked,
                    lockMovementX: layer.isLocked,
                    lockMovementY: layer.isLocked,
                    lockRotation: layer.isLocked,
                    lockScalingX: layer.isLocked,
                    lockScalingY: layer.isLocked
                });

                canvas.add(textObject);

                canvas.renderAll();

                return textObject;
            } catch (error) {
                const textObject = new fabric.Textbox(layer.content, {
                    fontFamily: 'Arial',
                });

                canvas.add(textObject);
                canvas.renderAll();
                return textObject;
            }
        }, [customFonts]);

        const updateFabricTextObject = useCallback(async (fabricObject: fabric.Textbox, layer: TextLayer) => {
            const canvas = fabricCanvasRef.current;
            if (!canvas) return;

            try {
                await loadFont(customFonts, layer.fontFamily);

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
                    lineHeight: layer.lineHeight ?? 1.16,
                    charSpacing: layer.letterSpacing ? (layer.letterSpacing * 1000) / layer.fontSize : 0,
                    selectable: !layer.isLocked,
                    evented: !layer.isLocked,
                    hasControls: !layer.isLocked,
                    hasBorders: !layer.isLocked,
                    lockMovementX: layer.isLocked,
                    lockMovementY: layer.isLocked,
                    lockRotation: layer.isLocked,
                    lockScalingX: layer.isLocked,
                    lockScalingY: layer.isLocked
                });

                canvas.renderAll();
            } catch (error) {
                console.error(`Failed to update text object with font ${layer.fontFamily}:`, error);

                fabricObject.set({
                    fontFamily: 'Arial'
                });
                canvas.renderAll();
            }
        }, [customFonts]);

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

            const promises = textLayers.map(async (layer) => {
                const fabricObject = objectsOnCanvas.find((obj) => (obj as any).data?.layerId === layer.id) as
                    | fabric.Textbox
                    | undefined;

                if (fabricObject) {
                    await updateFabricTextObject(fabricObject, layer);
                } else {
                    await createFabricTextObject(layer);
                }
            });

            Promise.all(promises).then(() => {
                if (selectedLayerIds.length > 1) {
                    createActiveSelection();
                } else if (selectedLayerIds.length === 1) {
                    const selectedObject = canvas
                        .getObjects()
                        .find((obj) => (obj as any).data?.layerId === selectedLayerIds[0]);
                    if (selectedObject) {
                        canvas.setActiveObject(selectedObject);
                    }
                } else {
                    canvas.discardActiveObject();
                }

                canvas.renderAll();
            });
        }, [textLayers, selectedLayerIds, createFabricTextObject, updateFabricTextObject, createActiveSelection]);

        return (
            <div className={`relative ${className}`}>
                <canvas
                    ref={canvasRef}
                    className='border border-gray-300 shadow-lg'
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                    }}
                />
            </div>
        );
    }
);

FabricCanvas.displayName = 'FabricCanvas';
