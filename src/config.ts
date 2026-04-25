import {
	BarChart3,
	CalendarClock,
	CloudSun,
	Flame,
	Gauge,
	Home,
	KeyRound,
	Languages,
	LayoutGrid,
	Newspaper,
	Palette,
	QrCode,
	Settings,
	ShieldCheck,
	Sparkles,
	TerminalSquare,
} from "lucide-react";
import type { EndpointDefinition } from "./api";
import type {
	ChromeTheme,
	ColorTheme,
	SearchProviderId,
	ToolDefinition,
	WallpaperMode,
} from "./types";

export const CACHE_TTL = 10 * 60 * 1000;

export const STORAGE_KEYS = {
	apiBase: "60s-web:api-base",
	city: "60s-web:city",
	settings: "60s-web:settings",
	avatar: "60s-web:avatar",
	searchProvider: "60s-web:search-provider",
	wallpaper: "60s-web:wallpaper",
	chromeTheme: "60s-web:chrome-theme",
	colorTheme: "60s-web:color-theme",
} as const;

export const nav = [
	{ id: "home" as const, label: "首页", icon: Home },
	{ id: "hot" as const, label: "热榜", icon: BarChart3 },
	{ id: "news" as const, label: "新闻", icon: Newspaper },
	{ id: "weather" as const, label: "天气", icon: CloudSun },
	{ id: "tools" as const, label: "工具", icon: LayoutGrid },
	{ id: "settings" as const, label: "设置", icon: Settings },
];

export const hotTabs = [
	{ id: "weibo", label: "微博", path: "/weibo" },
	{ id: "zhihu", label: "知乎", path: "/zhihu" },
	{ id: "bili", label: "B站", path: "/bili" },
	{ id: "douyin", label: "抖音", path: "/douyin" },
	{ id: "toutiao", label: "头条", path: "/toutiao" },
];

export const searchProviders: Array<{
	id: SearchProviderId;
	label: string;
	sub: string;
}> = [
	{ id: "site", label: "站内", sub: "接口" },
	{ id: "bing", label: "Bing", sub: "网页" },
	{ id: "google", label: "Google", sub: "网页" },
	{ id: "chatgpt", label: "ChatGPT", sub: "问答" },
	{ id: "doubao", label: "豆包", sub: "对话" },
];

export const wallpaperOptions: Array<{
	id: WallpaperMode;
	label: string;
	sub: string;
}> = [
	{ id: "default", label: "默认", sub: "清爽渐变" },
	{ id: "mint", label: "薄荷", sub: "轻绿色调" },
	{ id: "paper", label: "纸面", sub: "干净留白" },
	{ id: "dawn", label: "晨光", sub: "暖色氛围" },
	{ id: "custom", label: "自定义", sub: "本地图片" },
];

export const chromeThemes: Array<{
	id: ChromeTheme;
	label: string;
	sub: string;
}> = [
	{ id: "classic", label: "经典", sub: "固定栏" },
	{ id: "floating", label: "悬浮", sub: "浮层卡片" },
	{ id: "minimal", label: "极简", sub: "轻边界" },
];

export const colorThemes: Array<{
	id: ColorTheme;
	label: string;
	sub: string;
}> = [
	{ id: "light", label: "浅色", sub: "清爽白昼" },
	{ id: "dark", label: "暗色", sub: "夜间低亮" },
];

export const toolDefinitions: ToolDefinition[] = [
	{
		id: "translate",
		icon: Languages,
		label: "翻译",
		sub: "多语言互译",
	},
	{
		id: "qrcode",
		icon: QrCode,
		label: "二维码",
		sub: "生成与预览",
	},
	{
		id: "password",
		icon: KeyRound,
		label: "密码",
		sub: "生成强密码",
	},
	{
		id: "palette",
		icon: Palette,
		label: "配色",
		sub: "色彩搭配",
	},
];

export const EPIC_COVER_PLACEHOLDER =
	"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='172' height='116' viewBox='0 0 172 116'><rect width='172' height='116' rx='12' fill='%23f3f6f8'/><rect x='16' y='16' width='140' height='84' rx='10' fill='%23e7eef3'/><path d='M36 82l24-26 18 18 26-30 32 38H36z' fill='%23c9d6df'/><circle cx='58' cy='44' r='9' fill='%23d7e3ea'/><text x='86' y='104' text-anchor='middle' font-size='12' fill='%23667885' font-family='Arial, sans-serif'>Epic Cover</text></svg>";
export const API_REPO_URL = "https://github.com/vikiboss/60s";
export const WEB_REPO_URL = "https://github.com/dogxii/60s-web";

export const categoryLabels: Record<EndpointDefinition["category"], string> = {
	periodic: "周期资讯",
	utility: "实用功能",
	hot: "热门榜单",
	entertainment: "消遣娱乐",
	beta: "Beta",
	legacy: "兼容旧版",
};

export const categoryIcons: Record<EndpointDefinition["category"], typeof Home> = {
	periodic: CalendarClock,
	utility: Gauge,
	hot: Flame,
	entertainment: Sparkles,
	beta: TerminalSquare,
	legacy: ShieldCheck,
};
