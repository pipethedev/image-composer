'use client';

import type React from 'react';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/utils';

import { Image as ImageIcon, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export const ImageUpload: React.FC = () => {
    const { setBackgroundImage } = useEditorStore();

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setBackgroundImage(e.target?.result as string, img.width, img.height);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        },
        [setBackgroundImage]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/png': ['.png']
        },
        maxFiles: 1
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
            )}>
            <input {...getInputProps()} />
            <div className='flex flex-col items-center space-y-4'>
                <div className='bg-primary/10 rounded-full p-4'>
                    {isDragActive ? (
                        <Upload className='text-primary h-8 w-8' />
                    ) : (
                        <ImageIcon className='text-primary h-8 w-8' />
                    )}
                </div>
                <div className='space-y-2'>
                    <h3 className='text-lg font-semibold'>
                        {isDragActive ? 'Drop your PNG here' : 'Upload PNG Image'}
                    </h3>
                    <p className='text-muted-foreground text-sm'>Drag and drop a PNG file, or click to select</p>
                </div>
                <Button variant='outline' size='sm'>
                    Choose File
                </Button>
            </div>
        </div>
    );
};
