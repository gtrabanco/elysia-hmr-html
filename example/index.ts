import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { join } from "node:path";
import { hmr } from "../src";

const app = new Elysia()
	.use(
		hmr({
			prefixToWatch: join(import.meta.dir, "public"),
		}),
	)
	.use(
		staticPlugin({
			assets: join(import.meta.dir, "public"),
			prefix: "",
		}),
	)
	.listen(
		{ port: process.env.PORT || 0 },
		({ hostname, port }) => {
			console.log(`Elysia server started http://${hostname}:${port}`);
		},
	);
