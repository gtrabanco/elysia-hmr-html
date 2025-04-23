import { injectHtml } from "@gtrabanco/elysia-inject-html";
import Elysia from "elysia";
import { type HMRConfig, HMRType } from "./index.d";
import { clientSSECode } from "./library/client/sse-code";
import { clientWebSocketScriptString } from "./library/client/web-socket-script-string";
import { dirWatcher } from "./library/dir-watcher";
import { getPackageName } from "./library/plugin-name" with { type: "macro" };
import { sseStreamWatcher } from "./library/serverside-sse/stream-watcher";
export type { HMRConfig } from "./index.d";

const defaultConfig: HMRConfig = {
	prefixToWatch: "./public",
	extensionsToWatch: [], // Empty array means all extensions
	hmrEndpoint: "/__hmr_stream__",
	hmrEventName: "hmr",
	hmrType: HMRType.WS,
	allowRefreshFromAnotherWindow: false,
	as: "global",
	eventSourceRetry: 3000,
};

export const hmr = async (config: Partial<HMRConfig> = {}): Promise<Elysia> => {
	const finalConfig = { ...defaultConfig, ...config } as HMRConfig;

	const app = new Elysia({ name: await getPackageName() });

	if (finalConfig.hmrType === HMRType.WS) {
		app.use(
			injectHtml({
				selector: "body",
				append: clientWebSocketScriptString(
					finalConfig.hmrEndpoint,
					finalConfig.hmrEventName,
				),
			}),
		);

		app.ws(finalConfig.hmrEndpoint, {
			message: async (ws) => {
				for await (const data of dirWatcher(finalConfig)) {
					ws.send({
						type: finalConfig.hmrEventName,
						data,
					});
				}
			},
		});
	}

	if (finalConfig.hmrType === HMRType.SSE) {
		app.use(
			injectHtml({
				selector: "body",
				append: clientSSECode(
					finalConfig.hmrEndpoint,
					finalConfig.hmrEventName,
					finalConfig.allowRefreshFromAnotherWindow,
				),
			}),
		);

		app.get(finalConfig.hmrEndpoint, sseStreamWatcher(finalConfig));
	}

	return app;
};
