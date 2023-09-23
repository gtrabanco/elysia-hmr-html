import EventEmitter from "node:events";
export const emitter = new EventEmitter();

export type SSEEvent = {
	event?: string;
	data?: unknown;
};

export type SSEOptions = {
	retry: number;
	onClose: () => void;
};

function info(...args: unknown[]): void {
	// console.info(...args);
}

function debug(...args: unknown[]): void {
	// console.debug(...args);
}

function channelSubscribe(
	channels: string[],
	handler: (payload: SSEEvent) => void,
): void {
	channels.forEach((channel) => {
		emitter.on(channel, handler);
	});
}

function channelUnsubscribe(
	channels: string[],
	handler: (payload: SSEEvent) => void,
): void {
	channels.forEach((channel) => {
		emitter.off(channel, handler);
	});
}

export const sseSubscribe = (
	req: Request,
	channel: string | Array<string>,
	options: Partial<SSEOptions> = {
		retry: 1000,
		onClose: () => {},
	},
): Response => {
	info(`subscribing to channel '${channel}'`);
	const stream = new ReadableStream({
		type: "direct",
		async pull(controller: ReadableStreamDirectController) {
			let id = +(req.headers.get("last-event-id") ?? 1);

			if (options.retry !== undefined) {
				await controller.write(`retry:${options.retry}\n`);
			}

			const handler = async (payload: SSEEvent): Promise<void> => {
				const { event = undefined, data = undefined } = payload as Record<
					string,
					unknown
				>;
				if (event !== undefined) {
					await controller.write(`event:${event}\n`);
				}
				await controller.write(`id:${id}\n`);
				await controller.write(
					`data:${data !== undefined ? JSON.stringify(data) : ""}\n\n`,
				);
				await controller.flush();
				id++;
			};

			function closeConnection(reason: string | undefined = "reason unknown") {
				return () => {
					info(`unsubscribing from channel '${channel}': ${reason}`);
					options.onClose?.();
					channelUnsubscribe(
						Array.isArray(channel) ? channel : [channel],
						handler,
					);
					controller.close();
				};
			}

			channelSubscribe(Array.isArray(channel) ? channel : [channel], handler);

			req.signal.addEventListener(
				"abort",
				closeConnection("Connection aborted"),
			);

			req.signal.addEventListener(
				"close",
				closeConnection("Connection closed"),
			);

			if (req.signal.aborted) {
				closeConnection("Connection aborted originally")();
			}
			return new Promise(() => void 0);
		},
	});

	return new Response(stream, {
		status: 200,
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
};

export const sseEmit = (channel: string, payload?: SSEEvent): void => {
	debug(`emitting to channel '${channel}'`);
	emitter.emit(channel, payload);
};
