"use client";

import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GOOGLE_FONTS } from "@/lib/google-font";
import { useEditorStore } from "@/store/editorStore";
import type { TextLayer } from "@/types";
import { FONT_WEIGHT } from "@/utils/constant";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

export const PropertiesPanel: React.FC = () => {
    const { textLayers, selectedLayerId, updateTextLayer, updateTextLayerImmediate } =
        useEditorStore();

    const selectedLayer = textLayers.find(
        (layer) => layer.id === selectedLayerId,
    );

    const [localContent, setLocalContent] = useState(selectedLayer?.content ?? "");

    useEffect(() => {
        if (selectedLayer) {
            setLocalContent(selectedLayer.content);
        }
    }, [selectedLayer?.content, selectedLayer?.id]);

    useEffect(() => {
        if (!selectedLayer || localContent === selectedLayer.content) return;

        const timeoutId = setTimeout(() => {
            updateTextLayer(selectedLayer.id, { content: localContent });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [localContent]);

    const handleContentChange = useCallback(
        (value: string) => {
            setLocalContent(value);
            if (selectedLayer) {
                updateTextLayerImmediate(selectedLayer.id, { content: value });
            }
        },
        [selectedLayer, updateTextLayerImmediate],
    );

    const handleUpdate = useCallback(
        (updates: Partial<TextLayer>) => {
            if (selectedLayer) {
                updateTextLayer(selectedLayer.id, updates);
            }
        },
        [selectedLayer, updateTextLayer],
    );

    if (!selectedLayer) {
        return null;
    }

    const alignmentButtons = [
        { value: "left" as const, icon: AlignLeft, label: "Left" },
        { value: "center" as const, icon: AlignCenter, label: "Center" },
        { value: "right" as const, icon: AlignRight, label: "Right" },
    ] as const;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Properties</h3>
            </div>

            {/* Text Content */}
            <div className="space-y-2">
                <Label htmlFor="content">Text Content</Label>
                <Textarea
                    id="content"
                    value={localContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Enter your text..."
                    rows={3}
                />
            </div>

            {/* Font Family */}
            <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select
                    value={selectedLayer.fontFamily}
                    onValueChange={(value) => handleUpdate({ fontFamily: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                        {GOOGLE_FONTS.map((font) => (
                            <SelectItem
                                key={font.name}
                                value={font.name}
                                style={{ fontFamily: font.value }}
                            >
                                {font.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
                <Label htmlFor="fontSize">
                    Font Size: {selectedLayer.fontSize}px
                </Label>
                <Slider
                    value={[selectedLayer.fontSize]}
                    onValueChange={(value) => handleUpdate({ fontSize: value[0] })}
                    min={8}
                    max={200}
                    step={1}
                />
            </div>

            {/* Font Weight */}
            <div className="space-y-2">
                <Label htmlFor="fontWeight">Font Weight</Label>
                <Select
                    value={selectedLayer.fontWeight}
                    onValueChange={(value) => handleUpdate({ fontWeight: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {FONT_WEIGHT.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
                <Label htmlFor="color">Text Color</Label>
                <div className="flex space-x-2">
                    <Input
                        id="color"
                        type="color"
                        value={selectedLayer.color}
                        onChange={(e) => handleUpdate({ color: e.target.value })}
                        className="h-10 w-16 rounded border p-1"
                    />
                    <Input
                        value={selectedLayer.color}
                        onChange={(e) => handleUpdate({ color: e.target.value })}
                        placeholder="#000000"
                        className="flex-1"
                    />
                </div>
            </div>

            {/* Opacity */}
            <div className="space-y-2">
                <Label htmlFor="opacity">
                    Opacity: {Math.round(selectedLayer.opacity * 100)}%
                </Label>
                <Slider
                    value={[selectedLayer.opacity]}
                    onValueChange={(value) => handleUpdate({ opacity: value[0] })}
                    min={0}
                    max={1}
                    step={0.01}
                />
            </div>

            {/* Text Alignment */}
            <div className="space-y-2">
                <Label>Text Alignment</Label>
                <div className="flex space-x-1">
                    {alignmentButtons.map(({ value, icon: Icon, label }) => (
                        <Button
                            key={value}
                            variant={
                                selectedLayer.alignment === value ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handleUpdate({ alignment: value })}
                            className="flex-1"
                            title={label}
                        >
                            <Icon className="h-4 w-4" />
                        </Button>
                    ))}
                </div>
            </div>

            {/* Position & Size */}
            <div className="space-y-4">
                <Label>Position & Size</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Label htmlFor="x" className="text-xs">
                            X
                        </Label>
                        <Input
                            id="x"
                            type="number"
                            value={Math.round(selectedLayer.x)}
                            onChange={(e) =>
                                handleUpdate({ x: Number(e.target.value) })
                            }
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="y" className="text-xs">
                            Y
                        </Label>
                        <Input
                            id="y"
                            type="number"
                            value={Math.round(selectedLayer.y)}
                            onChange={(e) =>
                                handleUpdate({ y: Number(e.target.value) })
                            }
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="width" className="text-xs">
                            Width
                        </Label>
                        <Input
                            id="width"
                            type="number"
                            value={Math.round(selectedLayer.width)}
                            onChange={(e) =>
                                handleUpdate({ width: Number(e.target.value) })
                            }
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="height" className="text-xs">
                            Height
                        </Label>
                        <Input
                            id="height"
                            type="number"
                            value={Math.round(selectedLayer.height)}
                            onChange={(e) =>
                                handleUpdate({ height: Number(e.target.value) })
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Rotation */}
            <div className="space-y-2">
                <Label htmlFor="rotation">
                    Rotation: {Math.round(selectedLayer.rotation)}°
                </Label>
                <Slider
                    value={[selectedLayer.rotation]}
                    onValueChange={(value) => handleUpdate({ rotation: value[0] })}
                    min={-180}
                    max={180}
                    step={1}
                />
            </div>
        </div>
    );
};