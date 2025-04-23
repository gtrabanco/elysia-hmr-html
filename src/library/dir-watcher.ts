import { access, watch } from "node:fs/promises";
import { extname, join } from "node:path";
import type { HMRConfig } from "..";

export async function* dirWatcher(config: HMRConfig) {
	const extensionsToWatch = config.extensionsToWatch.map((e) =>
		e.startsWith(".") ? e : `.${e}`,
	);

	function pathEventData(filename: string) {
		if (config.publicPath) {
			return join(config.publicPath, filename);
		}

		return "*";
	}

	try {
		await access(config.prefixToWatch);

		for await (const event of watch(config.prefixToWatch, {
			recursive: true,
		})) {
			if (event.eventType !== "change") return;

			const safeFilename = event.filename ?? ""; // I do not know why I have to do this. If you know please, explain me on an issue 🙏😅
			const extension = extname(safeFilename);
			const data = pathEventData(safeFilename);

			if (
				extensionsToWatch.length === 0 ||
				extensionsToWatch.includes(extension)
			) {
				// console.debug(`[HMR] File changed: ${event.filename}`, { data });
				yield data;
			}
		}
	} catch (error) {
		// throw new Error(`Prefix "${config.prefixToWatch}" does not exists`);
	}
}
