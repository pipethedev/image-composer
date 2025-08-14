'use client';

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GOOGLE_FONTS } from '@/lib/google-font';
import { useEditorStore } from '@/store/editorStore';
import type { TextLayer } from '@/types';
import { FONT_WEIGHT } from '@/utils/constant';

import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { AlignCenter, AlignLeft, AlignRight, Copy, Lock, Trash2, Unlock, Users } from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
    const {
        textLayers,
        customFonts,
        selectedLayerId,
        selectedLayerIds,
        updateTextLayer,
        updateTextLayerImmediate,
        updateMultipleLayers,
        toggleLayerLock,
        duplicateLayer,
        duplicateMultipleLayers,
        deleteTextLayer,
        deleteMultipleLayers,
        addCustomFont
    } = useEditorStore();

    const selectedLayer = textLayers.find((layer) => layer.id === selectedLayerId);

    const selectedLayers = textLayers.filter((layer) => selectedLayerIds.includes(layer.id));

    const isMultiSelect = selectedLayerIds.length > 1;
    const hasLockedLayers = selectedLayers.some((layer) => layer.isLocked);
    const allLayersLocked = selectedLayers.length > 0 && selectedLayers.every((layer) => layer.isLocked);

    const [localContent, setLocalContent] = useState(selectedLayer?.content ?? '');

    const handleFontUpload = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            const validTypes = ['font/ttf', 'font/otf', 'application/font-sfnt', 'application/x-font-ttf'];
            const isValidType = validTypes.includes(file.type) ||
                               file.name.toLowerCase().endsWith('.ttf') ||
                               file.name.toLowerCase().endsWith('.otf');

            if (!isValidType) {
                alert('Please upload a valid TTF or OTF font file.');
                return;
            }

            try {
                const fontName = file.name.replace(/\.(ttf|otf)$/i, '');
                const fontUrl = URL.createObjectURL(file);
                addCustomFont(fontName, fontUrl);

                event.target.value = '';
            } catch (error) {
                console.error('Error uploading font:', error);
                alert('Failed to upload font. Please try again.');
            }
        },
        [addCustomFont]
    );

    useEffect(() => {
        if (selectedLayer) {
            setLocalContent(selectedLayer.content);
        }
    }, [selectedLayer?.content, selectedLayer?.id]);

    useEffect(() => {
        if (!selectedLayer || localContent === selectedLayer.content || selectedLayer.isLocked) return;

        const timeoutId = setTimeout(() => {
            updateTextLayer(selectedLayer.id, { content: localContent });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [localContent, selectedLayer, updateTextLayer]);

    const handleContentChange = useCallback(
        (value: string) => {
            setLocalContent(value);
            if (selectedLayer && !selectedLayer.isLocked) {
                updateTextLayerImmediate(selectedLayer.id, { content: value });
            }
        },
        [selectedLayer, updateTextLayerImmediate]
    );

    const handleUpdate = useCallback(
        (updates: Partial<TextLayer>) => {
            if (isMultiSelect) {
                updateMultipleLayers(selectedLayerIds, updates);
            } else if (selectedLayer && !selectedLayer.isLocked) {
                updateTextLayer(selectedLayer.id, updates);
            }
        },
        [selectedLayer, selectedLayerIds, isMultiSelect, updateTextLayer, updateMultipleLayers]
    );

    const handleToggleLock = useCallback(() => {
        selectedLayerIds.forEach((id) => {
            toggleLayerLock(id);
        });
    }, [selectedLayerIds, toggleLayerLock]);

    const handleDuplicate = useCallback(() => {
        if (isMultiSelect) {
            duplicateMultipleLayers(selectedLayerIds);
        } else if (selectedLayer) {
            duplicateLayer(selectedLayer.id);
        }
    }, [selectedLayer, selectedLayerIds, isMultiSelect, duplicateLayer, duplicateMultipleLayers]);

    const handleDelete = useCallback(() => {
        if (isMultiSelect) {
            deleteMultipleLayers(selectedLayerIds);
        } else if (selectedLayer) {
            deleteTextLayer(selectedLayer.id);
        }
    }, [selectedLayer, selectedLayerIds, isMultiSelect, deleteTextLayer, deleteMultipleLayers]);

    const getCommonValue = <T,>(getter: (layer: TextLayer) => T): T | null => {
        if (selectedLayers.length === 0) return null;
        const firstValue = getter(selectedLayers[0]);
        return selectedLayers.every((layer) => getter(layer) === firstValue) ? firstValue : null;
    };

    const commonFontFamily = getCommonValue((layer) => layer.fontFamily);
    const commonFontSize = getCommonValue((layer) => layer.fontSize);
    const commonFontWeight = getCommonValue((layer) => layer.fontWeight);
    const commonColor = getCommonValue((layer) => layer.color);
    const commonOpacity = getCommonValue((layer) => layer.opacity);
    const commonAlignment = getCommonValue((layer) => layer.alignment);
    const commonRotation = getCommonValue((layer) => layer.rotation);
    const commonLineHeight = getCommonValue((layer) => layer.lineHeight ?? 1.16);
    const commonLetterSpacing = getCommonValue((layer) => layer.letterSpacing ?? 0);

    if (selectedLayerIds.length === 0) {
        return (
            <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                    <h3 className='text-sm font-semibold'>Properties</h3>
                </div>
                <div className='text-muted-foreground py-8 text-center text-sm'>
                    Select a layer to edit its properties
                </div>
            </div>
        );
    }

    const alignmentButtons = [
        { value: 'left' as const, icon: AlignLeft, label: 'Left' },
        { value: 'center' as const, icon: AlignCenter, label: 'Center' },
        { value: 'right' as const, icon: AlignRight, label: 'Right' }
    ] as const;

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>
                    {isMultiSelect ? (
                        <div className='flex items-center gap-2'>
                            <Users className='h-4 w-4' />
                            Properties ({selectedLayerIds.length} layers)
                        </div>
                    ) : (
                        'Properties'
                    )}
                </h3>
            </div>

            <div className='flex gap-2'>
                <Button
                    variant='outline'
                    size='sm'
                    onClick={handleToggleLock}
                    className='flex-1'
                    title={allLayersLocked ? 'Unlock layers' : 'Lock layers'}>
                    {allLayersLocked ? <Lock className='h-4 w-4' /> : <Unlock className='h-4 w-4' />}
                </Button>
                <Button
                    variant='outline'
                    size='sm'
                    onClick={handleDuplicate}
                    className='flex-1'
                    title='Duplicate layers'>
                    <Copy className='h-4 w-4' />
                </Button>
                <Button
                    variant='outline'
                    size='sm'
                    onClick={handleDelete}
                    className='flex-1'
                    title='Delete layers'
                    disabled={allLayersLocked}>
                    <Trash2 className='h-4 w-4' />
                </Button>
            </div>

            {hasLockedLayers && (
                <div className='rounded bg-amber-50 p-2 text-xs text-amber-600'>
                    {allLayersLocked ? 'All selected layers are locked' : 'Some selected layers are locked'}
                </div>
            )}

            {!isMultiSelect && selectedLayer && (
                <div className='space-y-2'>
                    <Label htmlFor='content'>Text Content</Label>
                    <Textarea
                        id='content'
                        value={localContent}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder='Enter your text...'
                        rows={3}
                        disabled={selectedLayer.isLocked}
                    />
                </div>
            )}

            <div className='space-y-2'>
                <Label htmlFor='fontUpload'>Upload Custom Font</Label>
                <Input
                    id='fontUpload'
                    type='file'
                    accept='.ttf,.otf'
                    onChange={handleFontUpload}
                    className='text-sm'
                    disabled={allLayersLocked}
                />
            </div>

            <div className='space-y-2'>
                <Label htmlFor='fontFamily'>Font Family</Label>
                <Select
                    value={commonFontFamily || ''}
                    onValueChange={(value) => handleUpdate({ fontFamily: value })}
                    disabled={allLayersLocked}>
                    <SelectTrigger>
                        <SelectValue placeholder={isMultiSelect ? 'Mixed' : 'Select font'} />
                    </SelectTrigger>
                    <SelectContent className='max-h-60'>
                        {GOOGLE_FONTS.map((font) => (
                            <SelectItem key={font.name} value={font.name} style={{ fontFamily: font.value }}>
                                {font.name}
                            </SelectItem>
                        ))}
                        {customFonts.map((font) => (
                            <SelectItem key={font.name} value={font.name} style={{ fontFamily: font.name }}>
                                {font.name} (Custom)
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className='space-y-2'>
                <Label htmlFor='fontSize'>Font Size: {commonFontSize !== null ? `${commonFontSize}px` : 'Mixed'}</Label>
                <Slider
                    value={commonFontSize !== null ? [commonFontSize] : [16]}
                    onValueChange={(value) => handleUpdate({ fontSize: value[0] })}
                    min={8}
                    max={200}
                    step={1}
                    disabled={allLayersLocked}
                />
            </div>

            <div className='space-y-2'>
                <Label htmlFor='fontWeight'>Font Weight</Label>
                <Select
                    value={commonFontWeight || ''}
                    onValueChange={(value) => handleUpdate({ fontWeight: value })}
                    disabled={allLayersLocked}>
                    <SelectTrigger>
                        <SelectValue placeholder={isMultiSelect ? 'Mixed' : 'Select weight'} />
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

            <div className='space-y-2'>
                <Label htmlFor='lineHeight'>
                    Line Height: {commonLineHeight !== null ? commonLineHeight.toFixed(2) : 'Mixed'}
                </Label>
                <Slider
                    value={commonLineHeight !== null ? [commonLineHeight] : [1.16]}
                    onValueChange={(value) => handleUpdate({ lineHeight: value[0] })}
                    min={0.8}
                    max={3}
                    step={0.01}
                    disabled={allLayersLocked}
                />
            </div>

            <div className='space-y-2'>
                <Label htmlFor='letterSpacing'>
                    Letter Spacing: {commonLetterSpacing !== null ? `${commonLetterSpacing}px` : 'Mixed'}
                </Label>
                <Slider
                    value={commonLetterSpacing !== null ? [commonLetterSpacing] : [0]}
                    onValueChange={(value) => handleUpdate({ letterSpacing: value[0] })}
                    min={-10}
                    max={50}
                    step={1}
                    disabled={allLayersLocked}
                />
            </div>

            <div className='space-y-2'>
                <Label htmlFor='color'>Text Color</Label>
                <div className='flex space-x-2'>
                    <Input
                        id='color'
                        type='color'
                        value={commonColor || '#000000'}
                        onChange={(e) => handleUpdate({ color: e.target.value })}
                        className='h-10 w-16 rounded border p-1'
                        disabled={allLayersLocked}
                    />
                    <Input
                        value={commonColor || ''}
                        onChange={(e) => handleUpdate({ color: e.target.value })}
                        placeholder={isMultiSelect ? 'Mixed colors' : '#000000'}
                        className='flex-1'
                        disabled={allLayersLocked}
                    />
                </div>
            </div>

            <div className='space-y-2'>
                <Label htmlFor='opacity'>
                    Opacity: {commonOpacity !== null ? `${Math.round(commonOpacity * 100)}%` : 'Mixed'}
                </Label>
                <Slider
                    value={commonOpacity !== null ? [commonOpacity] : [1]}
                    onValueChange={(value) => handleUpdate({ opacity: value[0] })}
                    min={0}
                    max={1}
                    step={0.01}
                    disabled={allLayersLocked}
                />
            </div>

            <div className='space-y-2'>
                <Label>Text Alignment</Label>
                <div className='mt-2 flex space-x-1'>
                    {alignmentButtons.map(({ value, icon: Icon, label }) => (
                        <Button
                            key={value}
                            variant={commonAlignment === value ? 'default' : 'outline'}
                            size='sm'
                            onClick={() => handleUpdate({ alignment: value })}
                            className='flex-1'
                            title={label}
                            disabled={allLayersLocked}>
                            <Icon className='h-4 w-4' />
                        </Button>
                    ))}
                </div>
            </div>

            {!isMultiSelect && selectedLayer && (
                <div className='space-y-4'>
                    <Label>Position & Size</Label>
                    <div className='grid grid-cols-2 gap-2'>
                        <div className='space-y-1'>
                            <Label htmlFor='x' className='text-xs'>
                                X
                            </Label>
                            <Input
                                id='x'
                                type='number'
                                value={Math.round(selectedLayer.x)}
                                onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
                                disabled={selectedLayer.isLocked}
                            />
                        </div>
                        <div className='space-y-1'>
                            <Label htmlFor='y' className='text-xs'>
                                Y
                            </Label>
                            <Input
                                id='y'
                                type='number'
                                value={Math.round(selectedLayer.y)}
                                onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
                                disabled={selectedLayer.isLocked}
                            />
                        </div>
                        <div className='space-y-1'>
                            <Label htmlFor='width' className='text-xs'>
                                Width
                            </Label>
                            <Input
                                id='width'
                                type='number'
                                value={Math.round(selectedLayer.width)}
                                onChange={(e) => handleUpdate({ width: Number(e.target.value) })}
                                disabled={selectedLayer.isLocked}
                            />
                        </div>
                        <div className='space-y-1'>
                            <Label htmlFor='height' className='text-xs'>
                                Height
                            </Label>
                            <Input
                                id='height'
                                type='number'
                                value={Math.round(selectedLayer.height)}
                                onChange={(e) => handleUpdate({ height: Number(e.target.value) })}
                                disabled={selectedLayer.isLocked}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className='space-y-2'>
                <Label htmlFor='rotation'>
                    Rotation: {commonRotation !== null ? `${Math.round(commonRotation)}°` : 'Mixed'}
                </Label>
                <Slider
                    value={commonRotation !== null ? [commonRotation] : [0]}
                    onValueChange={(value) => handleUpdate({ rotation: value[0] })}
                    min={-180}
                    max={180}
                    step={1}
                    disabled={allLayersLocked}
                />
            </div>
        </div>
    );
};
