import { accessSync, watch } from "node:fs";
import { extname, join } from "node:path";
import { injectHtml } from "@gtrabanco/elysia-inject-html";
import Elysia from "elysia";
import { clientSSECode } from "./client-sse-code";
import { sseEmit, sseSubscribe } from "./sse-event-emitter";

export type HMRConfig = {
	prefixToWatch: string;
	publicPath?: string; // Public path to serve prefixToWatch files, for example can be "/assets/public", if not present it will reload all served files
	extensionsToWatch: string[];
	hmrEndpoint: string;
	hmrEventName: string;
	allowRefreshFromAnotherWindow: boolean;
};

const defaultConfig: HMRConfig = {
	prefixToWatch: "./public",
	extensionsToWatch: [], // Empty array means all extensions
	hmrEndpoint: "/__hmr_stream__",
	hmrEventName: "hmr",
	allowRefreshFromAnotherWindow: false,
};

export const hmr = (config: Partial<HMRConfig> = {}) => {
	const finalConfig = { ...defaultConfig, ...config } as HMRConfig;
	const extensionsToWatch = finalConfig.extensionsToWatch.map((e) =>
		e.startsWith(".") ? e : `.${e}`,
	);

	function eventData(filename: string) {
		if (finalConfig.publicPath) {
			return join(finalConfig.publicPath, filename);
		}

		return "*";
	}

	try {
		accessSync(finalConfig.prefixToWatch);

		const watcher = watch(
			finalConfig.prefixToWatch,
			{ recursive: true },
			(eventType, filename = "") => {
				if (eventType !== "change" || filename instanceof Error) return; // We only care about changes, not creations or deletions

				const extension = extname(filename);
				if (extensionsToWatch.length === 0) {
					sseEmit(finalConfig.hmrEndpoint, {
						event: finalConfig.hmrEventName,
						data: eventData(filename),
					});
				} else if (extensionsToWatch.includes(extension)) {
					sseEmit(finalConfig.hmrEndpoint, {
						event: finalConfig.hmrEventName,
						data: eventData(filename),
					});
				}
			},
		);
	} catch (error) {
		throw new Error(`Prefix "${finalConfig.prefixToWatch}" does not exists`);
	}

	return new Elysia({ name: "@gtrabanco/elysia-hmr-html" })
		.use(
			injectHtml({
				selector: "body",
				append: clientSSECode(
					finalConfig.hmrEndpoint,
					finalConfig.hmrEventName,
					finalConfig.allowRefreshFromAnotherWindow,
				),
			}),
		)
		.get(finalConfig.hmrEndpoint, ({ request }) => {
			return sseSubscribe(request, finalConfig.hmrEndpoint, { retry: 1000 });
		});
};
