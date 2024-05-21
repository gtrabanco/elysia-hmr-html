import Stream from "@elysiajs/stream";
import { injectHtml } from "@gtrabanco/elysia-inject-html";
import Elysia from "elysia";
import type { HMRConfig } from "../types";
import { clientSSECode } from "./client-sse-code";
import { getPackageName } from "./plugin-name" with { type: "macro" };
import { watcher } from "./watcher";

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
		.get(
			finalConfig.hmrEndpoint,
			() =>
				new Stream(watcher(finalConfig), {
					retry: 10000,
					event: finalConfig.hmrEventName,
				}),
		);
};
