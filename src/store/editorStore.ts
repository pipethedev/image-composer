import type { EditorState, TextLayer } from '@/types';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface EditorStore extends EditorState {
    selectedLayerIds: string[];
    setBackgroundImage: (imageUrl: string, width: number, height: number) => void;
    addTextLayer: (layer: Omit<TextLayer, 'id' | 'zIndex'>) => void;
    updateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
    updateTextLayerImmediate: (id: string, updates: Partial<TextLayer>) => void;
    updateMultipleLayers: (ids: string[], updates: Partial<TextLayer>) => void;
    updateMultipleLayersImmediate: (ids: string[], updates: Partial<TextLayer>) => void;
    deleteTextLayer: (id: string) => void;
    deleteMultipleLayers: (ids: string[]) => void;
    selectLayer: (id: string | null, multiSelect?: boolean) => void;
    selectMultipleLayers: (ids: string[]) => void;
    clearSelection: () => void;
    toggleLayerLock: (id: string) => void;
    moveLayerUp: (id: string) => void;
    moveLayerDown: (id: string) => void;
    duplicateLayer: (id: string) => void;
    duplicateMultipleLayers: (ids: string[]) => void;
    undo: () => void;
    redo: () => void;
    reset: () => void;
    saveToLocalStorage: () => void;
    loadFromLocalStorage: () => void;
    addCustomFont: (name: string, src: string) => void;
}

const initialState: EditorState & { selectedLayerIds: string[] } = {
    backgroundImage: null,
    imageWidth: 0,
    imageHeight: 0,
    textLayers: [],
    selectedLayerId: null,
    selectedLayerIds: [],
    history: [],
    historyIndex: -1,
    isLoading: false,
    customFonts: []
};

const STORAGE_KEY = 'image-text-composer-state';
const MAX_HISTORY = 20;

export const useEditorStore = create<EditorStore>()(
    subscribeWithSelector((set, get) => ({
        ...initialState,

        setBackgroundImage: (imageUrl, width, height) => {
            set((state) => {
                const newState = {
                    ...state,
                    backgroundImage: imageUrl,
                    imageWidth: width,
                    imageHeight: height,
                    textLayers: [],
                    selectedLayerId: null,
                    selectedLayerIds: []
                };
                return addToHistory(newState, state);
            });
        },

        addTextLayer: (layer) => {
            set((state) => {
                const id = `layer-${Date.now()}-${Math.random()}`;
                const maxZ = Math.max(...state.textLayers.map((l) => l.zIndex), 0);
                const newLayer: TextLayer = {
                    ...layer,
                    id,
                    zIndex: maxZ + 1,
                    isSelected: false,
                    isLocked: false,
                    lineHeight: layer.lineHeight ?? 1.16,
                    letterSpacing: layer.letterSpacing ?? 0
                };

                const newState = {
                    ...state,
                    textLayers: [...state.textLayers, newLayer],
                    selectedLayerId: id,
                    selectedLayerIds: [id]
                };
                return addToHistory(newState, state);
            });
        },

        updateTextLayer: (id, updates) => {
            set((state) => {
                const layer = state.textLayers.find((l) => l.id === id);
                if (layer?.isLocked && Object.keys(updates).some((key) => key !== 'isSelected' && key !== 'isLocked')) {
                    return state;
                }

                const newState = {
                    ...state,
                    textLayers: state.textLayers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer))
                };
                return addToHistory(newState, state);
            });
        },

        updateTextLayerImmediate: (id, updates) => {
            set((state) => {
                const layer = state.textLayers.find((l) => l.id === id);
                if (layer?.isLocked && Object.keys(updates).some((key) => key !== 'isSelected' && key !== 'isLocked')) {
                    return state;
                }

                return {
                    ...state,
                    textLayers: state.textLayers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer))
                };
            });
        },

        updateMultipleLayers: (ids, updates) => {
            set((state) => {
                const newState = {
                    ...state,
                    textLayers: state.textLayers.map((layer) => {
                        if (ids.includes(layer.id) && !layer.isLocked) {
                            return { ...layer, ...updates };
                        }
                        return layer;
                    })
                };
                return addToHistory(newState, state);
            });
        },

        updateMultipleLayersImmediate: (ids, updates) => {
            set((state) => ({
                ...state,
                textLayers: state.textLayers.map((layer) => {
                    if (ids.includes(layer.id) && !layer.isLocked) {
                        return { ...layer, ...updates };
                    }
                    return layer;
                })
            }));
        },

        deleteTextLayer: (id) => {
            set((state) => {
                const layer = state.textLayers.find((l) => l.id === id);
                if (layer?.isLocked) {
                    return state;
                }

                const newState = {
                    ...state,
                    textLayers: state.textLayers.filter((layer) => layer.id !== id),
                    selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
                    selectedLayerIds: state.selectedLayerIds.filter((layerId) => layerId !== id)
                };
                return addToHistory(newState, state);
            });
        },

        deleteMultipleLayers: (ids) => {
            set((state) => {
                const unlocked = ids.filter((id) => {
                    const layer = state.textLayers.find((l) => l.id === id);
                    return !layer?.isLocked;
                });

                if (unlocked.length === 0) return state;

                const newState = {
                    ...state,
                    textLayers: state.textLayers.filter((layer) => !unlocked.includes(layer.id)),
                    selectedLayerId: unlocked.includes(state.selectedLayerId as any) ? null : state.selectedLayerId,
                    selectedLayerIds: state.selectedLayerIds.filter((id) => !unlocked.includes(id))
                };
                return addToHistory(newState, state);
            });
        },

        selectLayer: (id, multiSelect = false) => {
            set((state) => {
                let newSelectedIds: string[];

                if (multiSelect && id) {
                    newSelectedIds = state.selectedLayerIds.includes(id)
                        ? state.selectedLayerIds.filter((layerId) => layerId !== id)
                        : [...state.selectedLayerIds, id];
                } else {
                    newSelectedIds = id ? [id] : [];
                }

                return {
                    ...state,
                    selectedLayerId: newSelectedIds.length === 1 ? newSelectedIds[0] : null,
                    selectedLayerIds: newSelectedIds,
                    textLayers: state.textLayers.map((layer) => ({
                        ...layer,
                        isSelected: newSelectedIds.includes(layer.id)
                    }))
                };
            });
        },

        selectMultipleLayers: (ids) => {
            set((state) => {
                if (
                    ids.length === state.selectedLayerIds.length &&
                    ids.every((id) => state.selectedLayerIds.includes(id))
                ) {
                    return state;
                }

                return {
                    ...state,
                    selectedLayerId: ids.length === 1 ? ids[0] : null,
                    selectedLayerIds: ids,
                    textLayers: state.textLayers.map((layer) => ({
                        ...layer,
                        isSelected: ids.includes(layer.id)
                    }))
                };
            });
        },

        clearSelection: () => {
            set((state) => ({
                ...state,
                selectedLayerId: null,
                selectedLayerIds: [],
                textLayers: state.textLayers.map((layer) => ({
                    ...layer,
                    isSelected: false
                }))
            }));
        },

        toggleLayerLock: (id) => {
            set((state) => {
                const newState = {
                    ...state,
                    textLayers: state.textLayers.map((layer) =>
                        layer.id === id ? { ...layer, isLocked: !layer.isLocked } : layer
                    )
                };
                return addToHistory(newState, state);
            });
        },

        moveLayerUp: (id) => {
            set((state) => {
                const layer = state.textLayers.find((l) => l.id === id);
                if (layer?.isLocked) return state;

                const currentIndex = state.textLayers.findIndex((layer) => layer.id === id);
                if (currentIndex < state.textLayers.length - 1) {
                    const newLayers = [...state.textLayers];
                    [newLayers[currentIndex], newLayers[currentIndex + 1]] = [
                        newLayers[currentIndex + 1],
                        newLayers[currentIndex]
                    ];

                    newLayers.forEach((layer, index) => {
                        layer.zIndex = index;
                    });

                    const newState = {
                        ...state,
                        textLayers: newLayers
                    };
                    return addToHistory(newState, state);
                }
                return state;
            });
        },

        moveLayerDown: (id) => {
            set((state) => {
                const layer = state.textLayers.find((l) => l.id === id);
                if (layer?.isLocked) return state;

                const currentIndex = state.textLayers.findIndex((layer) => layer.id === id);
                if (currentIndex > 0) {
                    const newLayers = [...state.textLayers];
                    [newLayers[currentIndex], newLayers[currentIndex - 1]] = [
                        newLayers[currentIndex - 1],
                        newLayers[currentIndex]
                    ];

                    newLayers.forEach((layer, index) => {
                        layer.zIndex = index;
                    });

                    const newState = {
                        ...state,
                        textLayers: newLayers
                    };
                    return addToHistory(newState, state);
                }
                return state;
            });
        },

        duplicateLayer: (id) => {
            set((state) => {
                const originalLayer = state.textLayers.find((l) => l.id === id);
                if (!originalLayer) return state;

                const newId = `layer-${Date.now()}-${Math.random()}`;
                const maxZ = Math.max(...state.textLayers.map((l) => l.zIndex), 0);
                const duplicatedLayer: TextLayer = {
                    ...originalLayer,
                    id: newId,
                    x: originalLayer.x + 20,
                    y: originalLayer.y + 20,
                    zIndex: maxZ + 1,
                    isSelected: false,
                    isLocked: false
                };

                const newState = {
                    ...state,
                    textLayers: [...state.textLayers, duplicatedLayer],
                    selectedLayerId: newId,
                    selectedLayerIds: [newId]
                };
                return addToHistory(newState, state);
            });
        },

        duplicateMultipleLayers: (ids) => {
            set((state) => {
                const originalLayers = state.textLayers.filter((l) => ids.includes(l.id));
                if (originalLayers.length === 0) return state;

                const maxZ = Math.max(...state.textLayers.map((l) => l.zIndex), 0);
                const newLayers: TextLayer[] = [];
                const newIds: string[] = [];

                originalLayers.forEach((layer, index) => {
                    const newId = `layer-${Date.now()}-${Math.random()}-${index}`;
                    const duplicatedLayer: TextLayer = {
                        ...layer,
                        id: newId,
                        x: layer.x + 20,
                        y: layer.y + 20,
                        zIndex: maxZ + 1 + index,
                        isSelected: false,
                        isLocked: false
                    };
                    newLayers.push(duplicatedLayer);
                    newIds.push(newId);
                });

                const newState = {
                    ...state,
                    textLayers: [...state.textLayers, ...newLayers],
                    selectedLayerId: newIds.length === 1 ? newIds[0] : null,
                    selectedLayerIds: newIds
                };
                return addToHistory(newState, state);
            });
        },

        undo: () => {
            set((state) => {
                if (state.historyIndex > 0) {
                    const previousState = state.history[state.historyIndex - 1];
                    return {
                        ...previousState,
                        history: state.history,
                        historyIndex: state.historyIndex - 1,
                        selectedLayerIds: previousState.selectedLayerId ? [previousState.selectedLayerId] : []
                    };
                }
                return state;
            });
        },

        redo: () => {
            set((state) => {
                if (state.historyIndex < state.history.length - 1) {
                    const nextState = state.history[state.historyIndex + 1];
                    return {
                        ...nextState,
                        history: state.history,
                        historyIndex: state.historyIndex + 1,
                        selectedLayerIds: nextState.selectedLayerId ? [nextState.selectedLayerId] : []
                    };
                }
                return state;
            });
        },

        reset: () => {
            set(initialState);
            localStorage.removeItem(STORAGE_KEY);
        },

        saveToLocalStorage: () => {
            const state = get();
            const stateToSave = {
                backgroundImage: state.backgroundImage,
                imageWidth: state.imageWidth,
                imageHeight: state.imageHeight,
                textLayers: state.textLayers,
                selectedLayerId: state.selectedLayerId,
                selectedLayerIds: state.selectedLayerIds,
                customFonts: state.customFonts
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        },

        loadFromLocalStorage: () => {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsedState = JSON.parse(saved);
                    set((state) => {
                        parsedState.customFonts?.forEach((font: { name: string; src: string }) => {
                            const fontFace = new FontFace(font.name, `url(${font.src})`);
                            fontFace
                                .load()
                                .then((loadedFont) => {
                                    document.fonts.add(loadedFont);
                                })
                                .catch((error) => {
                                    console.error(`Failed to load font ${font.name}:`, error);
                                });
                        });

                        return {
                            ...state,
                            ...parsedState,
                            selectedLayerIds:
                                parsedState.selectedLayerIds ||
                                (parsedState.selectedLayerId ? [parsedState.selectedLayerId] : []),
                            history: [parsedState],
                            historyIndex: 0
                        };
                    });
                } catch (error) {
                    console.error('Failed to load from localStorage:', error);
                }
            }
        },

        addCustomFont: (name: string, src: string) => {
            set((state) => {
                if (state.customFonts.some((font) => font.name === name)) {
                    console.warn(`Font ${name} already exists`);
                    return state;
                }

                const cleanName = name.replace(/\.(ttf|otf|woff|woff2)$/i, '');

                const newFont = { name: cleanName, src };

                const fontFace = new FontFace(cleanName, `url(${src})`);
                fontFace
                    .load()
                    .then((loadedFont) => {
                        document.fonts.add(loadedFont);
                        const currentState = get();
                        const layersUsingFont = currentState.textLayers.filter(
                            layer => layer.fontFamily === cleanName
                        );
                        if (layersUsingFont.length > 0) {
                            set(currentState => ({
                                ...currentState,
                                textLayers: [...currentState.textLayers]
                            }));
                        }
                    })
                    .catch((error) => {
                        console.error(`Failed to load font ${cleanName}:`, error);
                    });

                const newState = {
                    ...state,
                    customFonts: [...state.customFonts, newFont]
                };
                return addToHistory(newState, state);
            });
        }
    }))
);

function addToHistory(
    newState: EditorState & { selectedLayerIds: string[] },
    currentState: EditorState & { selectedLayerIds: string[] }
): EditorState & { selectedLayerIds: string[] } {
    const stateToAdd = {
        backgroundImage: newState.backgroundImage,
        imageWidth: newState.imageWidth,
        imageHeight: newState.imageHeight,
        textLayers: newState.textLayers,
        selectedLayerId: newState.selectedLayerId,
        selectedLayerIds: newState.selectedLayerIds,
        isLoading: newState.isLoading,
        customFonts: newState.customFonts,
        history: [],
        historyIndex: 0
    };

    const newHistory = [...currentState.history.slice(0, currentState.historyIndex + 1), stateToAdd].slice(
        -MAX_HISTORY
    );

    return {
        ...newState,
        history: newHistory,
        historyIndex: newHistory.length - 1
    };
}

let saveTimeout: NodeJS.Timeout | null = null;
useEditorStore.subscribe(
    (state) => ({
        backgroundImage: state.backgroundImage,
        textLayers: state.textLayers,
        imageWidth: state.imageWidth,
        imageHeight: state.imageHeight,
        selectedLayerIds: state.selectedLayerIds
    }),
    () => {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }

        saveTimeout = setTimeout(() => {
            const store = useEditorStore.getState();
            if (store.backgroundImage || store.textLayers.length > 0) {
                store.saveToLocalStorage();
            }
        }, 1000);
    },
    { fireImmediately: false }
);
