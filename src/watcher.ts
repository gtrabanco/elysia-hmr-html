import { accessSync, watch } from "node:fs";
import { extname, join } from "node:path";
import type { Stream } from "@elysiajs/stream";

export function watcher(config: {
	extensionsToWatch: string[];
	publicPath?: string;
	prefixToWatch: string; // Folder to watch
}) {
	return (stream: Stream<string>) => {
		const extensionsToWatch = config.extensionsToWatch.map((e) =>
			e.startsWith(".") ? e : `.${e}`,
		);

		function eventData(filename: string) {
			if (config.publicPath) {
				return join(config.publicPath, filename);
			}

			return "*";
		}

		try {
			accessSync(config.prefixToWatch);

			watch(
				config.prefixToWatch,
				{ recursive: true },
				(eventType, filename = "") => {
					if (eventType !== "change") return; // We only care about changes, not creations or deletions

					const safeFilename = filename ?? ""; // I do not know why I have to do this. If you know please, explain me on an issue 🙏😅
					const extension = extname(safeFilename);
					const data = eventData(safeFilename);
					if (extensionsToWatch.length === 0) {
						stream.send(data);
					} else if (extensionsToWatch.includes(extension)) {
						stream.send(data);
					}
				},
			);
		} catch (error) {
			throw new Error(`Prefix "${config.prefixToWatch}" does not exists`);
		}
	};
}
