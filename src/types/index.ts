import { SVGProps } from 'react';

export interface TextLayer {
    id: string;
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    color: string;
    opacity: number;
    alignment: 'left' | 'center' | 'right';
    zIndex: number;
    isSelected: boolean;
    isLocked: boolean;
    lineHeight?: number;
    letterSpacing?: number;
}

export interface EditorState {
    backgroundImage: string | null;
    imageWidth: number;
    imageHeight: number;
    textLayers: TextLayer[];
    selectedLayerId: string | null;
    history: EditorState[];
    historyIndex: number;
    isLoading: boolean;
    isImmediateUpdate?: boolean;
    customFonts: { name: string; src: string }[];
}

export interface HistoryAction {
    type: 'ADD_LAYER' | 'UPDATE_LAYER' | 'DELETE_LAYER' | 'REORDER_LAYERS' | 'SET_BACKGROUND';
    payload: any;
}

export interface SVGIconProps extends SVGProps<SVGSVGElement> {
    title?: string;
    titleId?: string;
}
