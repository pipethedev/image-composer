'use client';

import * as React from 'react';

import { cn } from '@/utils';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            'desktop:rounded-[10px] fixed inset-0 z-50 bg-[#f6f6f3]/60 data-[state=closed]:animate-[dialog-overlay-hide_100ms] data-[state=open]:animate-[dialog-overlay-show_100ms] dark:bg-[#121212]/80',
            className
        )}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
        hideClose?: boolean;
    }
>(({ className, children, hideClose, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                'bg-background border-border text-primary fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-xl -translate-x-1/2 -translate-y-1/2 border data-[state=closed]:animate-[dialog-content-hide_100ms] data-[state=open]:animate-[dialog-content-show_100ms] dark:p-px',
                className
            )}
            {...props}>
            {children}

            {!hideClose && (
                <DialogPrimitive.Close className='ring-offset-background data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-6 right-6 opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none'>
                    <Cross2Icon className='h-4 w-4' />
                    <span className='sr-only'>Close</span>
                </DialogPrimitive.Close>
            )}
        </DialogPrimitive.Content>
    </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogContentFrameless = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                'bg-background text-primary fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-xl -translate-x-1/2 -translate-y-1/2 border data-[state=closed]:animate-[dialog-content-hide_100ms] data-[state=open]:animate-[dialog-content-show_100ms] dark:border-none dark:p-px',
                className
            )}
            {...props}>
            {children}
        </DialogPrimitive.Content>
    </DialogPortal>
));

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col space-y-1.5 text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn('mb-4 text-lg leading-none font-semibold tracking-tight', className)}
        {...props}
    />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description ref={ref} className={cn('text-sm text-[#878787]', className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogContentFrameless
};
