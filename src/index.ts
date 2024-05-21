import { accessSync, watch } from "node:fs";
import { extname, join } from "node:path";
import { injectHtml } from "@gtrabanco/elysia-inject-html";
import Elysia, { type LifeCycleType } from "elysia";
import { clientSSECode } from "./client-sse-code";
import { getPackageName } from "./plugin-name" with { type: "macro" };
import { sseEmit, sseSubscribe } from "./sse-event-emitter";

export type HMRConfig = {
	prefixToWatch: string;
	publicPath?: string; // Public path to serve prefixToWatch files, for example can be "/assets/public", if not present it will reload all served files
	extensionsToWatch: string[];
	hmrEndpoint: string;
	hmrEventName: string;
	allowRefreshFromAnotherWindow: boolean;
	as: LifeCycleType;
};

const defaultConfig: HMRConfig = {
	prefixToWatch: "./public",
	extensionsToWatch: [], // Empty array means all extensions
	hmrEndpoint: "/__hmr_stream__",
	hmrEventName: "hmr",
	allowRefreshFromAnotherWindow: false,
	as: "global",
};

export const hmr = async (config: Partial<HMRConfig> = {}) => {
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

		watch(
			finalConfig.prefixToWatch,
			{ recursive: true },
			(eventType, filename = "") => {
				if (eventType !== "change") return; // We only care about changes, not creations or deletions

				const safeFilename = filename ?? ""; // I do not know why I have to do this. If you know please, explain me on an issue 🙏😅
				const extension = extname(safeFilename);
				if (extensionsToWatch.length === 0) {
					sseEmit(finalConfig.hmrEndpoint, {
						event: finalConfig.hmrEventName,
						data: eventData(safeFilename),
					});
				} else if (extensionsToWatch.includes(extension)) {
					sseEmit(finalConfig.hmrEndpoint, {
						event: finalConfig.hmrEventName,
						data: eventData(safeFilename),
					});
				}
			},
		);
	} catch (error) {
		throw new Error(`Prefix "${finalConfig.prefixToWatch}" does not exists`);
	}

	return new Elysia({ name: await getPackageName() })
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
