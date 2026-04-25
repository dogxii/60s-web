import type { LucideIcon } from "lucide-react";

export type ApiState<T> = {
	data?: T;
	loading: boolean;
	error?: string;
	updatedAt?: Date;
};

export type SettingsState = {
	showWeather: boolean;
	showHot: boolean;
	showNews: boolean;
	autoRefresh: boolean;
};

export type PageId = "home" | "hot" | "news" | "weather" | "tools" | "settings";
export type ToolId = "translate" | "qrcode" | "password" | "palette";
export type SearchProviderId = "site" | "bing" | "google" | "chatgpt" | "doubao";
export type WallpaperMode = "default" | "mint" | "paper" | "dawn" | "custom";
export type ChromeTheme = "classic" | "floating" | "minimal";
export type ColorTheme = "light" | "dark";

export type AvatarState = {
	mode: "default" | "upload" | "qq";
	src?: string;
	qq?: string;
	updatedAt?: number;
};

export type WallpaperState = {
	mode: WallpaperMode;
	src?: string;
	updatedAt?: number;
};

export type ToolDefinition = {
	id: ToolId;
	icon: LucideIcon;
	label: string;
	sub: string;
};
