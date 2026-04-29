import { LayoutGrid, Search } from "lucide-react";
import {
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	type DailyNews,
	DEFAULT_API_BASE,
	type EndpointDefinition,
	type EpicGame,
	type ExchangeRate,
	endpoints,
	type FuelPrice,
	type GoldPrice,
	normalizeApiBase,
	toItems,
	tryBuildUrl,
	type WeatherForecast,
	type WeatherRealtime,
} from "./api";
import {
	defaultHomeCardLayout,
	normalizeHomeCardLayout,
	type HomeCardLayout,
} from "./cards";
import { EndpointLab } from "./components/EndpointLab";
import { Header } from "./components/Header";
import { HotPage } from "./components/Hot";
import { MarketStrip } from "./components/HomeCards";
import { HomePage } from "./components/HomePage";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { NewsPage } from "./components/News";
import { PwaStatusBar } from "./components/PwaStatusBar";
import { SettingsPanel } from "./components/SettingsPanel";
import { ToolWorkspace } from "./components/ToolWorkspace";
import { WeatherPage } from "./components/Weather";
import {
	CardTitle,
	Footer,
} from "./components/ui";
import {
	categoryLabels,
	chromeThemes,
	colorThemes,
	defaultQuickFavorites,
	hotTabs,
	quickActions,
	searchProviders,
	STORAGE_KEYS,
	wallpaperOptions,
} from "./config";
import { useApi } from "./hooks/useApi";
import {
	clearStoredPrefix,
	readStoredJson,
	readStoredValue,
	writeStoredJson,
	writeStoredValue,
} from "./storage";
import type {
	ApiState,
	AvatarState,
	ChromeTheme,
	ColorTheme,
	EndpointFavoriteId,
	PageId,
	QuickActionDefinition,
	QuickFavoriteId,
	SearchProviderId,
	SettingsState,
	ToolId,
	WallpaperState,
} from "./types";
import {
	buildSearchTarget,
	defaults,
	getWallpaperStyle,
} from "./utils";
import {
	applyServiceWorkerUpdate,
	registerServiceWorker,
	shouldShowIosInstallHint,
} from "./pwa";

const DEFAULT_CITY = "上海";
const DEFAULT_SEARCH_PROVIDER: SearchProviderId = "site";
const DEFAULT_CHROME_THEME: ChromeTheme = "minimal";
const DEFAULT_COLOR_THEME: ColorTheme = "light";
const DEFAULT_SETTINGS_STATE: SettingsState = {
	showWeather: true,
	showHot: true,
	showNews: true,
	autoRefresh: true,
};
const DEFAULT_AVATAR_STATE: AvatarState = { mode: "default" };
const DEFAULT_WALLPAPER_STATE: WallpaperState = { mode: "default" };
const CONFIG_EXPORT_VERSION = 1;

type ConfigActionResult = {
	ok: boolean;
	message: string;
};

type ExportedSettings = {
	apiBase: string;
	city: string;
	searchProvider: SearchProviderId;
	chromeTheme: ChromeTheme;
	colorTheme: ColorTheme;
	wallpaper: WallpaperState;
	avatar: AvatarState;
	modules: SettingsState;
	homeCardLayout: HomeCardLayout;
	endpointFavorites: EndpointFavoriteId[];
	quickFavorites: QuickFavoriteId[];
};

function normalizeEndpointFavorites(value: unknown): EndpointFavoriteId[] {
	if (!Array.isArray(value)) return [];
	const knownIds = new Set(endpoints.map((endpoint) => endpoint.id));
	const assigned = new Set<string>();
	const favorites: EndpointFavoriteId[] = [];

	for (const item of value) {
		if (typeof item !== "string" || !knownIds.has(item) || assigned.has(item)) {
			continue;
		}
		assigned.add(item);
		favorites.push(item);
	}

	return favorites;
}

function normalizeQuickFavorites(
	value: unknown,
	fallback: QuickFavoriteId[] = defaultQuickFavorites,
): QuickFavoriteId[] {
	if (value === undefined || !Array.isArray(value)) return [...fallback];
	const knownIds = new Set(quickActions.map((action) => action.id));
	const assigned = new Set<string>();
	const favorites: QuickFavoriteId[] = [];

	for (const item of value) {
		if (typeof item !== "string") continue;
		const id = item as QuickFavoriteId;
		if (!knownIds.has(id) || assigned.has(id)) {
			continue;
		}
		assigned.add(id);
		favorites.push(id);
	}

	return favorites;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readString(value: unknown, fallback: string) {
	return typeof value === "string" ? value : fallback;
}

function readBoolean(value: unknown, fallback: boolean, label: string) {
	if (value === undefined) return fallback;
	if (typeof value !== "boolean") {
		throw new Error(`${label} 配置格式无效`);
	}
	return value;
}

function readEnum<T extends string>(
	value: unknown,
	allowed: readonly T[],
	fallback: T,
	label: string,
) {
	if (value === undefined) return fallback;
	if (typeof value === "string" && allowed.includes(value as T)) return value as T;
	throw new Error(`${label} 配置值无效`);
}

function parseImportedConfig(raw: string): ExportedSettings {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw) as unknown;
	} catch {
		throw new Error("配置文件不是有效 JSON");
	}
	if (!isRecord(parsed) || parsed.app !== "60s-web") {
		throw new Error("这不是 60s-web 的配置文件");
	}
	if (parsed.version !== CONFIG_EXPORT_VERSION) {
		throw new Error("配置文件版本不兼容");
	}
	if (!isRecord(parsed.settings)) {
		throw new Error("配置文件缺少 settings 字段");
	}

	const config = parsed.settings;
	const apiBase = normalizeApiBase(
		readString(config.apiBase, DEFAULT_API_BASE),
	);
	const wallpaperConfig = isRecord(config.wallpaper) ? config.wallpaper : {};
	const wallpaperMode = readEnum(
		wallpaperConfig.mode,
		wallpaperOptions.map((item) => item.id),
		DEFAULT_WALLPAPER_STATE.mode,
		"壁纸",
	);
	const modules = isRecord(config.modules) ? config.modules : {};

	return {
		apiBase,
		city: readString(config.city, DEFAULT_CITY).trim() || DEFAULT_CITY,
		searchProvider: readEnum(
			config.searchProvider,
			searchProviders.map((item) => item.id),
			DEFAULT_SEARCH_PROVIDER,
			"搜索引擎",
		),
		chromeTheme: readEnum(
			config.chromeTheme,
			chromeThemes.map((item) => item.id),
			DEFAULT_CHROME_THEME,
			"外壳主题",
		),
		colorTheme: readEnum(
			config.colorTheme,
			colorThemes.map((item) => item.id),
			DEFAULT_COLOR_THEME,
			"明暗主题",
		),
		wallpaper:
			wallpaperMode === "custom" ? DEFAULT_WALLPAPER_STATE : { mode: wallpaperMode },
		avatar: DEFAULT_AVATAR_STATE,
		modules: {
			showWeather: readBoolean(
				modules.showWeather,
				DEFAULT_SETTINGS_STATE.showWeather,
				"天气模块",
			),
			showHot: readBoolean(
				modules.showHot,
				DEFAULT_SETTINGS_STATE.showHot,
				"热榜模块",
			),
			showNews: readBoolean(
				modules.showNews,
				DEFAULT_SETTINGS_STATE.showNews,
				"新闻模块",
			),
			autoRefresh: readBoolean(
				modules.autoRefresh,
				DEFAULT_SETTINGS_STATE.autoRefresh,
				"自动刷新",
			),
		},
		homeCardLayout: normalizeHomeCardLayout(
			isRecord(config.homeCardLayout) ? config.homeCardLayout : undefined,
		),
		endpointFavorites: normalizeEndpointFavorites(config.endpointFavorites),
		quickFavorites: normalizeQuickFavorites(config.quickFavorites),
	};
}

export function App() {
	const [apiBase, setApiBase] = useState(() =>
		readStoredValue(STORAGE_KEYS.apiBase, DEFAULT_API_BASE),
	);
	const [city, setCity] = useState(() =>
		readStoredValue(STORAGE_KEYS.city, DEFAULT_CITY),
	);
	const [query, setQuery] = useState("");
	const [activePage, setActivePage] = useState<PageId>("home");
	const [activeTool, setActiveTool] = useState<ToolId>("translate");
	const [searchProvider, setSearchProvider] = useState<SearchProviderId>(
		() =>
			readStoredValue(
				STORAGE_KEYS.searchProvider,
				DEFAULT_SEARCH_PROVIDER,
			) as SearchProviderId,
	);
	const [chromeTheme, setChromeTheme] = useState<ChromeTheme>(
		() =>
			readStoredValue(
				STORAGE_KEYS.chromeTheme,
				DEFAULT_CHROME_THEME,
			) as ChromeTheme,
	);
	const [colorTheme, setColorTheme] = useState<ColorTheme>(
		() =>
			readStoredValue(STORAGE_KEYS.colorTheme, DEFAULT_COLOR_THEME) as ColorTheme,
	);
	const [hotTab, setHotTab] = useState(hotTabs[1]);
	const [avatar, setAvatar] = useState<AvatarState>(() =>
		readStoredJson(STORAGE_KEYS.avatar, DEFAULT_AVATAR_STATE),
	);
	const [wallpaper, setWallpaper] = useState<WallpaperState>(() =>
		readStoredJson(STORAGE_KEYS.wallpaper, DEFAULT_WALLPAPER_STATE),
	);
	const [settings, setSettings] = useState<SettingsState>(() =>
		readStoredJson(STORAGE_KEYS.settings, DEFAULT_SETTINGS_STATE),
	);
	const [homeCardLayout, setHomeCardLayout] = useState<HomeCardLayout>(() =>
		normalizeHomeCardLayout(
			readStoredJson(STORAGE_KEYS.homeCardLayout, defaultHomeCardLayout),
		),
	);
	const [endpointFavorites, setEndpointFavorites] = useState<
		EndpointFavoriteId[]
	>(() =>
		normalizeEndpointFavorites(
			readStoredJson(STORAGE_KEYS.endpointFavorites, []),
		),
	);
	const [quickFavorites, setQuickFavorites] = useState<QuickFavoriteId[]>(() =>
		normalizeQuickFavorites(
			readStoredJson(STORAGE_KEYS.quickFavorites, defaultQuickFavorites),
		),
	);
	const [isOffline, setIsOffline] = useState(() =>
		typeof navigator === "undefined" ? false : !navigator.onLine,
	);
	const [serviceWorkerUpdate, setServiceWorkerUpdate] =
		useState<ServiceWorkerRegistration | null>(null);
	const [showInstallHint, setShowInstallHint] = useState(false);

	const daily = useApi<DailyNews>(
		apiBase,
		"/60s",
		{},
		settings.showNews,
		settings.autoRefresh,
	);
	const weather = useApi<WeatherRealtime>(
		apiBase,
		"/weather/realtime",
		{ query: city },
		settings.showWeather,
		settings.autoRefresh,
	);
	const forecast = useApi<WeatherForecast>(
		apiBase,
		"/weather/forecast",
		{ query: city, days: "7" },
		settings.showWeather,
		settings.autoRefresh,
	);
	const hot = useApi<unknown>(
		apiBase,
		hotTab.path,
		{},
		settings.showHot,
		settings.autoRefresh,
	);
	const gold = useApi<GoldPrice>(
		apiBase,
		"/gold-price",
		{},
		true,
		settings.autoRefresh,
	);
	const fuel = useApi<FuelPrice>(
		apiBase,
		"/fuel-price",
		{ region: city },
		true,
		settings.autoRefresh,
	);
	const exchange = useApi<ExchangeRate>(
		apiBase,
		"/exchange-rate",
		{ currency: "CNY" },
		true,
		settings.autoRefresh,
	);
	const epic = useApi<EpicGame[]>(
		apiBase,
		"/epic",
		{},
		true,
		settings.autoRefresh,
	);
	const maoyan = useApi<unknown>(
		apiBase,
		"/maoyan/realtime/movie",
		{},
		true,
		settings.autoRefresh,
	);
	const hitokoto = useApi<unknown>(
		apiBase,
		"/hitokoto",
		{},
		true,
		settings.autoRefresh,
	);

	const hotItems = useMemo(() => toItems(hot.data).slice(0, 10), [hot.data]);
	const movieItems = useMemo(
		() => toItems(maoyan.data).slice(0, 4),
		[maoyan.data],
	);

	const searchMatches = useMemo(() => {
		const keyword = query.trim().toLowerCase();
		if (!keyword) return [];
		return endpoints
			.filter((endpoint) =>
				[
					endpoint.name,
					endpoint.path,
					endpoint.description,
					categoryLabels[endpoint.category],
				]
					.join(" ")
					.toLowerCase()
					.includes(keyword),
			)
			.slice(0, 8);
	}, [query]);

	useEffect(() => {
		writeStoredValue(STORAGE_KEYS.apiBase, apiBase);
	}, [apiBase]);

	useEffect(() => {
		writeStoredValue(STORAGE_KEYS.city, city);
	}, [city]);

	useEffect(() => {
		writeStoredJson(STORAGE_KEYS.settings, settings);
	}, [settings]);

	useEffect(() => {
		writeStoredJson(STORAGE_KEYS.homeCardLayout, homeCardLayout);
	}, [homeCardLayout]);

	useEffect(() => {
		writeStoredJson(
			STORAGE_KEYS.endpointFavorites,
			normalizeEndpointFavorites(endpointFavorites),
		);
	}, [endpointFavorites]);

	useEffect(() => {
		writeStoredJson(
			STORAGE_KEYS.quickFavorites,
			normalizeQuickFavorites(quickFavorites, []),
		);
	}, [quickFavorites]);

	useEffect(() => {
		writeStoredJson(STORAGE_KEYS.avatar, avatar);
	}, [avatar]);

	useEffect(() => {
		writeStoredValue(STORAGE_KEYS.searchProvider, searchProvider);
	}, [searchProvider]);

	useEffect(() => {
		writeStoredValue(STORAGE_KEYS.chromeTheme, chromeTheme);
	}, [chromeTheme]);

	useEffect(() => {
		writeStoredValue(STORAGE_KEYS.colorTheme, colorTheme);
	}, [colorTheme]);

	useEffect(() => {
		const updateOnlineState = () => setIsOffline(!navigator.onLine);
		window.addEventListener("online", updateOnlineState);
		window.addEventListener("offline", updateOnlineState);
		updateOnlineState();
		return () => {
			window.removeEventListener("online", updateOnlineState);
			window.removeEventListener("offline", updateOnlineState);
		};
	}, []);

	useEffect(() => registerServiceWorker(setServiceWorkerUpdate), []);

	useEffect(() => {
		setShowInstallHint(shouldShowIosInstallHint());
	}, []);

	useEffect(() => {
		const themeColor = colorTheme === "dark" ? "#07100f" : "#ffffff";
		let meta = document.querySelector<HTMLMetaElement>(
			'meta[name="theme-color"]',
		);
		if (!meta) {
			meta = document.createElement("meta");
			meta.name = "theme-color";
			document.head.appendChild(meta);
		}
		meta.content = themeColor;
	}, [colorTheme]);

	useEffect(() => {
		writeStoredJson(STORAGE_KEYS.wallpaper, wallpaper);
	}, [wallpaper]);

	const applyImportedSettings = (config: ExportedSettings) => {
		setApiBase(config.apiBase);
		setCity(config.city);
		setSearchProvider(config.searchProvider);
		setChromeTheme(config.chromeTheme);
		setColorTheme(config.colorTheme);
		setWallpaper(config.wallpaper);
		setAvatar(config.avatar);
		setSettings(config.modules);
		setHomeCardLayout(config.homeCardLayout);
		setEndpointFavorites(config.endpointFavorites);
		setQuickFavorites(config.quickFavorites);
	};

	const exportConfig = (): ConfigActionResult => {
		const exportWallpaper =
			wallpaper.mode === "custom"
				? DEFAULT_WALLPAPER_STATE
				: { mode: wallpaper.mode };
		const payload = {
			app: "60s-web",
			version: CONFIG_EXPORT_VERSION,
			exportedAt: new Date().toISOString(),
			settings: {
				apiBase,
				city,
				searchProvider,
				chromeTheme,
				colorTheme,
				wallpaper: exportWallpaper,
				avatar: DEFAULT_AVATAR_STATE,
				modules: settings,
				homeCardLayout: normalizeHomeCardLayout(homeCardLayout),
				endpointFavorites: normalizeEndpointFavorites(endpointFavorites),
				quickFavorites: normalizeQuickFavorites(quickFavorites, []),
			},
		};
		const blob = new Blob([JSON.stringify(payload, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `60s-web-config-${new Date().toISOString().slice(0, 10)}.json`;
		link.click();
		window.setTimeout(() => URL.revokeObjectURL(url), 0);
		return {
			ok: true,
			message: "配置已导出，本地头像、QQ 号和自定义壁纸不会写入文件。",
		};
	};

	const importConfig = (raw: string): ConfigActionResult => {
		try {
			const config = parseImportedConfig(raw);
			applyImportedSettings(config);
			return { ok: true, message: "配置已导入，页面设置已更新。" };
		} catch (error) {
			return {
				ok: false,
				message:
					error instanceof Error ? error.message : "配置导入失败，请检查文件。",
			};
		}
	};

	const resetConfig = (): ConfigActionResult => {
		clearStoredPrefix("60s-web:");
		applyImportedSettings({
			apiBase: DEFAULT_API_BASE,
			city: DEFAULT_CITY,
			searchProvider: DEFAULT_SEARCH_PROVIDER,
			chromeTheme: DEFAULT_CHROME_THEME,
			colorTheme: DEFAULT_COLOR_THEME,
			wallpaper: DEFAULT_WALLPAPER_STATE,
			avatar: DEFAULT_AVATAR_STATE,
			modules: DEFAULT_SETTINGS_STATE,
			homeCardLayout: normalizeHomeCardLayout(defaultHomeCardLayout),
			endpointFavorites: [],
			quickFavorites: defaultQuickFavorites,
		});
		return { ok: true, message: "已恢复默认设置，并清理本地缓存。" };
	};

	const runQuickAction = (action: QuickActionDefinition) => {
		const target = action.target;
		if (target.page === "hot") {
			const tab = hotTabs.find((item) => item.id === target.hotTabId);
			if (tab) setHotTab(tab);
			setActivePage("hot");
			return;
		}
		if (target.page === "tools") {
			if (target.toolId) setActiveTool(target.toolId);
			setActivePage("tools");
			return;
		}
		setActivePage(target.page);
	};

	const reloadAll = () => {
		daily.reload();
		weather.reload();
		forecast.reload();
		hot.reload();
		gold.reload();
		fuel.reload();
		exchange.reload();
		epic.reload();
		maoyan.reload();
		hitokoto.reload();
	};

	const runSearch = () => {
		const keyword = query.trim();
		if (!keyword) {
			setActivePage("home");
			return;
		}
		if (searchProvider === "site") {
			setActivePage("tools");
			return;
		}
		window.open(
			buildSearchTarget(searchProvider, keyword),
			"_blank",
			"noopener,noreferrer",
		);
	};

	return (
		<div
			className={`app-shell chrome-${chromeTheme} theme-${colorTheme}`}
			style={getWallpaperStyle(wallpaper, colorTheme)}
		>
			<Header
				activePage={activePage}
				setActivePage={setActivePage}
				avatar={avatar}
				setAvatar={setAvatar}
				colorTheme={colorTheme}
				setColorTheme={setColorTheme}
			/>
			<PwaStatusBar
				isOffline={isOffline}
				updateReady={Boolean(serviceWorkerUpdate)}
				showInstallHint={showInstallHint}
				onApplyUpdate={() => {
					applyServiceWorkerUpdate(serviceWorkerUpdate);
					setServiceWorkerUpdate(null);
				}}
				onDismissInstallHint={() => setShowInstallHint(false)}
			/>

			<main>
				<section className="search-band">
					<form
						className="search-box"
						onSubmit={(event) => {
							event.preventDefault();
							runSearch();
						}}
					>
						<Search size={24} />
						<input
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder={
								searchProvider === "site"
									? "搜索接口名称、分类、路径或功能关键词..."
									: `输入关键词，用 ${searchProviders.find((item) => item.id === searchProvider)?.label} 搜索...`
							}
						/>
						<button type="submit">搜索</button>
					</form>
					<div className="search-providers" aria-label="搜索目的地">
						{searchProviders.map((provider) => (
							<button
								key={provider.id}
								type="button"
								className={searchProvider === provider.id ? "active" : ""}
								onClick={() => setSearchProvider(provider.id)}
							>
								<b>{provider.label}</b>
								<small>{provider.sub}</small>
							</button>
						))}
					</div>
					<QuickChips
						favorites={quickFavorites}
						onAction={runQuickAction}
						onManage={() => setActivePage("settings")}
					/>
					{searchMatches.length > 0 && (
						<SearchResults base={apiBase} matches={searchMatches} />
					)}
				</section>

				{activePage === "home" && (
					<HomePage
						apiBase={apiBase}
						setApiBase={setApiBase}
						city={city}
						setCity={setCity}
						settings={settings}
						setSettings={setSettings}
						daily={daily}
						weather={weather}
						forecast={forecast}
						gold={gold}
						fuel={fuel}
						exchange={exchange}
						hotTab={hotTab}
						setHotTab={setHotTab}
						hot={hot}
						hotItems={hotItems}
						epic={epic}
						movieItems={movieItems}
						hitokoto={hitokoto.data}
						homeCardLayout={homeCardLayout}
						setHomeCardLayout={setHomeCardLayout}
						setActivePage={setActivePage}
						setActiveTool={setActiveTool}
					/>
				)}
				{activePage === "hot" && (
					<HotPage apiBase={apiBase} />
				)}
				{activePage === "news" && <NewsPage apiBase={apiBase} daily={daily} />}
				{activePage === "weather" && (
					<WeatherPage
						city={city}
						setCity={setCity}
						realtime={weather}
						forecast={forecast}
					/>
				)}
				{activePage === "tools" && (
					<ToolsPage
						apiBase={apiBase}
						query={query}
						gold={gold}
						fuel={fuel}
						exchange={exchange}
						city={city}
						activeTool={activeTool}
						setActiveTool={setActiveTool}
						endpointFavorites={endpointFavorites}
						setEndpointFavorites={setEndpointFavorites}
					/>
				)}
				{activePage === "settings" && (
					<section className="page-stack">
						<SettingsPanel
							apiBase={apiBase}
							setApiBase={setApiBase}
							city={city}
							setCity={setCity}
							wallpaper={wallpaper}
							setWallpaper={setWallpaper}
							chromeTheme={chromeTheme}
							setChromeTheme={setChromeTheme}
							colorTheme={colorTheme}
							setColorTheme={setColorTheme}
							onExportConfig={exportConfig}
							onImportConfig={importConfig}
							onResetConfig={resetConfig}
							quickFavorites={quickFavorites}
							setQuickFavorites={setQuickFavorites}
							onResetQuickFavorites={() =>
								setQuickFavorites([...defaultQuickFavorites])
							}
						/>
					</section>
				)}
			</main>

			<Footer
				apiBase={apiBase}
				updatedAt={daily.updatedAt}
				isOffline={isOffline}
			/>
			<MobileBottomNav activePage={activePage} setActivePage={setActivePage} />
		</div>
	);
}

function QuickChips({
	favorites,
	onAction,
	onManage,
}: {
	favorites: QuickFavoriteId[];
	onAction: (action: QuickActionDefinition) => void;
	onManage: () => void;
}) {
	const actions = favorites
		.map((id) => quickActions.find((action) => action.id === id))
		.filter((action): action is QuickActionDefinition => Boolean(action));

	return (
		<div className="quick-chips" aria-label="快捷入口">
			{actions.length > 0 ? (
				actions.map((action) => {
					const Icon = action.icon;
					return (
						<button
							key={action.id}
							type="button"
							onClick={() => onAction(action)}
						>
							{Icon ? (
								<Icon size={17} />
							) : (
								<span className={`chip-symbol ${action.symbolTone || ""}`}>
									{action.symbol}
								</span>
							)}
							{action.label}
						</button>
					);
				})
			) : (
				<button type="button" className="manage-chip" onClick={onManage}>
					<LayoutGrid size={17} /> 管理快捷入口
				</button>
			)}
		</div>
	);
}

function SearchResults({
	base,
	matches,
}: {
	base: string;
	matches: EndpointDefinition[];
}) {
	return (
		<div className="search-results">
			{matches.map((endpoint) => {
				const href = tryBuildUrl(base, endpoint.path, defaults(endpoint));
				return href ? (
					<a key={endpoint.id} href={href} target="_blank" rel="noreferrer">
						<span>{endpoint.name}</span>
						<small>{endpoint.path}</small>
					</a>
				) : (
					<span className="disabled-result" key={endpoint.id}>
						<span>{endpoint.name}</span>
						<small>API 地址无效</small>
					</span>
				);
			})}
		</div>
	);
}

function ToolsPage({
	apiBase,
	query,
	gold,
	fuel,
	exchange,
	city,
	activeTool,
	setActiveTool,
	endpointFavorites,
	setEndpointFavorites,
}: {
	apiBase: string;
	query: string;
	gold: ApiState<GoldPrice> & { reload: () => void };
	fuel: ApiState<FuelPrice> & { reload: () => void };
	exchange: ApiState<ExchangeRate> & { reload: () => void };
	city: string;
	activeTool: ToolId;
	setActiveTool: (tool: ToolId) => void;
	endpointFavorites: EndpointFavoriteId[];
	setEndpointFavorites: (favorites: EndpointFavoriteId[]) => void;
}) {
	return (
		<section className="page-stack">
			<div className="page-title">
				<span>
					<LayoutGrid size={24} /> 工具中心
				</span>
				<small>实用数据置顶，四个便捷工具平铺展示</small>
			</div>
			<MarketStrip gold={gold} fuel={fuel} exchange={exchange} city={city} />
			<ToolWorkspace apiBase={apiBase} activeTool={activeTool} />
			{query.trim() && (
				<div className="card tool-query-tip">
					<CardTitle
						icon={<Search size={18} />}
						title="搜索提示"
						right={<span className="status">已筛选接口实验室</span>}
					/>
					<p>
						你当前搜索的是接口或功能关键词，下方接口实验室会同步筛选匹配项。
					</p>
				</div>
			)}
			<EndpointLab
				apiBase={apiBase}
				query={query}
				favorites={endpointFavorites}
				setFavorites={setEndpointFavorites}
			/>
		</section>
	);
}
