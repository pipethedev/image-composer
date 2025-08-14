'use client';

import { useCallback } from 'react';
import { FallbackProps, ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
    const { reset } = useEditorStore();

    const handleReset = useCallback(() => {
        reset();
        resetErrorBoundary();
    }, [reset, resetErrorBoundary]);

    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 p-8">
            <div className="max-w-md text-center">
                <h2 className="text-xl font-bold text-red-600">Oops Something went wrong</h2>
                <p className="mt-2 text-gray-600">{error.message}</p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="mt-4 text-destructive hover:text-destructive"
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset Editor
                </Button>
            </div>
        </div>
    );
};

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
    return (
        <ReactErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(error, info) => {
                console.error('Error caught by ErrorBoundary:', error, info);
            }}
        >
            {children}
        </ReactErrorBoundary>
    );
};
