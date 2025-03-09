import type { LifeCycleType } from "elysia";

type WatcherConfig = {
	prefixToWatch: string;
};

export type HMRConfig = {
	prefixToWatch: string;
	publicPath?: string; // Public path to serve prefixToWatch files, for example can be "/assets/public", if not present it will reload all served files
	extensionsToWatch: string[];
	hmrEndpoint: string;
	hmrEventName: string;
	allowRefreshFromAnotherWindow: boolean;
	as: LifeCycleType;
};
