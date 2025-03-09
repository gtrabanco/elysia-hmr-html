import Stream from "@elysiajs/stream";
import { injectHtml } from "@gtrabanco/elysia-inject-html";
import Elysia from "elysia";
import { clientSSECode } from "./client-sse-code";
import type { HMRConfig } from "./index.d";
import { getPackageName } from "./plugin-name" with { type: "macro" };
import { watcher } from "./watcher";
export type { HMRConfig } from "./index.d";

const defaultConfig: HMRConfig = {
	prefixToWatch: "./public",
	extensionsToWatch: [], // Empty array means all extensions
	hmrEndpoint: "/__hmr_stream__",
	hmrEventName: "hmr",
	allowRefreshFromAnotherWindow: false,
	as: "global",
};

export const hmr = async (config: Partial<HMRConfig> = {}): Promise<Elysia> => {
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
