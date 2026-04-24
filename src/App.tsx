import {
	BarChart3,
	CalendarClock,
	CheckCircle2,
	CircleDollarSign,
	Cloud,
	CloudRain,
	CloudSun,
	Code2,
	Coins,
	Copy,
	Droplets,
	ExternalLink,
	Film,
	Flame,
	Fuel,
	Gauge,
	Github,
	Globe2,
	Home,
	KeyRound,
	Languages,
	LayoutGrid,
	Loader2,
	MapPin,
	Image as ImageIcon,
	Newspaper,
	Palette,
	QrCode,
	RefreshCw,
	RotateCcw,
	Save,
	Search,
	Settings,
	ShieldCheck,
	Sparkles,
	Sun,
	TerminalSquare,
	WalletCards,
	Wind,
	Upload,
	UserRound,
	X,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
	type FormEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import packageInfo from "../package.json";
import {
	buildUrl,
	type ColorPaletteResult,
	type DailyNews,
	DEFAULT_API_BASE,
	type EndpointDefinition,
	type EpicGame,
	type ExchangeRate,
	endpoints,
	type FuelPrice,
	fetchApi,
	formatHotValue,
	type GoldPrice,
	type HotItem,
	type PasswordResult,
	type QrCodeResult,
	type TranslationResult,
	toItems,
	unwrap,
	type WeatherForecast,
	type WeatherRealtime,
} from "./api";

type ApiState<T> = {
	data?: T;
	loading: boolean;
	error?: string;
	updatedAt?: Date;
};

type SettingsState = {
	showWeather: boolean;
	showHot: boolean;
	showNews: boolean;
	autoRefresh: boolean;
};

type PageId = "home" | "hot" | "news" | "weather" | "tools" | "settings";
type ToolId = "translate" | "qrcode" | "password" | "palette";
type SearchProviderId = "site" | "bing" | "google" | "chatgpt" | "doubao";
type WallpaperMode = "default" | "mint" | "paper" | "dawn" | "custom";
type ChromeTheme = "classic" | "floating" | "minimal";
type AvatarState = {
	mode: "default" | "upload" | "qq";
	src?: string;
	qq?: string;
	updatedAt?: number;
};
type WallpaperState = {
	mode: WallpaperMode;
	src?: string;
	updatedAt?: number;
};

type ToolDefinition = {
	id: ToolId;
	icon: typeof Languages;
	label: string;
	sub: string;
};

const CACHE_TTL = 10 * 60 * 1000;
const STORAGE_KEYS = {
	apiBase: "60s-web:api-base",
	city: "60s-web:city",
	settings: "60s-web:settings",
	avatar: "60s-web:avatar",
	searchProvider: "60s-web:search-provider",
	wallpaper: "60s-web:wallpaper",
	chromeTheme: "60s-web:chrome-theme",
} as const;

const nav = [
	{ id: "home" as const, label: "首页", icon: Home },
	{ id: "hot" as const, label: "热榜", icon: BarChart3 },
	{ id: "news" as const, label: "新闻", icon: Newspaper },
	{ id: "weather" as const, label: "天气", icon: CloudSun },
	{ id: "tools" as const, label: "工具", icon: LayoutGrid },
	{ id: "settings" as const, label: "设置", icon: Settings },
];

const hotTabs = [
	{ id: "weibo", label: "微博", path: "/weibo" },
	{ id: "zhihu", label: "知乎", path: "/zhihu" },
	{ id: "bili", label: "B站", path: "/bili" },
	{ id: "douyin", label: "抖音", path: "/douyin" },
	{ id: "toutiao", label: "头条", path: "/toutiao" },
];

const searchProviders: Array<{
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

const wallpaperOptions: Array<{
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

const chromeThemes: Array<{
	id: ChromeTheme;
	label: string;
	sub: string;
}> = [
	{ id: "classic", label: "经典", sub: "固定栏" },
	{ id: "floating", label: "悬浮", sub: "浮层卡片" },
	{ id: "minimal", label: "极简", sub: "轻边界" },
];

const toolDefinitions: ToolDefinition[] = [
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

const EPIC_COVER_PLACEHOLDER =
	"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='172' height='116' viewBox='0 0 172 116'><rect width='172' height='116' rx='12' fill='%23f3f6f8'/><rect x='16' y='16' width='140' height='84' rx='10' fill='%23e7eef3'/><path d='M36 82l24-26 18 18 26-30 32 38H36z' fill='%23c9d6df'/><circle cx='58' cy='44' r='9' fill='%23d7e3ea'/><text x='86' y='104' text-anchor='middle' font-size='12' fill='%23667885' font-family='Arial, sans-serif'>Epic Cover</text></svg>";
const API_REPO_URL = "https://github.com/vikiboss/60s";
const WEB_REPO_URL = "https://github.com/dog234/60s-web";

const categoryLabels: Record<EndpointDefinition["category"], string> = {
	periodic: "周期资讯",
	utility: "实用功能",
	hot: "热门榜单",
	entertainment: "消遣娱乐",
	beta: "Beta",
	legacy: "兼容旧版",
};

const categoryIcons: Record<EndpointDefinition["category"], typeof Globe2> = {
	periodic: CalendarClock,
	utility: Gauge,
	hot: Flame,
	entertainment: Sparkles,
	beta: TerminalSquare,
	legacy: ShieldCheck,
};

function useApi<T>(
	base: string,
	path: string,
	params: Record<string, string | undefined>,
	enabled = true,
	autoRefresh = true,
) {
	const paramsKey = JSON.stringify(params);
	const stableParams = useMemo(
		() => JSON.parse(paramsKey) as Record<string, string | undefined>,
		[paramsKey],
	);
	const cacheKey = useMemo(
		() => `60s-web:cache:${buildUrl(base, path, stableParams)}`,
		[base, path, stableParams],
	);
	const [state, setState] = useState<ApiState<T>>(() => {
		if (!enabled || typeof window === "undefined") return { loading: enabled };
		const cached = readCache<T>(cacheKey);
		if (!cached) return { loading: true };
		return {
			data: cached.data,
			loading: false,
			updatedAt: new Date(cached.updatedAt),
		};
	});

	const load = useCallback(
		async (force = false) => {
			if (!enabled) return;
			if (!force) {
				const cached = readCache<T>(cacheKey);
				if (cached) {
					setState({
						data: cached.data,
						loading: false,
						error: undefined,
						updatedAt: new Date(cached.updatedAt),
					});
					return;
				}
			}

			setState((current) => ({ ...current, loading: true, error: undefined }));
			try {
				const payload = await fetchApi<T>(base, path, stableParams);
				const data = unwrap(payload);
				const updatedAt = Date.now();
				writeCache(cacheKey, data, updatedAt);
				setState({
					data,
					loading: false,
					updatedAt: new Date(updatedAt),
				});
			} catch (error) {
				setState((current) => ({
					...current,
					loading: false,
					error: error instanceof Error ? error.message : "请求失败",
				}));
			}
		},
		[base, cacheKey, enabled, path, stableParams],
	);

	useEffect(() => {
		if (!enabled) return;
		void load(false);
	}, [enabled, load]);

	useEffect(() => {
		if (!enabled || !autoRefresh) return;
		const timer = window.setInterval(() => void load(true), CACHE_TTL);
		return () => window.clearInterval(timer);
	}, [autoRefresh, enabled, load]);

	const reload = useCallback(() => load(true), [load]);

	return { ...state, reload };
}

export function App() {
	const [apiBase, setApiBase] = useState(() =>
		readStoredValue(STORAGE_KEYS.apiBase, DEFAULT_API_BASE),
	);
	const [city, setCity] = useState(() =>
		readStoredValue(STORAGE_KEYS.city, "上海"),
	);
	const [query, setQuery] = useState("");
	const [activePage, setActivePage] = useState<PageId>("home");
	const [activeTool, setActiveTool] = useState<ToolId>("translate");
	const [searchProvider, setSearchProvider] = useState<SearchProviderId>(() =>
		readStoredValue(STORAGE_KEYS.searchProvider, "site") as SearchProviderId,
	);
	const [chromeTheme, setChromeTheme] = useState<ChromeTheme>(() =>
		readStoredValue(STORAGE_KEYS.chromeTheme, "classic") as ChromeTheme,
	);
	const [hotTab, setHotTab] = useState(hotTabs[0]);
	const [avatar, setAvatar] = useState<AvatarState>(() =>
		readStoredJson(STORAGE_KEYS.avatar, { mode: "default" }),
	);
	const [wallpaper, setWallpaper] = useState<WallpaperState>(() =>
		readStoredJson(STORAGE_KEYS.wallpaper, { mode: "default" }),
	);
	const [settings, setSettings] = useState<SettingsState>(() =>
		readStoredJson(STORAGE_KEYS.settings, {
			showWeather: true,
			showHot: true,
			showNews: true,
			autoRefresh: true,
		}),
	);

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
		writeStoredJson(STORAGE_KEYS.avatar, avatar);
	}, [avatar]);

	useEffect(() => {
		writeStoredValue(STORAGE_KEYS.searchProvider, searchProvider);
	}, [searchProvider]);

	useEffect(() => {
		writeStoredValue(STORAGE_KEYS.chromeTheme, chromeTheme);
	}, [chromeTheme]);

	useEffect(() => {
		writeStoredJson(STORAGE_KEYS.wallpaper, wallpaper);
	}, [wallpaper]);

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
		window.open(buildSearchTarget(searchProvider, keyword), "_blank", "noopener,noreferrer");
	};

	return (
		<div
			className={`app-shell chrome-${chromeTheme}`}
			style={getWallpaperStyle(wallpaper)}
		>
			<Header
				city={city}
				setCity={setCity}
				activePage={activePage}
				setActivePage={setActivePage}
				avatar={avatar}
				setAvatar={setAvatar}
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
						<button type="submit">
							搜索
						</button>
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
					<div className="quick-chips" aria-label="快捷入口">
						<button onClick={() => setActivePage("news")}>
							<CalendarClock size={17} /> 今日60秒
						</button>
						<button
							onClick={() => {
								setHotTab(hotTabs[0]);
								setActivePage("hot");
							}}
						>
							<Flame size={17} /> 微博热搜
						</button>
						<button
							onClick={() => {
								setHotTab(hotTabs[1]);
								setActivePage("hot");
							}}
						>
							<span className="chip-symbol">知</span> 知乎热榜
						</button>
						<button
							onClick={() => {
								setHotTab(hotTabs[2]);
								setActivePage("hot");
							}}
						>
							<span className="chip-symbol pink">B</span> B站热榜
						</button>
						<button onClick={() => setActivePage("weather")}>
							<CloudSun size={17} /> 天气
						</button>
						<button onClick={() => setActivePage("tools")}>
							<Coins size={17} /> 金价
						</button>
						<button onClick={() => setActivePage("tools")}>
							<QrCode size={17} /> 工具
						</button>
					</div>
					{searchMatches.length > 0 && (
						<SearchResults base={apiBase} matches={searchMatches} />
					)}
				</section>

				{activePage === "home" && (
					<HomePage
						settings={settings}
						daily={daily}
						weather={weather}
						forecast={forecast}
						city={city}
						setCity={setCity}
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
						apiBase={apiBase}
						setApiBase={setApiBase}
						setActivePage={setActivePage}
						setActiveTool={setActiveTool}
						setSettings={setSettings}
						reloadAll={reloadAll}
					/>
				)}
				{activePage === "hot" && (
					<HotPage
						apiBase={apiBase}
						active={hotTab}
						setActive={setHotTab}
						hot={hot}
						hotItems={hotItems}
					/>
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
					/>
				)}
				{activePage === "settings" && (
					<section className="page-stack">
						<SettingsPanel
							apiBase={apiBase}
							setApiBase={setApiBase}
							settings={settings}
							setSettings={setSettings}
							reloadAll={reloadAll}
							wallpaper={wallpaper}
							setWallpaper={setWallpaper}
							chromeTheme={chromeTheme}
							setChromeTheme={setChromeTheme}
						/>
					</section>
				)}
			</main>

			<Footer apiBase={apiBase} updatedAt={daily.updatedAt} />
		</div>
	);
}

function HomePage({
	settings,
	daily,
	weather,
	forecast,
	city,
	setCity,
	gold,
	fuel,
	exchange,
	hotTab,
	setHotTab,
	hot,
	hotItems,
	epic,
	movieItems,
	hitokoto,
	apiBase,
	setApiBase,
	setActivePage,
	setActiveTool,
	setSettings,
	reloadAll,
}: {
	settings: SettingsState;
	daily: ApiState<DailyNews> & { reload: () => void };
	weather: ApiState<WeatherRealtime> & { reload: () => void };
	forecast: ApiState<WeatherForecast> & { reload: () => void };
	city: string;
	setCity: (city: string) => void;
	gold: ApiState<GoldPrice> & { reload: () => void };
	fuel: ApiState<FuelPrice> & { reload: () => void };
	exchange: ApiState<ExchangeRate> & { reload: () => void };
	hotTab: (typeof hotTabs)[number];
	setHotTab: (tab: (typeof hotTabs)[number]) => void;
	hot: ApiState<unknown> & { reload: () => void };
	hotItems: HotItem[];
	epic: ApiState<EpicGame[]>;
	movieItems: HotItem[];
	hitokoto?: unknown;
	apiBase: string;
	setApiBase: (value: string) => void;
	setActivePage: (page: PageId) => void;
	setActiveTool: (tool: ToolId) => void;
	setSettings: (value: SettingsState) => void;
	reloadAll: () => void;
}) {
	return (
		<section className="home-layout">
			<div className="home-left">
				{settings.showNews && <DailyCard state={daily} />}
				{settings.showHot && (
					<HotBoard
						tabs={hotTabs}
						active={hotTab.id}
						setActive={setHotTab}
						state={hot}
						items={hotItems}
					/>
				)}
				<SettingsPanel
					apiBase={apiBase}
					setApiBase={setApiBase}
					settings={settings}
					setSettings={setSettings}
					reloadAll={reloadAll}
					compact
				/>
			</div>
			<div className="home-right">
				{settings.showWeather && (
					<WeatherCard
						city={city}
						setCity={setCity}
						realtime={weather}
						forecast={forecast}
						compact
					/>
				)}
				<MarketStrip gold={gold} fuel={fuel} exchange={exchange} city={city} />
				<div className="home-right-split">
					<EntertainmentCard epic={epic} movies={movieItems} />
					<ToolShortcuts
						apiBase={apiBase}
						setActivePage={setActivePage}
						setActiveTool={setActiveTool}
					/>
				</div>
				<QuoteCard data={hitokoto} />
			</div>
		</section>
	);
}

function Header({
	city,
	setCity,
	activePage,
	setActivePage,
	avatar,
	setAvatar,
}: {
	city: string;
	setCity: (city: string) => void;
	activePage: PageId;
	setActivePage: (page: PageId) => void;
	avatar: AvatarState;
	setAvatar: (avatar: AvatarState) => void;
}) {
	const [avatarOpen, setAvatarOpen] = useState(false);
	const [qqInput, setQqInput] = useState(avatar.qq || "");
	const [avatarNotice, setAvatarNotice] = useState("");
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const avatarWrapRef = useRef<HTMLDivElement | null>(null);
	const avatarSrc = getAvatarSrc(avatar);

	const handleAvatarFile = (file?: File) => {
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			setAvatarNotice("请选择图片文件");
			return;
		}
		if (file.size > 1.5 * 1024 * 1024) {
			setAvatarNotice("图片请控制在 1.5MB 内，避免本地缓存过大");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result !== "string") return;
			setAvatar({
				mode: "upload",
				src: reader.result,
				updatedAt: Date.now(),
			});
			setAvatarNotice("");
			setAvatarOpen(false);
		};
		reader.readAsDataURL(file);
	};

	const saveQqAvatar = () => {
		const qq = qqInput.trim();
		if (!/^\d{5,12}$/.test(qq)) {
			setAvatarNotice("请输入 5-12 位 QQ 号");
			return;
		}
		setAvatar({
			mode: "qq",
			qq,
			src: getQqAvatarUrl(qq),
			updatedAt: Date.now(),
		});
		setAvatarNotice("");
		setAvatarOpen(false);
	};

	useEffect(() => {
		setQqInput(avatar.qq || "");
	}, [avatar.qq]);

	useEffect(() => {
		if (!avatarOpen) return;
		const onPointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (
				target instanceof Node &&
				avatarWrapRef.current &&
				!avatarWrapRef.current.contains(target)
			) {
				setAvatarOpen(false);
			}
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setAvatarOpen(false);
		};
		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [avatarOpen]);

	return (
		<header className="topbar">
			<button
				className="brand"
				onClick={() => setActivePage("home")}
				aria-label="60s 信息聚合首页"
			>
				<img src="/favicon.png" alt="60s logo" width={24} height={24} />
				<strong>60s 信息聚合</strong>
			</button>
			<nav>
				{nav.map((item) => {
					const Icon = item.icon;
					return (
						<button
							key={item.id}
							className={activePage === item.id ? "active" : ""}
							onClick={() => setActivePage(item.id)}
						>
							<Icon size={19} />
							{item.label}
						</button>
					);
				})}
			</nav>
			<div className="header-actions">
				<label className="city-select">
					<MapPin size={17} />
					<input
						value={city}
						onChange={(event) => setCity(event.target.value)}
						aria-label="默认城市"
					/>
				</label>
				<Sun className="theme-icon" size={20} />
				<div className="avatar-wrap" ref={avatarWrapRef}>
					<button
						className="avatar"
						type="button"
						aria-label="自定义头像"
						onClick={() => {
							setAvatarNotice("");
							setAvatarOpen((open) => !open);
						}}
					>
						<img src={avatarSrc} alt="" />
					</button>
					{avatarOpen && (
						<div className="avatar-popover">
							<div className="avatar-popover-head">
								<span>
									<UserRound size={18} /> 自定义头像
								</span>
								<button
									type="button"
									aria-label="关闭头像设置"
									onClick={() => setAvatarOpen(false)}
								>
									<X size={16} />
								</button>
							</div>
							<div className="avatar-preview">
								<img src={avatarSrc} alt="" />
								<small>
									{avatar.mode === "qq"
										? `QQ ${avatar.qq}`
										: avatar.mode === "upload"
											? "本地头像"
											: "默认头像"}
								</small>
							</div>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								hidden
								onChange={(event) => handleAvatarFile(event.target.files?.[0])}
							/>
							<button
								className="avatar-action"
								type="button"
								onClick={() => fileInputRef.current?.click()}
							>
								<Upload size={16} /> 上传本地图片
							</button>
							<label className="qq-avatar-field">
								<span>QQ 头像缓存</span>
								<div>
									<input
										value={qqInput}
										onChange={(event) => setQqInput(event.target.value)}
										placeholder="输入 QQ 号"
										inputMode="numeric"
									/>
									<button type="button" onClick={saveQqAvatar}>
										<Save size={15} /> 保存
									</button>
								</div>
							</label>
							{avatarNotice && (
								<p className="avatar-notice" role="status">
									{avatarNotice}
								</p>
							)}
							<button
								className="avatar-action subtle"
								type="button"
								onClick={() => {
									setAvatar({ mode: "default" });
									setAvatarNotice("");
									setAvatarOpen(false);
								}}
							>
								<RotateCcw size={16} /> 恢复默认
							</button>
						</div>
					)}
				</div>
			</div>
		</header>
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
			{matches.map((endpoint) => (
				<a
					key={endpoint.id}
					href={buildUrl(base, endpoint.path, defaults(endpoint))}
					target="_blank"
					rel="noreferrer"
				>
					<span>{endpoint.name}</span>
					<small>{endpoint.path}</small>
				</a>
			))}
		</div>
	);
}

function HotPage({
	apiBase,
	active,
	setActive,
	hot,
	hotItems,
}: {
	apiBase: string;
	active: (typeof hotTabs)[number];
	setActive: (tab: (typeof hotTabs)[number]) => void;
	hot: ApiState<unknown> & { reload: () => void };
	hotItems: HotItem[];
}) {
	const hotBoards = [
		{ title: "微博热搜", path: "/weibo" },
		{ title: "知乎热榜", path: "/zhihu" },
		{ title: "B站热榜", path: "/bili" },
		{ title: "抖音热搜", path: "/douyin" },
		{ title: "头条热榜", path: "/toutiao" },
		{ title: "百度热搜", path: "/baidu/hot" },
		{ title: "小红书热点", path: "/rednote" },
		{ title: "Hacker News", path: "/hacker-news/top", params: { limit: "12" } },
	];

	return (
		<section className="page-stack">
			<div className="page-title">
				<span>
					<Flame size={24} /> 热榜广场
				</span>
				<small>多个热榜平铺展示，顶部标签仍可切换首页热榜数据源</small>
			</div>
			<HotBoard
				tabs={hotTabs}
				active={active.id}
				setActive={setActive}
				state={hot}
				items={hotItems}
				wide
			/>
			<div className="multi-board-grid">
				{hotBoards.map((board) => (
					<HotMiniBoard
						key={board.path}
						apiBase={apiBase}
						title={board.title}
						path={board.path}
						params={board.params}
					/>
				))}
			</div>
		</section>
	);
}

function HotMiniBoard({
	apiBase,
	title,
	path,
	params,
}: {
	apiBase: string;
	title: string;
	path: string;
	params?: Record<string, string>;
}) {
	const state = useApi<unknown>(apiBase, path, params || {}, true);
	const items = toItems(state.data).slice(0, 8);
	return (
		<article className="card mini-hot-card">
			<CardTitle
				icon={<Flame size={19} />}
				title={title}
				right={<Status state={state} />}
			/>
			<ol className="rank-list compact-rank">
				{(items.length ? items : skeletonItems(8)).map((item, index) => (
					<li key={`${item.title || item.name || item.movie_name}-${index}`}>
						<b>{index + 1}</b>
						<a
							href={item.link || item.url || "#"}
							target="_blank"
							rel="noreferrer"
						>
							{item.title || item.name || item.movie_name || "正在读取..."}
						</a>
						<span>
							{formatHotValue(
								item.hot_value ?? item.hot ?? item.heat ?? item.score,
							)}
						</span>
					</li>
				))}
			</ol>
		</article>
	);
}

function NewsPage({
	apiBase,
	daily,
}: {
	apiBase: string;
	daily: ApiState<DailyNews> & { reload: () => void };
}) {
	return (
		<section className="page-stack">
			<div className="page-title">
				<span>
					<Newspaper size={24} /> 新闻资讯
				</span>
				<a
					href={buildUrl(apiBase, "/60s", { encoding: "markdown" })}
					target="_blank"
					rel="noreferrer"
				>
					Markdown <ExternalLink size={15} />
				</a>
			</div>
			<div className="news-page-grid">
				<DailyCard state={daily} />
				<NewsFeedCard apiBase={apiBase} title="AI 资讯快报" path="/ai-news" />
				<NewsFeedCard
					apiBase={apiBase}
					title="实时 IT 资讯"
					path="/it-news"
					params={{ limit: "16" }}
				/>
				<NewsFeedCard
					apiBase={apiBase}
					title="历史上的今天"
					path="/today-in-history"
				/>
			</div>
		</section>
	);
}

function NewsFeedCard({
	apiBase,
	title,
	path,
	params,
}: {
	apiBase: string;
	title: string;
	path: string;
	params?: Record<string, string>;
}) {
	const state = useApi<unknown>(apiBase, path, params || {}, true);
	const items = toItems(state.data).slice(0, 8);
	return (
		<article className="card feed-card">
			<CardTitle
				icon={<Newspaper size={20} />}
				title={title}
				right={<Status state={state} />}
			/>
			<ol className="news-list">
				{(items.length ? items : skeletonItems(8)).map((item, index) => (
					<li key={`${item.title || item.name || item.movie_name}-${index}`}>
						<span>
							{item.title ||
								item.name ||
								item.movie_name ||
								item.desc ||
								"正在读取资讯..."}
						</span>
						<time>{String(index + 1).padStart(2, "0")}</time>
					</li>
				))}
			</ol>
		</article>
	);
}

function WeatherPage({
	city,
	setCity,
	realtime,
	forecast,
}: {
	city: string;
	setCity: (city: string) => void;
	realtime: ApiState<WeatherRealtime> & { reload: () => void };
	forecast: ApiState<WeatherForecast> & { reload: () => void };
}) {
	const hourly = forecast.data?.hourly_forecast?.slice(0, 12) ?? [];
	const current = realtime.data?.weather;
	const air = realtime.data?.air_quality;
	return (
		<section className="page-stack">
			<div className="page-title">
				<span>
					<CloudSun size={24} /> 天气中心
				</span>
				<label className="city-select page-city">
					<MapPin size={17} />
					<input
						value={city}
						onChange={(event) => setCity(event.target.value)}
					/>
				</label>
			</div>
			<WeatherCard
				city={city}
				setCity={setCity}
				realtime={realtime}
				forecast={forecast}
			/>
			<div className="weather-detail-grid">
				<Metric
					icon={<Droplets size={26} />}
					label="湿度"
					value={`${current?.humidity ?? "--"}%`}
					sub="实时观测"
				/>
				<Metric
					icon={<Wind size={26} />}
					label="风力"
					value={current?.wind_power || "--"}
					sub={current?.wind_direction || "风向"}
				/>
				<Metric
					icon={<Gauge size={26} />}
					label="AQI"
					value={air?.aqi ?? "--"}
					sub={air?.quality || "空气质量"}
					tone="green"
				/>
				<Metric
					icon={<CloudRain size={26} />}
					label="PM2.5"
					value={air?.pm25 ?? "--"}
					sub="细颗粒物"
				/>
			</div>
			<article className="card hourly-card">
				<CardTitle icon={<CalendarClock size={20} />} title="逐小时预报" />
				<div className="hourly-row">
					{hourly.map((item, index) => (
						<div
							key={`${item.update_time || item.datetime}-${index}`}
							className="hourly-item"
						>
							<span>
								{formatHourlyTime(item.update_time || item.datetime) ||
									`${index + 1}h`}
							</span>
							<WeatherIcon condition={item.weather || item.condition} small />
							<b>{item.degree ?? item.temperature}°</b>
							<small>{item.weather || item.condition}</small>
						</div>
					))}
				</div>
			</article>
		</section>
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
}: {
	apiBase: string;
	query: string;
	gold: ApiState<GoldPrice> & { reload: () => void };
	fuel: ApiState<FuelPrice> & { reload: () => void };
	exchange: ApiState<ExchangeRate> & { reload: () => void };
	city: string;
	activeTool: ToolId;
	setActiveTool: (tool: ToolId) => void;
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
			<EndpointLab apiBase={apiBase} query={query} />
		</section>
	);
}

function DailyCard({
	state,
}: {
	state: ApiState<DailyNews> & { reload: () => void };
}) {
	const news = state.data?.news ?? [];
	return (
		<article id="news" className="card daily-card span-6">
			<CardTitle
				icon={<Globe2 size={22} />}
				title="今日 60 秒看世界"
				right={<Status state={state} />}
			/>
			<div className="subline">
				<span>{state.data?.date || "今日"}</span>
				<span>{state.data?.day_of_week}</span>
				<span>{state.data?.lunar_date}</span>
			</div>
			<ol className="news-list">
				{(news.length ? news : skeletonLines(8))
					.slice(0, 8)
					.map((item, index) => (
						<li key={`${item}-${index}`}>
							<span>
								{typeof item === "string" ? item : "正在读取今日简报..."}
							</span>
							<time>{String(index + 1).padStart(2, "0")}</time>
						</li>
					))}
			</ol>
			<div className="button-row">
				<a
					className="outline-button"
					href={state.data?.link || buildUrl(DEFAULT_API_BASE, "/60s")}
					target="_blank"
					rel="noreferrer"
				>
					<ExternalLink size={17} /> 查看全文
				</a>
				<button className="outline-button" onClick={state.reload}>
					<RefreshCw size={17} /> 刷新
				</button>
			</div>
		</article>
	);
}

function WeatherCard({
	city,
	setCity,
	realtime,
	forecast,
	compact = false,
}: {
	city: string;
	setCity: (city: string) => void;
	realtime: ApiState<WeatherRealtime> & { reload: () => void };
	forecast: ApiState<WeatherForecast> & { reload: () => void };
	compact?: boolean;
}) {
	const current = realtime.data?.weather;
	const air = realtime.data?.air_quality;
	const days = getUpcomingForecastDays(forecast.data?.daily_forecast);

	return (
		<article className={`card weather-card ${compact ? "home-weather" : ""}`}>
			<CardTitle
				icon={<CloudSun size={22} />}
				title="城市天气"
				right={
					<div className="weather-actions">
						<label className="mini-input">
							<input
								value={city}
								onChange={(event) => setCity(event.target.value)}
							/>
						</label>
						<span className="status weather-status">
							{current?.updated
								? `更新 ${current.updated.slice(11, 16)}`
								: "未来 7 天"}
						</span>
					</div>
				}
			/>
			<div className="weather-body">
				<div className="weather-main">
					<WeatherIcon condition={current?.condition} />
					<div className="temperature">
						<strong>{current?.temperature ?? "--"}</strong>
						<span>°C</span>
					</div>
					<div className="weather-summary">
						<b>{current?.condition || "读取中"}</b>
						<small>
							{realtime.data?.location?.city ||
								realtime.data?.location?.name ||
								city}
							{" · "}
							{current?.wind_direction || "风向"} {current?.wind_power || "--"}
						</small>
					</div>
				</div>
				<div className="weather-metrics">
					<Metric
						label="AQI"
						value={air?.aqi ?? "--"}
						sub={air?.quality || "空气"}
						tone="green"
					/>
					<Metric
						icon={<Droplets size={22} />}
						label="湿度"
						value={`${current?.humidity ?? "--"}%`}
						sub="相对湿度"
					/>
					<Metric
						icon={<Wind size={22} />}
						label="风速"
						value={current?.wind_power || "--"}
						sub={current?.wind_direction || "风向"}
					/>
				</div>
				<div
					className="forecast-row"
					style={{
						gridTemplateColumns: `repeat(${Math.max(days.length, 1)}, minmax(0, 1fr))`,
					}}
				>
					{days.map((day) => (
						<div key={`${day.date}-${day.label}`} className="forecast-day">
							<b>{day.label}</b>
							<span>{shortDate(day.date)}</span>
							<WeatherIcon condition={day.condition} small />
							<b>{day.max}°</b>
							<small>{day.min}°</small>
						</div>
					))}
				</div>
			</div>
		</article>
	);
}

function MarketStrip({
	gold,
	fuel,
	exchange,
	city,
}: {
	gold: ApiState<GoldPrice> & { reload: () => void };
	fuel: ApiState<FuelPrice> & { reload: () => void };
	exchange: ApiState<ExchangeRate> & { reload: () => void };
	city: string;
}) {
	const metal = gold.data?.metals?.[0];
	const fuelValue =
		fuel.data?.items?.find((item) => item.name.includes("92"))?.price ||
		fuel.data?.oil92 ||
		fuel.data?.price?.["92"] ||
		fuel.data?.price?.["92#"] ||
		"--";
	const usdRate = readCurrencyRate(exchange.data, "USD");
	const usd = usdRate ? (1 / usdRate).toFixed(4) : "--";

	return (
		<article className="card market-strip">
			<CardTitle icon={<Gauge size={18} />} title="实用数据" />
			<div className="market-grid">
				<Metric
					icon={<Coins size={31} />}
					label="金价"
					value={metal ? `${metal.today_price}` : "--"}
					sub={metal?.unit || "元/克"}
					tone="gold"
				/>
				<Metric
					icon={<Fuel size={31} />}
					label={`${city} 92# 油价`}
					value={fuelValue}
					sub="元/升"
				/>
				<Metric
					icon={<CircleDollarSign size={31} />}
					label="美元/人民币"
					value={String(usd).slice(0, 7)}
					sub="实时汇率"
					tone="red"
				/>
				<Metric
					icon={<CalendarClock size={31} />}
					label="自动刷新"
					value="10 分钟"
					sub="手动刷新可跳过缓存"
				/>
			</div>
		</article>
	);
}

function HotBoard({
	tabs,
	active,
	setActive,
	state,
	items,
	wide = false,
}: {
	tabs: typeof hotTabs;
	active: string;
	setActive: (tab: (typeof hotTabs)[number]) => void;
	state: ApiState<unknown> & { reload: () => void };
	items: HotItem[];
	wide?: boolean;
}) {
	return (
		<article className={`card hot-board ${wide ? "wide" : ""}`}>
			<CardTitle
				icon={<Flame size={22} />}
				title="全网热榜"
				right={
					<button className="ghost-button" onClick={state.reload}>
						<RefreshCw size={16} /> 刷新缓存
					</button>
				}
			/>
			<div className="tabs">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						className={active === tab.id ? "active" : ""}
						onClick={() => setActive(tab)}
					>
						{tab.label}
					</button>
				))}
			</div>
			<ol className="rank-list">
				{(items.length ? items : skeletonItems(10)).map((item, index) => (
					<li key={`${item.title || item.name || item.movie_name}-${index}`}>
						<b>{index + 1}</b>
						<a
							href={item.link || item.url || "#"}
							target="_blank"
							rel="noreferrer"
						>
							{item.title || item.name || item.movie_name || "正在读取热榜..."}
						</a>
						<span>
							{formatHotValue(
								item.hot_value ?? item.hot ?? item.heat ?? item.score,
							)}
						</span>
					</li>
				))}
			</ol>
		</article>
	);
}

function EntertainmentCard({
	epic,
	movies,
}: {
	epic: ApiState<EpicGame[]>;
	movies: HotItem[];
}) {
	const games = epic.data?.slice(0, 2) ?? [];
	return (
		<article className="card entertainment">
			<CardTitle icon={<Film size={21} />} title="影视与娱乐" />
			<div className="mini-section">
				<div className="mini-heading">
					<b>电影票房</b>
					<small>实时</small>
				</div>
				{movies.length === 0 && <p className="muted">正在读取票房...</p>}
				{movies.map((movie, index) => (
					<div
						className="compact-row"
						key={`${movie.title || movie.name || movie.movie_name}-${index}`}
					>
						<span>{index + 1}</span>
						<b>{movie.title || movie.name || movie.movie_name}</b>
						<small>
							{movie.box_office_desc ||
								formatHotValue(movie.hot_value ?? movie.score ?? movie.heat)}
						</small>
					</div>
				))}
			</div>
			<div className="mini-section game-list">
				<div className="mini-heading">
					<b>Epic 本周免费游戏</b>
					<small>每周</small>
				</div>
				{games.map((game) => (
					<a
						className="game-row"
						key={game.id}
						href={game.link}
						target="_blank"
						rel="noreferrer"
					>
						<img
							src={game.cover || EPIC_COVER_PLACEHOLDER}
							alt=""
							onError={(event) => {
								event.currentTarget.src = EPIC_COVER_PLACEHOLDER;
							}}
						/>
						<span>
							<b>{game.title}</b>
							<small>
								{game.is_free_now
									? "限时免费领取"
									: game.original_price_desc || "即将免费"}
							</small>
						</span>
					</a>
				))}
			</div>
		</article>
	);
}

function ToolShortcuts({
	apiBase,
	setActivePage,
	setActiveTool,
}: {
	apiBase: string;
	setActivePage?: (page: PageId) => void;
	setActiveTool?: (tool: ToolId) => void;
}) {
	return (
		<article className="card tool-card">
			<CardTitle icon={<ShieldCheck size={21} />} title="便捷工具" />
			<div className="tool-grid">
				{toolDefinitions.map((tool) => {
					const Icon = tool.icon;
					const hrefMap: Record<ToolId, string> = {
						translate: buildUrl(apiBase, "/fanyi", {
							text: "你好，世界",
							from: "auto",
							to: "en",
						}),
						qrcode: buildUrl(apiBase, "/qrcode", {
							text: API_REPO_URL,
							encoding: "json",
						}),
						password: buildUrl(apiBase, "/password", {
							length: "18",
							symbols: "true",
						}),
						palette: buildUrl(apiBase, "/color/palette", { color: "#0f9b8e" }),
					};

					return setActivePage && setActiveTool ? (
						<button
							key={tool.id}
							type="button"
							aria-label={`打开工具页：${tool.label}`}
							onClick={() => {
								setActiveTool(tool.id);
								setActivePage("tools");
							}}
						>
							<Icon size={24} />
							<span>
								<b>{tool.label}</b>
								<small>{tool.sub}</small>
							</span>
						</button>
					) : (
						<a
							key={tool.id}
							href={hrefMap[tool.id]}
							target="_blank"
							rel="noreferrer"
						>
							<Icon size={24} />
							<span>
								<b>{tool.label}</b>
								<small>{tool.sub}</small>
							</span>
						</a>
					);
				})}
			</div>
			<div className="tool-card-extra">
				<div>
					<b>接口实验室</b>
					<small>按关键词筛选并直接运行 60s API</small>
				</div>
				{setActivePage ? (
					<button type="button" onClick={() => setActivePage("tools")}>
						<Code2 size={16} /> 打开
					</button>
				) : (
					<a href={WEB_REPO_URL} target="_blank" rel="noreferrer">
						<Github size={16} /> GitHub
					</a>
				)}
			</div>
		</article>
	);
}

function QuoteCard({ data }: { data?: unknown }) {
	const text =
		typeof data === "string"
			? data
			: data && typeof data === "object"
				? String(
						(data as Record<string, unknown>).hitokoto ||
							(data as Record<string, unknown>).text ||
							"生活不是等待风暴过去，而是学会在雨中翩翩起舞。",
					)
				: "生活不是等待风暴过去，而是学会在雨中翩翩起舞。";

	return (
		<article className="quote-card">
			<span>“</span>
			<p>{text}</p>
			<small>60s API 随机一言</small>
		</article>
	);
}

function SettingsPanel({
	apiBase,
	setApiBase,
	settings,
	setSettings,
	reloadAll,
	wallpaper,
	setWallpaper,
	chromeTheme,
	setChromeTheme,
	compact = false,
}: {
	apiBase: string;
	setApiBase: (value: string) => void;
	settings: SettingsState;
	setSettings: (value: SettingsState) => void;
	reloadAll: () => void;
	wallpaper?: WallpaperState;
	setWallpaper?: (value: WallpaperState) => void;
	chromeTheme?: ChromeTheme;
	setChromeTheme?: (value: ChromeTheme) => void;
	compact?: boolean;
}) {
	const wallpaperInputRef = useRef<HTMLInputElement | null>(null);
	const toggles: Array<[keyof SettingsState, string]> = [
		["showWeather", "显示天气"],
		["showHot", "显示热榜"],
		["showNews", "显示新闻"],
		["autoRefresh", "自动刷新"],
	];
	const handleWallpaperFile = (file?: File) => {
		if (!file || !setWallpaper) return;
		if (!file.type.startsWith("image/")) return;
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result !== "string") return;
			setWallpaper({
				mode: "custom",
				src: reader.result,
				updatedAt: Date.now(),
			});
		};
		reader.readAsDataURL(file);
	};
	return (
		<article
			className={`card settings-panel ${compact ? "compact-settings" : ""}`}
		>
			<CardTitle icon={<Settings size={21} />} title="模块设置" />
			<div className="settings-grid">
				{toggles.map(([key, label]) => (
					<label className="switch-row" key={key}>
						<span>{label}</span>
						<input
							type="checkbox"
							checked={settings[key]}
							onChange={(event) =>
								setSettings({ ...settings, [key]: event.target.checked })
							}
						/>
					</label>
				))}
				<label className="api-base">
					默认 API
					<input
						value={apiBase}
						onChange={(event) => setApiBase(event.target.value)}
					/>
				</label>
				<button className="primary-subtle" onClick={reloadAll}>
					<RefreshCw size={17} /> 刷新全部模块
				</button>
			</div>
			{!compact && wallpaper && setWallpaper && (
				<div className="appearance-settings">
					{chromeTheme && setChromeTheme && (
						<>
							<div className="settings-subtitle">
								<span>
									<LayoutGrid size={18} /> 外壳主题
								</span>
								<small>同步调整顶部导航和底部状态栏的样式</small>
							</div>
							<div className="chrome-theme-grid">
								{chromeThemes.map((theme) => (
									<button
										type="button"
										key={theme.id}
										className={chromeTheme === theme.id ? "active" : ""}
										onClick={() => setChromeTheme(theme.id)}
									>
										<i className={`chrome-preview chrome-preview-${theme.id}`}>
											<span />
											<b />
										</i>
										<span>
											<b>{theme.label}</b>
											<small>{theme.sub}</small>
										</span>
									</button>
								))}
							</div>
						</>
					)}
					<div className="settings-subtitle">
						<span>
							<ImageIcon size={18} /> 壁纸
						</span>
						<small>默认壁纸不加载外部资源，自定义图片只保存在本地浏览器</small>
					</div>
					<div className="wallpaper-grid">
						{wallpaperOptions.map((option) => (
							<button
								type="button"
								key={option.id}
								className={wallpaper.mode === option.id ? "active" : ""}
								onClick={() => {
									if (option.id === "custom") {
										wallpaperInputRef.current?.click();
										return;
									}
									setWallpaper({ mode: option.id });
								}}
							>
								<i className={`wallpaper-preview wallpaper-${option.id}`}>
									{option.id === "custom" && wallpaper.src ? (
										<img src={wallpaper.src} alt="" />
									) : null}
								</i>
								<span>
									<b>{option.label}</b>
									<small>{option.sub}</small>
								</span>
							</button>
						))}
					</div>
					<input
						ref={wallpaperInputRef}
						type="file"
						accept="image/*"
						hidden
						onChange={(event) => handleWallpaperFile(event.target.files?.[0])}
					/>
				</div>
			)}
		</article>
	);
}

function EndpointLab({ apiBase, query }: { apiBase: string; query: string }) {
	const [category, setCategory] = useState<
		EndpointDefinition["category"] | "all"
	>("all");
	const [active, setActive] = useState(endpoints[0]);
	const [params, setParams] = useState<Record<string, string>>(
		defaults(endpoints[0]),
	);
	const [result, setResult] = useState<ApiState<unknown>>({ loading: false });

	const visible = useMemo(() => {
		const keyword = query.trim().toLowerCase();
		return endpoints.filter((endpoint) => {
			const categoryMatch =
				category === "all" || endpoint.category === category;
			const queryMatch =
				!keyword ||
				[
					endpoint.name,
					endpoint.path,
					endpoint.description,
					categoryLabels[endpoint.category],
				]
					.join(" ")
					.toLowerCase()
					.includes(keyword);
			return categoryMatch && queryMatch;
		});
	}, [category, query]);

	const choose = (endpoint: EndpointDefinition) => {
		setActive(endpoint);
		setParams(defaults(endpoint));
		setResult({ loading: false });
	};

	const run = async (event?: FormEvent) => {
		event?.preventDefault();
		setResult({ loading: true });
		try {
			const payload = await fetchApi(apiBase, active.path, params);
			setResult({ data: payload, loading: false, updatedAt: new Date() });
		} catch (error) {
			setResult({
				loading: false,
				error: error instanceof Error ? error.message : "请求失败",
			});
		}
	};

	return (
		<div className="endpoint-lab">
			<div className="section-title">
				<span>
					<Code2 size={24} />
					<b>接口实验室</b>
				</span>
				<small>已收录 {endpoints.length} 个上游路由</small>
			</div>
			<div className="category-tabs">
				<button
					className={category === "all" ? "active" : ""}
					onClick={() => setCategory("all")}
				>
					全部
				</button>
				{(Object.keys(categoryLabels) as EndpointDefinition["category"][]).map(
					(key) => (
						<button
							key={key}
							className={category === key ? "active" : ""}
							onClick={() => setCategory(key)}
						>
							{categoryLabels[key]}
						</button>
					),
				)}
			</div>
			<div className="lab-grid">
				<div className="endpoint-list">
					{visible.map((endpoint) => {
						const Icon = categoryIcons[endpoint.category];
						return (
							<button
								key={endpoint.id}
								className={active.id === endpoint.id ? "active" : ""}
								onClick={() => choose(endpoint)}
							>
								<Icon size={18} />
								<span>
									<b>{endpoint.name}</b>
									<small>{endpoint.path}</small>
								</span>
							</button>
						);
					})}
				</div>
				<div className="endpoint-runner">
					<div className="runner-head">
						<div>
							<b>{active.name}</b>
							<small>{active.description}</small>
						</div>
						<a
							href={buildUrl(apiBase, active.path, params)}
							target="_blank"
							rel="noreferrer"
						>
							打开 <ExternalLink size={15} />
						</a>
					</div>
					<form onSubmit={run} className="param-form">
						{(active.params?.length
							? active.params
							: [{ name: "_empty", label: "无需参数", defaultValue: "" }]
						).map((param) => (
							<label
								key={param.name}
								className={param.name === "_empty" ? "disabled" : ""}
							>
								<span>
									{param.label}
									{param.required ? " *" : ""}
								</span>
								<input
									disabled={param.name === "_empty"}
									value={
										param.name === "_empty" ? "" : params[param.name] || ""
									}
									onChange={(event) =>
										setParams({ ...params, [param.name]: event.target.value })
									}
									placeholder={param.placeholder}
								/>
							</label>
						))}
						<div className="runner-actions">
							<button type="submit" className="primary-subtle">
								{result.loading ? (
									<Loader2 className="spin" size={17} />
								) : (
									<TerminalSquare size={17} />
								)}
								调用接口
							</button>
							<button
								type="button"
								className="outline-button"
								onClick={() =>
									navigator.clipboard?.writeText(
										buildUrl(apiBase, active.path, params),
									)
								}
							>
								<Copy size={16} /> 复制 URL
							</button>
						</div>
					</form>
					<pre className="response-panel">
						{result.loading
							? "Loading..."
							: result.error
								? result.error
								: result.data
									? JSON.stringify(result.data, null, 2)
									: "选择接口后点击调用，响应会显示在这里。"}
					</pre>
				</div>
			</div>
		</div>
	);
}

function CardTitle({
	icon,
	title,
	right,
}: {
	icon: ReactNode;
	title: string;
	right?: ReactNode;
}) {
	return (
		<div className="card-title">
			<span>
				{icon}
				<b>{title}</b>
			</span>
			{right}
		</div>
	);
}

function Status({ state }: { state: ApiState<unknown> }) {
	if (state.loading)
		return (
			<span className="status loading">
				<Loader2 className="spin" size={15} /> 同步中
			</span>
		);
	if (state.error) return <span className="status error">失败</span>;
	return (
		<span className="status">
			<CheckCircle2 size={15} /> 已同步
		</span>
	);
}

function Metric({
	icon,
	label,
	value,
	sub,
	tone,
}: {
	icon?: ReactNode;
	label: string;
	value: string | number;
	sub?: string;
	tone?: "green" | "gold" | "red";
}) {
	return (
		<div className={`metric ${tone || ""}`}>
			{icon && <span className="metric-icon">{icon}</span>}
			<small>{label}</small>
			<b>{value}</b>
			{sub && <em>{sub}</em>}
		</div>
	);
}

function WeatherIcon({
	condition,
	small = false,
}: {
	condition?: string;
	small?: boolean;
}) {
	const type = weatherIconType(condition);
	return (
		<span
			className={`weather-art ${small ? "small" : ""} ${type}`}
			aria-hidden="true"
		>
			<i className="sun-dot" />
			<i className="cloud-a" />
			<i className="cloud-b" />
			<i className="rain-a" />
			<i className="rain-b" />
		</span>
	);
}

function Footer({ apiBase, updatedAt }: { apiBase: string; updatedAt?: Date }) {
	return (
		<footer>
			<div className="footer-inner">
				<div className="footer-left">
					<a
						className="footer-text-link brand-link"
						href={API_REPO_URL}
						target="_blank"
						rel="noreferrer"
					>
						<img src="/favicon.png" alt="60s logo" width={18} height={18} />
						<strong>60s</strong>
						<small>API</small>
						<Github size={15} />
					</a>
					<span className="footer-separator" />
					<a
						className="footer-text-link brand-link"
						href={WEB_REPO_URL}
						target="_blank"
						rel="noreferrer"
					>
						<Github size={18} />
						<strong>60s-web</strong>
						<small>Web</small>
					</a>
					<span className="footer-separator" />
					<span className="footer-meta api-link">
						<Globe2 size={16} />
						{apiBase.replace(/^https?:\/\//, "")}
					</span>
				</div>
				<div className="footer-right">
					<span className="footer-meta ok">
						<strong>状态</strong>
						正常
					</span>
					<span className="footer-dot" />
					<span className="footer-meta version">
						<strong>版本</strong>v{packageInfo.version}
					</span>
					<span className="footer-dot" />
					<span className="footer-meta runtime">
						<strong>缓存</strong>
						10 分钟
					</span>
					<span className="footer-dot" />
					<span className="footer-meta">
						<strong>最近同步</strong>
						{updatedAt
							? updatedAt.toLocaleTimeString("zh-CN", {
									hour: "2-digit",
									minute: "2-digit",
								})
							: "--:--"}
					</span>
				</div>
			</div>
		</footer>
	);
}

function defaults(endpoint: EndpointDefinition) {
	return Object.fromEntries(
		(endpoint.params || []).map((param) => [
			param.name,
			param.defaultValue || "",
		]),
	);
}

function skeletonLines(count: number) {
	return Array.from({ length: count }, (_, index) => `loading-${index}`);
}

function skeletonItems(count: number): HotItem[] {
	return Array.from({ length: count }, (_, index) => ({
		title: `正在读取第 ${index + 1} 条...`,
	}));
}

function shortDate(input: string) {
	if (!input) return "";
	const date = new Date(input.replace(/\//g, "-"));
	if (Number.isNaN(date.getTime())) return input.slice(5);
	return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatHourlyTime(input?: string) {
	if (!input) return "";
	const date = new Date(input.replace(" ", "T"));
	if (Number.isNaN(date.getTime())) return input.slice(-5);
	return date.toLocaleTimeString("zh-CN", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getUpcomingForecastDays(
	days?: WeatherForecast["daily_forecast"],
): Array<{
	date: string;
	label: string;
	condition?: string;
	max: string | number;
	min: string | number;
}> {
	if (!days?.length) return [];
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return days
		.map((day) => ({
			date: day.time || day.date || "",
			condition: day.day_weather || day.day_condition,
			max: day.max_degree ?? day.max_temperature ?? "--",
			min: day.min_degree ?? day.min_temperature ?? "--",
		}))
		.filter((day) => {
			const date = new Date(day.date.replace(/\//g, "-"));
			if (Number.isNaN(date.getTime())) return true;
			date.setHours(0, 0, 0, 0);
			return date >= today;
		})
		.slice(0, 7)
		.map((day, index) => ({
			...day,
			label:
				index === 0 ? "今天" : index === 1 ? "明天" : formatWeekLabel(day.date),
		}));
}

function formatWeekLabel(input: string) {
	const date = new Date(input.replace(/\//g, "-"));
	if (Number.isNaN(date.getTime())) return "本周";
	return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
		date.getDay()
	];
}

function weatherIconType(condition?: string) {
	if (!condition) return "cloudy";
	if (condition.includes("雨") || condition.includes("雷")) return "rainy";
	if (condition.includes("晴") && !condition.includes("云")) return "sunny";
	if (condition.includes("雪")) return "snowy";
	return "cloudy";
}

function getQqAvatarUrl(qq: string) {
	return `https://q1.qlogo.cn/g?b=qq&nk=${encodeURIComponent(qq)}&s=100`;
}

function getAvatarSrc(avatar: AvatarState) {
	if (avatar.mode === "upload" && avatar.src) return avatar.src;
	if (avatar.mode === "qq" && avatar.qq) return avatar.src || getQqAvatarUrl(avatar.qq);
	return "/favicon.png";
}

function buildSearchTarget(provider: SearchProviderId, keyword: string) {
	const query = encodeURIComponent(keyword);
	if (provider === "bing") return `https://www.bing.com/search?q=${query}`;
	if (provider === "google") return `https://www.google.com/search?q=${query}`;
	if (provider === "chatgpt") return `https://chatgpt.com/?q=${query}`;
	if (provider === "doubao") return `https://www.doubao.com/chat/?q=${query}`;
	return "#";
}

function getWallpaperStyle(wallpaper: WallpaperState): CSSProperties {
	if (wallpaper.mode === "custom" && wallpaper.src) {
		return {
			backgroundImage: `linear-gradient(180deg, rgba(246, 248, 248, 0.84), rgba(246, 248, 248, 0.9)), url("${wallpaper.src}")`,
			backgroundSize: "cover",
			backgroundPosition: "center",
			backgroundAttachment: "fixed",
		};
	}
	if (wallpaper.mode === "mint") {
		return {
			background:
				"linear-gradient(135deg, rgba(15,155,142,0.16), rgba(37,99,235,0.08) 45%, rgba(246,248,248,1) 100%)",
		};
	}
	if (wallpaper.mode === "paper") {
		return {
			background:
				"linear-gradient(180deg, rgba(255,255,255,0.96), rgba(246,248,248,1)), radial-gradient(circle at 20% 18%, rgba(15,155,142,0.06), transparent 28rem)",
		};
	}
	if (wallpaper.mode === "dawn") {
		return {
			background:
				"linear-gradient(135deg, rgba(255,244,229,0.95), rgba(239,247,245,1) 52%, rgba(246,248,248,1))",
		};
	}
	return {};
}

function readCurrencyRate(data: ExchangeRate | undefined, code: string) {
	if (!data?.rates) return undefined;
	if (Array.isArray(data.rates)) {
		const match = data.rates.find(
			(item) => item.currency === code || item.code === code,
		);
		return Number(match?.rate ?? match?.value) || undefined;
	}
	return data.rates[code];
}

function readStoredValue(key: string, fallback: string) {
	if (typeof window === "undefined") return fallback;
	return window.localStorage.getItem(key) || fallback;
}

function writeStoredValue(key: string, value: string) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(key, value);
}

function readStoredJson<T>(key: string, fallback: T): T {
	if (typeof window === "undefined") return fallback;
	try {
		const raw = window.localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
}

function writeStoredJson<T>(key: string, value: T) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(key, JSON.stringify(value));
}

function readCache<T>(key: string): { data: T; updatedAt: number } | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as { data: T; updatedAt: number };
		if (!parsed?.updatedAt || Date.now() - parsed.updatedAt > CACHE_TTL) {
			window.localStorage.removeItem(key);
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

function writeCache<T>(key: string, data: T | undefined, updatedAt: number) {
	if (typeof window === "undefined" || data === undefined) return;
	window.localStorage.setItem(key, JSON.stringify({ data, updatedAt }));
}

function ToolWorkspace({
	apiBase,
	activeTool,
}: {
	apiBase: string;
	activeTool: ToolId;
}) {
	const orderedTools = [
		activeTool,
		...toolDefinitions
			.map((tool) => tool.id)
			.filter((toolId) => toolId !== activeTool),
	] as ToolId[];

	return (
		<div className="tool-workspace tool-workspace-grid">
			{orderedTools.map((toolId) => {
				if (toolId === "translate") {
					return (
						<div
							key={toolId}
							className={`tool-panel-wrap ${toolId === activeTool ? "featured" : ""}`}
						>
							<TranslateTool apiBase={apiBase} />
						</div>
					);
				}
				if (toolId === "qrcode") {
					return (
						<div
							key={toolId}
							className={`tool-panel-wrap ${toolId === activeTool ? "featured" : ""}`}
						>
							<QrcodeTool apiBase={apiBase} />
						</div>
					);
				}
				if (toolId === "password") {
					return (
						<div
							key={toolId}
							className={`tool-panel-wrap ${toolId === activeTool ? "featured" : ""}`}
						>
							<PasswordTool apiBase={apiBase} />
						</div>
					);
				}
				return (
					<div
						key={toolId}
						className={`tool-panel-wrap ${toolId === activeTool ? "featured" : ""}`}
					>
						<PaletteTool apiBase={apiBase} />
					</div>
				);
			})}
		</div>
	);
}

function TranslateTool({ apiBase }: { apiBase: string }) {
	const [text, setText] = useState("你好，世界");
	const [target, setTarget] = useState("en");
	const [result, setResult] = useState<ApiState<TranslationResult>>({
		loading: false,
	});

	const run = useCallback(async () => {
		setResult({ loading: true });
		try {
			const payload = await fetchApi<TranslationResult>(apiBase, "/fanyi", {
				text,
				from: "auto",
				to: target,
			});
			setResult({
				loading: false,
				data: unwrap(payload),
				updatedAt: new Date(),
			});
		} catch (error) {
			setResult({
				loading: false,
				error: error instanceof Error ? error.message : "请求失败",
			});
		}
	}, [apiBase, target, text]);

	useEffect(() => {
		void run();
	}, [run]);

	return (
		<article className="card tool-panel">
			<CardTitle
				icon={<Languages size={20} />}
				title="在线翻译"
				right={<Status state={result} />}
			/>
			<div className="tool-panel-body">
				<div className="tool-form two-columns">
					<label>
						<span>待翻译内容</span>
						<input
							value={text}
							onChange={(event) => setText(event.target.value)}
						/>
					</label>
					<label>
						<span>目标语言</span>
						<input
							value={target}
							onChange={(event) => setTarget(event.target.value)}
							placeholder="如 en / ja / ko"
						/>
					</label>
				</div>
				<div className="tool-actions">
					<button
						type="button"
						className="primary-subtle"
						onClick={() => void run()}
					>
						<RefreshCw size={16} /> 重新翻译
					</button>
				</div>
				<div className="tool-result-grid">
					<div className="tool-result-card">
						<small>源文本</small>
						<b>{result.data?.source?.text || text}</b>
						<em>{result.data?.source?.type_desc || "自动检测"}</em>
					</div>
					<div className="tool-result-card">
						<small>翻译结果</small>
						<b>{result.data?.target?.text || "--"}</b>
						<em>{result.data?.target?.type_desc || "目标语言"}</em>
					</div>
				</div>
			</div>
		</article>
	);
}

function QrcodeTool({ apiBase }: { apiBase: string }) {
	const [text, setText] = useState(API_REPO_URL);
	const [result, setResult] = useState<ApiState<QrCodeResult>>({
		loading: false,
	});

	const run = useCallback(async () => {
		setResult({ loading: true });
		try {
			const payload = await fetchApi<QrCodeResult>(apiBase, "/qrcode", {
				text,
				size: "256",
				encoding: "json",
			});
			setResult({
				loading: false,
				data: unwrap(payload),
				updatedAt: new Date(),
			});
		} catch (error) {
			setResult({
				loading: false,
				error: error instanceof Error ? error.message : "请求失败",
			});
		}
	}, [apiBase, text]);

	useEffect(() => {
		void run();
	}, [run]);

	return (
		<article className="card tool-panel">
			<CardTitle
				icon={<QrCode size={20} />}
				title="二维码生成"
				right={<Status state={result} />}
			/>
			<div className="tool-panel-body">
				<div className="tool-form">
					<label>
						<span>二维码内容</span>
						<input
							value={text}
							onChange={(event) => setText(event.target.value)}
						/>
					</label>
				</div>
				<div className="tool-actions">
					<button
						type="button"
						className="primary-subtle"
						onClick={() => void run()}
					>
						<RefreshCw size={16} /> 重新生成
					</button>
				</div>
				<div className="qr-preview">
					{result.data?.data_uri ? (
						<img src={result.data.data_uri} alt="二维码预览" />
					) : (
						<div className="tool-empty">暂无二维码预览</div>
					)}
					<div className="tool-result-card">
						<small>编码内容</small>
						<b>{result.data?.text || text}</b>
						<em>{result.data?.mime_type || "image/png"}</em>
					</div>
				</div>
			</div>
		</article>
	);
}

function PasswordTool({ apiBase }: { apiBase: string }) {
	const [length, setLength] = useState("18");
	const [symbols, setSymbols] = useState(true);
	const [result, setResult] = useState<ApiState<PasswordResult>>({
		loading: false,
	});

	const run = useCallback(async () => {
		setResult({ loading: true });
		try {
			const payload = await fetchApi<PasswordResult>(apiBase, "/password", {
				length,
				symbols: String(symbols),
			});
			setResult({
				loading: false,
				data: unwrap(payload),
				updatedAt: new Date(),
			});
		} catch (error) {
			setResult({
				loading: false,
				error: error instanceof Error ? error.message : "请求失败",
			});
		}
	}, [apiBase, length, symbols]);

	useEffect(() => {
		void run();
	}, [run]);

	return (
		<article className="card tool-panel">
			<CardTitle
				icon={<KeyRound size={20} />}
				title="密码生成器"
				right={<Status state={result} />}
			/>
			<div className="tool-panel-body">
				<div className="tool-form two-columns">
					<label>
						<span>长度</span>
						<input
							value={length}
							onChange={(event) => setLength(event.target.value)}
							placeholder="18"
						/>
					</label>
					<label className="tool-checkbox">
						<span>包含符号</span>
						<input
							type="checkbox"
							checked={symbols}
							onChange={(event) => setSymbols(event.target.checked)}
						/>
					</label>
				</div>
				<div className="tool-actions">
					<button
						type="button"
						className="primary-subtle"
						onClick={() => void run()}
					>
						<RefreshCw size={16} /> 再生成一个
					</button>
					<button
						type="button"
						className="outline-button"
						onClick={() =>
							navigator.clipboard?.writeText(result.data?.password || "")
						}
					>
						<Copy size={16} /> 复制密码
					</button>
				</div>
				<div className="tool-result-card highlight">
					<small>生成结果</small>
					<b>{result.data?.password || "--"}</b>
					<em>
						{result.data?.generation_info?.strength || "强度未知"} ·{" "}
						{result.data?.generation_info?.time_to_crack || "待评估"}
					</em>
				</div>
			</div>
		</article>
	);
}

function PaletteTool({ apiBase }: { apiBase: string }) {
	const [color, setColor] = useState("#0f9b8e");
	const [result, setResult] = useState<ApiState<ColorPaletteResult>>({
		loading: false,
	});

	const run = useCallback(async () => {
		setResult({ loading: true });
		try {
			const payload = await fetchApi<ColorPaletteResult>(
				apiBase,
				"/color/palette",
				{ color },
			);
			setResult({
				loading: false,
				data: unwrap(payload),
				updatedAt: new Date(),
			});
		} catch (error) {
			setResult({
				loading: false,
				error: error instanceof Error ? error.message : "请求失败",
			});
		}
	}, [apiBase, color]);

	useEffect(() => {
		void run();
	}, [run]);

	return (
		<article className="card tool-panel">
			<CardTitle
				icon={<Palette size={20} />}
				title="配色方案"
				right={<Status state={result} />}
			/>
			<div className="tool-panel-body">
				<div className="tool-form two-columns">
					<label>
						<span>基准颜色</span>
						<input
							value={color}
							onChange={(event) => setColor(event.target.value)}
						/>
					</label>
					<label>
						<span>颜色面板</span>
						<input
							type="color"
							value={color}
							onChange={(event) => setColor(event.target.value)}
						/>
					</label>
				</div>
				<div className="tool-actions">
					<button
						type="button"
						className="primary-subtle"
						onClick={() => void run()}
					>
						<RefreshCw size={16} /> 重新生成
					</button>
				</div>
				<div className="palette-groups">
					{(result.data?.palettes || []).slice(0, 3).map((palette) => (
						<div className="palette-group" key={palette.name}>
							<div className="mini-heading">
								<b>{palette.name}</b>
								<small>{palette.description}</small>
							</div>
							<div className="palette-row">
								{(palette.colors || []).map((item) => (
									<div
										className="palette-chip"
										key={`${palette.name}-${item.hex}`}
									>
										<i style={{ background: item.hex }} />
										<span>{item.hex}</span>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</article>
	);
}
