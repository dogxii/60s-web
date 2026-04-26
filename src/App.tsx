import {
	CalendarClock,
	CloudSun,
	Coins,
	Flame,
	LayoutGrid,
	QrCode,
	Search,
} from "lucide-react";
import {
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	buildUrl,
	type DailyNews,
	DEFAULT_API_BASE,
	type EndpointDefinition,
	type EpicGame,
	type ExchangeRate,
	endpoints,
	type FuelPrice,
	type GoldPrice,
	toItems,
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
import { NewsPage } from "./components/News";
import { SettingsPanel } from "./components/SettingsPanel";
import { ToolWorkspace } from "./components/ToolWorkspace";
import { WeatherPage } from "./components/Weather";
import {
	CardTitle,
	Footer,
} from "./components/ui";
import {
	categoryLabels,
	hotTabs,
	searchProviders,
	STORAGE_KEYS,
} from "./config";
import { useApi } from "./hooks/useApi";
import {
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
	PageId,
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
	const [searchProvider, setSearchProvider] = useState<SearchProviderId>(
		() =>
			readStoredValue(STORAGE_KEYS.searchProvider, "site") as SearchProviderId,
	);
	const [chromeTheme, setChromeTheme] = useState<ChromeTheme>(
		() => readStoredValue(STORAGE_KEYS.chromeTheme, "minimal") as ChromeTheme,
	);
	const [colorTheme, setColorTheme] = useState<ColorTheme>(
		() => readStoredValue(STORAGE_KEYS.colorTheme, "light") as ColorTheme,
	);
	const [hotTab, setHotTab] = useState(hotTabs[1]);
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
	const [homeCardLayout, setHomeCardLayout] = useState<HomeCardLayout>(() =>
		normalizeHomeCardLayout(
			readStoredJson(STORAGE_KEYS.homeCardLayout, defaultHomeCardLayout),
		),
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
		writeStoredJson(STORAGE_KEYS.homeCardLayout, homeCardLayout);
	}, [homeCardLayout]);

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
						homeCardLayout={homeCardLayout}
						setHomeCardLayout={setHomeCardLayout}
						setActivePage={setActivePage}
						setActiveTool={setActiveTool}
						setSettings={setSettings}
						reloadAll={reloadAll}
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
					/>
				)}
				{activePage === "settings" && (
					<section className="page-stack">
						<SettingsPanel
							apiBase={apiBase}
							setApiBase={setApiBase}
							city={city}
							setCity={setCity}
							settings={settings}
							setSettings={setSettings}
							reloadAll={reloadAll}
							wallpaper={wallpaper}
							setWallpaper={setWallpaper}
							chromeTheme={chromeTheme}
							setChromeTheme={setChromeTheme}
							colorTheme={colorTheme}
							setColorTheme={setColorTheme}
							homeCardLayout={homeCardLayout}
							setHomeCardLayout={setHomeCardLayout}
						/>
					</section>
				)}
			</main>

			<Footer apiBase={apiBase} updatedAt={daily.updatedAt} />
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
