'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/utils';

import { Eye, EyeOff, Lock, Type, Unlock, Users } from 'lucide-react';

export const LayersPanel: React.FC = () => {
    const {
        textLayers,
        selectedLayerIds,
        selectLayer,
        selectMultipleLayers,
        clearSelection,
        updateTextLayer,
        toggleLayerLock,
        addTextLayer
    } = useEditorStore();

    const sortedLayers = [...textLayers].sort((a, b) => b.zIndex - a.zIndex);
    const isMultiSelect = selectedLayerIds.length > 1;

    const handleLayerClick = (layerId: string, event: React.MouseEvent) => {
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;

        if (isShiftPressed && selectedLayerIds.length > 0) {
            const lastSelectedIndex = sortedLayers.findIndex(
                (l) => l.id === selectedLayerIds[selectedLayerIds.length - 1]
            );
            const currentIndex = sortedLayers.findIndex((l) => l.id === layerId);

            if (lastSelectedIndex !== -1 && currentIndex !== -1) {
                const start = Math.min(lastSelectedIndex, currentIndex);
                const end = Math.max(lastSelectedIndex, currentIndex);
                const rangeIds = sortedLayers.slice(start, end + 1).map((l) => l.id);

                const newSelection = [...new Set([...selectedLayerIds, ...rangeIds])];
                selectMultipleLayers(newSelection);
            }
        } else {
            selectLayer(layerId, isCtrlPressed);
        }
    };

    const handleToggleVisibility = (layerId: string, currentOpacity: number) => {
        const newOpacity = currentOpacity > 0 ? 0 : 1;
        updateTextLayer(layerId, { opacity: newOpacity });
    };

    const handleSelectAll = () => {
        const allIds = textLayers.map((l) => l.id);
        if (allIds.length !== selectedLayerIds.length || !allIds.every((id) => selectedLayerIds.includes(id))) {
            selectMultipleLayers(allIds);
        }
    };

    const handleClearSelection = () => {
        clearSelection();
    };

    const addTestLayers = () => {
        const testLayers = [
            {
                content: 'Header Text',
                x: 100,
                y: 50,
                width: 300,
                height: 50,
                fontSize: 32,
                fontFamily: 'Arial',
                fontWeight: '700',
                color: '#1a1a1a',
                opacity: 1,
                alignment: 'center' as const,
                rotation: 0
            },
            {
                content: 'Subtitle Text',
                x: 100,
                y: 120,
                width: 300,
                height: 40,
                fontSize: 20,
                fontFamily: 'Georgia',
                fontWeight: '400',
                color: '#666666',
                opacity: 1,
                alignment: 'center' as const,
                rotation: 0
            },
            {
                content: 'Body Text',
                x: 100,
                y: 180,
                width: 300,
                height: 60,
                fontSize: 16,
                fontFamily: 'Times New Roman',
                fontWeight: '400',
                color: '#333333',
                opacity: 0.9,
                alignment: 'left' as const,
                rotation: 0
            }
        ];

        testLayers.forEach((layer: any, index) => {
            setTimeout(() => addTextLayer(layer), index * 100);
        });
    };

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <h3 className='flex items-center gap-2 text-sm font-semibold'>
                    {isMultiSelect && <Users className='h-4 w-4' />}
                    Layers
                </h3>
                <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                    {isMultiSelect && (
                        <span className='rounded bg-blue-100 px-2 py-1 text-blue-700'>
                            {selectedLayerIds.length} selected
                        </span>
                    )}
                    <span>
                        {textLayers.length} layer{textLayers.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {textLayers.length > 0 && (
                <div className='flex gap-2'>
                    <Button variant='outline' size='sm' onClick={handleSelectAll} className='flex-1 text-xs'>
                        Select All
                    </Button>
                    {selectedLayerIds.length > 0 && (
                        <Button variant='outline' size='sm' onClick={handleClearSelection} className='flex-1 text-xs'>
                            Clear ({selectedLayerIds.length})
                        </Button>
                    )}
                </div>
            )}

            <div className='space-y-1'>
                {sortedLayers.length === 0 ? (
                    <div className='text-muted-foreground py-8 text-center'>
                        <Type className='mx-auto mb-2 h-8 w-8 opacity-50' />
                        <p className='text-sm'>No text layers</p>
                        <p className='mb-4 text-xs'>Add a text layer to get started</p>

                        <Button variant='outline' size='sm' onClick={addTestLayers} className='text-xs'>
                            Add Test Layers
                        </Button>
                    </div>
                ) : (
                    <>
                        {sortedLayers.map((layer) => (
                            <div
                                role='button'
                                key={layer.id}
                                className={cn(
                                    'group flex cursor-pointer items-center space-x-2 rounded border p-2 transition-colors',
                                    selectedLayerIds.includes(layer.id)
                                        ? 'bg-primary/10 border-primary ring-primary/20 ring-1'
                                        : 'bg-background hover:bg-muted/50 border-border',
                                    layer.isLocked && 'opacity-70'
                                )}
                                onClick={(e) => handleLayerClick(layer.id, e)}>
                                <div className='flex items-center gap-1'>
                                    <Type className='text-muted-foreground h-4 w-4' />
                                    {layer.isLocked && <Lock className='h-3 w-3 text-amber-600' />}
                                </div>

                                <div className='min-w-0 flex-1'>
                                    <p
                                        className={cn(
                                            'truncate text-sm font-medium',
                                            layer.isLocked && 'text-muted-foreground'
                                        )}>
                                        {layer.content || 'Empty text'}
                                    </p>
                                    <p className='text-muted-foreground text-xs'>
                                        {layer.fontFamily} • {layer.fontSize}px
                                        {layer.opacity === 0 && ' • Hidden'}
                                    </p>
                                </div>

                                <div className='flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        className='h-6 w-6 p-0'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleLayerLock(layer.id);
                                        }}
                                        title={layer.isLocked ? 'Unlock layer' : 'Lock layer'}>
                                        {layer.isLocked ? (
                                            <Lock className='h-3 w-3 text-amber-600' />
                                        ) : (
                                            <Unlock className='h-3 w-3' />
                                        )}
                                    </Button>

                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        className='h-6 w-6 p-0'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleVisibility(layer.id, layer.opacity);
                                        }}
                                        title={layer.opacity > 0 ? 'Hide layer' : 'Show layer'}>
                                        {layer.opacity > 0 ? (
                                            <Eye className='h-3 w-3' />
                                        ) : (
                                            <EyeOff className='text-muted-foreground h-3 w-3' />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <div className='text-muted-foreground mt-4 space-y-1 border-t pt-3 text-xs'>
                            <div className='font-medium'>Multi-select tips (Coming soon):</div>
                            <div>• Ctrl/Cmd + Click: Add/remove from selection</div>
                            <div>• Shift + Click: Range selection</div>
                            <div>• Use Properties panel for group transforms</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
