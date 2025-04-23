// This is not working maybe due some Elysia problem it keeps "(pending)" and never get response in browser
import type { Context } from "elysia";
import type { HMRConfig } from "../..";
import { dirWatcher } from "../dir-watcher";
import { eventSourceMessage } from "../event-source-message";

export function sseWatcherGenerator(config: HMRConfig) {
	return async function* ({ set, headers }: Context) {
		let id = +(headers["last-event-id"] ?? 1);
		if (Number.isNaN(id) || id < 1) {
			id = 1;
		}
		set.headers["Content-Type"] = "text/event-stream";
		set.headers["Cache-Control"] = "no-cache";
		set.headers.Connection = "keep-alive";
		set.headers["X-Accel-Buffering"] = "no";
		set.status = 200;

		if (config.allowRefreshFromAnotherWindow) {
			set.headers["Access-Control-Allow-Origin"] = "*";
			set.headers["Access-Control-Allow-Credentials"] = "true";
			set.headers["Access-Control-Allow-Headers"] =
				"Content-Type, Last-Event-ID";
		}

		try {
			for await (const data of dirWatcher(config)) {
				yield eventSourceMessage<string>(
					data,
					++id,
					config.hmrEventName,
					config.eventSourceRetry,
				);
			}
		} catch (error) {
			// throw new Error(`Prefix "${config.prefixToWatch}" does not exists`);
		}
	};
}
