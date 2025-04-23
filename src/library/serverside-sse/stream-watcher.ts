import Stream from "@elysiajs/stream";
import type { Context } from "elysia";
import type { HMRConfig } from "../..";
import { dirWatcher } from "../dir-watcher";

export function sseStreamWatcher(config: HMRConfig) {
	return async ({ set }: Context) => {
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

		return new Stream(async (stream) => {
			stream.event = config.hmrEventName;
			stream.retry = config.eventSourceRetry;
			try {
				for await (const data of dirWatcher(config)) {
					stream.send(data);
				}
			} catch (error) {
				// throw new Error(`Prefix "${config.prefixToWatch}" does not exists`);
			}
		});
	};
}
