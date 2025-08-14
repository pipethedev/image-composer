"use client";

import { Eye, EyeOff, Type } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/utils";


export const LayersPanel: React.FC = () => {
	const { textLayers, selectedLayerId, selectLayer, updateTextLayer } =
		useEditorStore();

	const sortedLayers = [...textLayers].sort((a, b) => b.zIndex - a.zIndex);

	const handleToggleVisibility = (layerId: string, currentOpacity: number) => {
		const newOpacity = currentOpacity > 0 ? 0 : 1;
		updateTextLayer(layerId, { opacity: newOpacity });
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold">Layers</h3>
				<span className="text-xs text-muted-foreground">
					{textLayers.length} layer{textLayers.length !== 1 ? "s" : ""}
				</span>
			</div>

			<div className="space-y-1">
				{sortedLayers.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<Type className="h-8 w-8 mx-auto mb-2 opacity-50" />
						<p className="text-sm">No text layers</p>
						<p className="text-xs">Add a text layer to get started</p>
					</div>
				) : (
					sortedLayers.map((layer) => (
						<div
							role="button"
							key={layer.id}
							className={cn(
								"flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors",
								layer.id === selectedLayerId
									? "bg-primary/10 border-primary"
									: "bg-background hover:bg-muted/50 border-border",
							)}
							onClick={() => selectLayer(layer.id)}
						>
							<Type className="h-4 w-4 text-muted-foreground" />
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">
									{layer.content || "Empty text"}
								</p>
								<p className="text-xs text-muted-foreground">
									{layer.fontFamily} • {layer.fontSize}px
								</p>
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="h-6 w-6 p-0"
								onClick={(e) => {
									e.stopPropagation();
									handleToggleVisibility(layer.id, layer.opacity);
								}}
							>
								{layer.opacity > 0 ? (
									<Eye className="h-3 w-3" />
								) : (
									<EyeOff className="h-3 w-3" />
								)}
							</Button>
						</div>
					))
				)}
			</div>
		</div>
	);
};
