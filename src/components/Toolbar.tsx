"use client";

import { Separator } from "@radix-ui/react-select";
import { Copy, MoveDown, MoveUp, Trash2, Type } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editorStore";


export const Toolbar: React.FC = () => {
	const {
		textLayers,
		selectedLayerId,
		addTextLayer,
		duplicateLayer,
		deleteTextLayer,
		moveLayerUp,
   		moveLayerDown,
		imageWidth,
		imageHeight,
	} = useEditorStore();

	const selectedIndex = textLayers.findIndex(
		(layer) => layer.id === selectedLayerId,
	);

	const handleAddText = () => {
		const newLayer = {
			content: "New Text",
			x: imageWidth / 2 - 75,
			y: imageHeight / 2 - 20,
			width: 150,
			height: 40,
			rotation: 0,
			fontSize: 24,
			fontFamily: "Arial",
			fontWeight: "400",
			color: "#000000",
			opacity: 1,
			alignment: "center" as const,
			isSelected: true,
		};

		addTextLayer(newLayer);
	};

	const handleDuplicate = () => {
		if (selectedLayerId) {
			duplicateLayer(selectedLayerId);
		}
	};

	const handleDelete = () => {
		if (selectedLayerId) {
			deleteTextLayer(selectedLayerId);
		}
	};

	const handleMoveUp = () => {
    if (selectedLayerId) {
        moveLayerUp(selectedLayerId);
    }
	};

	const handleMoveDown = () => {
		if (selectedLayerId) {
			moveLayerDown(selectedLayerId);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold">Tools</h3>
			</div>

			<div className="space-y-2">
				<Button
					onClick={handleAddText}
					className="w-full justify-start"
					variant="outline"
				>
					<Type className="mr-2 h-4 w-4" />
					Add Text Layer
				</Button>

				{selectedLayerId && (
					<>
						<Separator />
						<div className="space-y-2">
							<Button
								onClick={handleDuplicate}
								className="w-full justify-start"
								variant="outline"
								size="sm"
							>
								<Copy className="mr-2 h-4 w-4" />
								Duplicate
							</Button>

							<div className="flex space-x-2">
								<Button
									onClick={handleMoveUp}
									disabled={selectedIndex >= textLayers.length - 1}
									className="flex-1 justify-start"
									variant="outline"
									size="sm"
								>
									<MoveUp className="mr-2 h-4 w-4" />
									Up
								</Button>
								<Button
									onClick={handleMoveDown}
									disabled={selectedIndex <= 0}
									className="flex-1 justify-start"
									variant="outline"
									size="sm"
								>
									<MoveDown className="mr-2 h-4 w-4" />
									Down
								</Button>
							</div>

							<Button
								onClick={handleDelete}
								className="w-full justify-start"
								variant="destructive"
								size="sm"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};
