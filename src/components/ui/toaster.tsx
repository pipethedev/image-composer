"use client";

import { AlertCircle, CheckCircle } from "lucide-react";
import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/useToast";
import { Progress } from "./progress";
import { Spinner } from "./spinner";

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider>
			{toasts.map(
				({
					id,
					title,
					description,
					progress = 0,
					action,
					footer,
					...props
				}) => {
					return (
						<Toast key={id} {...props} className="flex flex-col">
							<div className="flex w-full">
								<div className="w-full justify-center space-y-2">
									<div className="flex justify-between space-x-2">
										<div className="flex items-center space-x-2.5">
											{props?.variant && (
												<div className="flex h-[20px] w-[20px] items-center">
													{/* {props.variant === 'ai' && <Icons.AI className='text-[#0064D9]' />} */}
													{props?.variant === "success" && (
														<div className="rounded-full bg-green-100 p-[2px] text-green-500">
															<CheckCircle className="h-4 w-4" />
														</div>
													)}
													{props?.variant === "error" && (
														<div className="rounded-full bg-red-100 p-[2px] text-red-500">
															<AlertCircle className="h-4 w-4" />
														</div>
													)}
													{props?.variant === "progress" && (
														<Spinner className="h-4 w-4 animate-spin" />
													)}
													{props?.variant === "spinner" && (
														<Spinner className="h-4 w-4 animate-spin" />
													)}
												</div>
											)}
											<div>{title && <ToastTitle>{title}</ToastTitle>}</div>
										</div>

										<div>
											{props?.variant === "progress" && (
												<span className="text-sm text-[#878787]">
													{progress}%
												</span>
											)}
										</div>
									</div>

									{props.variant === "progress" && (
										<Progress
											value={progress}
											className="bg-border h-[3px] w-full rounded-none"
										/>
									)}

									{description && (
										<ToastDescription>{description}</ToastDescription>
									)}
								</div>
								{action}
								<ToastClose />
							</div>

							<div className="flex w-full justify-end">{footer}</div>
						</Toast>
					);
				},
			)}
			<ToastViewport />
		</ToastProvider>
	);
}
