import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { EditorState, TextLayer } from "@/types";

interface EditorStore extends EditorState {
    setBackgroundImage: (imageUrl: string, width: number, height: number) => void;
    addTextLayer: (layer: Omit<TextLayer, "id" | "zIndex">) => void;
    updateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
    updateTextLayerImmediate: (id: string, updates: Partial<TextLayer>) => void;
    deleteTextLayer: (id: string) => void;
    selectLayer: (id: string | null) => void;
    moveLayerUp: (id: string) => void;
    moveLayerDown: (id: string) => void;
    duplicateLayer: (id: string) => void;
    undo: () => void;
    redo: () => void;
    reset: () => void;
    saveToLocalStorage: () => void;
    loadFromLocalStorage: () => void;
}

const initialState: EditorState = {
    backgroundImage: null,
    imageWidth: 0,
    imageHeight: 0,
    textLayers: [],
    selectedLayerId: null,
    history: [],
    historyIndex: -1,
    isLoading: false,
};

const STORAGE_KEY = "image-text-composer-state";
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
                };

                const newState = {
                    ...state,
                    textLayers: [...state.textLayers, newLayer],
                    selectedLayerId: id,
                };
                return addToHistory(newState, state);
            });
        },

        updateTextLayer: (id, updates) => {
            set((state) => {
                const newState = {
                    ...state,
                    textLayers: state.textLayers.map((layer) =>
                        layer.id === id ? { ...layer, ...updates } : layer,
                    ),
                };
                return addToHistory(newState, state);
            });
        },

        updateTextLayerImmediate: (id, updates) => {
            set((state) => ({
                ...state,
                textLayers: state.textLayers.map((layer) =>
                    layer.id === id ? { ...layer, ...updates } : layer,
                ),
            }));
        },

        deleteTextLayer: (id) => {
            set((state) => {
                const newState = {
                    ...state,
                    textLayers: state.textLayers.filter((layer) => layer.id !== id),
                    selectedLayerId:
                        state.selectedLayerId === id ? null : state.selectedLayerId,
                };
                return addToHistory(newState, state);
            });
        },

        selectLayer: (id) => {
            set((state) => ({
                ...state,
                selectedLayerId: id,
                textLayers: state.textLayers.map((layer) => ({
                    ...layer,
                    isSelected: layer.id === id,
                })),
            }));
        },

        moveLayerUp: (id) => {
            set((state) => {
                const currentIndex = state.textLayers.findIndex(
                    (layer) => layer.id === id,
                );
                if (currentIndex < state.textLayers.length - 1) {
                    const newLayers = [...state.textLayers];
                    [newLayers[currentIndex], newLayers[currentIndex + 1]] = [
                        newLayers[currentIndex + 1],
                        newLayers[currentIndex],
                    ];

                    // update z-indexes to match array positions
                    newLayers.forEach((layer, index) => {
                        layer.zIndex = index;
                    });

                    const newState = {
                        ...state,
                        textLayers: newLayers,
                    };
                    return addToHistory(newState, state);
                }
                return state;
            });
        },

        moveLayerDown: (id) => {
            set((state) => {
                const currentIndex = state.textLayers.findIndex(
                    (layer) => layer.id === id,
                );
                if (currentIndex > 0) {
                    const newLayers = [...state.textLayers];
                    [newLayers[currentIndex], newLayers[currentIndex - 1]] = [
                        newLayers[currentIndex - 1],
                        newLayers[currentIndex],
                    ];

                    newLayers.forEach((layer, index) => {
                        layer.zIndex = index;
                    });

                    const newState = {
                        ...state,
                        textLayers: newLayers,
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
                };

                const newState = {
                    ...state,
                    textLayers: [...state.textLayers, duplicatedLayer],
                    selectedLayerId: newId,
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
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        },

        loadFromLocalStorage: () => {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsedState = JSON.parse(saved);
                    set((state) => ({
                        ...state,
                        ...parsedState,
                        history: [parsedState],
                        historyIndex: 0,
                    }));
                } catch (error) {
                    console.error("Failed to load from localStorage:", error);
                }
            }
        },
    })),
);

// adds state to history
function addToHistory(
    newState: EditorState,
    currentState: EditorState,
): EditorState {
    const stateToAdd = {
        backgroundImage: newState.backgroundImage,
        imageWidth: newState.imageWidth,
        imageHeight: newState.imageHeight,
        textLayers: newState.textLayers,
        selectedLayerId: newState.selectedLayerId,
        isLoading: newState.isLoading,
        history: [],
        historyIndex: 0,
    };

    const newHistory = [
        ...currentState.history.slice(0, currentState.historyIndex + 1),
        stateToAdd,
    ].slice(-MAX_HISTORY);

    return {
        ...newState,
        history: newHistory,
        historyIndex: newHistory.length - 1,
    };
}

// auto-save
let saveTimeout: NodeJS.Timeout | null = null;
useEditorStore.subscribe(
    (state) => ({
        backgroundImage: state.backgroundImage,
        textLayers: state.textLayers,
        imageWidth: state.imageWidth,
        imageHeight: state.imageHeight,
    }),
    () => {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }

        // after 1 sec of inactivity
        saveTimeout = setTimeout(() => {
            const store = useEditorStore.getState();
            if (store.backgroundImage || store.textLayers.length > 0) {
                store.saveToLocalStorage();
            }
        }, 1000);
    },
    { fireImmediately: false },
);