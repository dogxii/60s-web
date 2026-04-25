import {
	CalendarClock,
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
	KeyRound,
	Languages,
	LayoutGrid,
	Loader2,
	MapPin,
	Newspaper,
	Palette,
	QrCode,
	RefreshCw,
	Search,
	ShieldCheck,
	TerminalSquare,
	WalletCards,
	Wind,
} from "lucide-react";
import {
	type FormEvent,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
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
import { getHomeCards, type HomeCardId } from "./cards";
import { Header } from "./components/Header";
import { SettingsPanel } from "./components/SettingsPanel";
import {
	CardTitle,
	EmptyState,
	Footer,
	Metric,
	Status,
	WeatherIcon,
} from "./components/ui";
import {
	API_REPO_URL,
	categoryIcons,
	categoryLabels,
	EPIC_COVER_PLACEHOLDER,
	hotTabs,
	searchProviders,
	STORAGE_KEYS,
	toolDefinitions,
	WEB_REPO_URL,
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
	formatHourlyTime,
	getUpcomingForecastDays,
	getWallpaperStyle,
	readCurrencyRate,
	shortDate,
	skeletonItems,
	skeletonLines,
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
	const renderHomeCard = (cardId: HomeCardId) => {
		if (cardId === "daily") return <DailyCard state={daily} />;
		if (cardId === "hot") {
			return (
				<HotBoard
					tabs={hotTabs}
					active={hotTab.id}
					setActive={setHotTab}
					state={hot}
					items={hotItems}
				/>
			);
		}
		if (cardId === "settings") {
			return (
				<SettingsPanel
					apiBase={apiBase}
					setApiBase={setApiBase}
					settings={settings}
					setSettings={setSettings}
					reloadAll={reloadAll}
					compact
				/>
			);
		}
		if (cardId === "weather") {
			return (
				<WeatherCard
					city={city}
					setCity={setCity}
					realtime={weather}
					forecast={forecast}
					compact
				/>
			);
		}
		if (cardId === "market") {
			return <MarketStrip gold={gold} fuel={fuel} exchange={exchange} city={city} />;
		}
		if (cardId === "entertainmentTools") {
			return (
				<div className="home-right-split">
					<EntertainmentCard epic={epic} movies={movieItems} />
					<ToolShortcuts
						apiBase={apiBase}
						setActivePage={setActivePage}
						setActiveTool={setActiveTool}
					/>
				</div>
			);
		}
		return <QuoteCard data={hitokoto} />;
	};

	return (
		<section className="home-layout">
			<div className="home-left">
				{getHomeCards("left", settings).map((card) => (
					<div className="home-card-slot" key={card.id}>
						{renderHomeCard(card.id)}
					</div>
				))}
			</div>
			<div className="home-right">
				{getHomeCards("right", settings).map((card) => (
					<div className="home-card-slot" key={card.id}>
						{renderHomeCard(card.id)}
					</div>
				))}
			</div>
		</section>
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
}: {
	apiBase: string;
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
				<small>聚合多个榜单源，打开页面即可纵览，不再重复切换。</small>
			</div>
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
	const displayItems = state.loading ? skeletonItems(8) : items;
	const isEmpty = !state.loading && !state.error && items.length === 0;
	return (
		<article className="card mini-hot-card">
			<CardTitle
				icon={<Flame size={19} />}
				title={title}
				right={<Status state={state} />}
			/>
			{isEmpty ? (
				<EmptyState title="暂无热榜数据" desc="上游返回了空列表，稍后刷新即可。" />
			) : (
				<ol className="rank-list compact-rank">
					{displayItems.map((item, index) => (
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
			)}
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
	const displayItems = state.loading ? skeletonItems(8) : items;
	const isEmpty = !state.loading && !state.error && items.length === 0;
	return (
		<article className="card feed-card">
			<CardTitle
				icon={<Newspaper size={20} />}
				title={title}
				right={<Status state={state} />}
			/>
			{isEmpty ? (
				<EmptyState title="暂无资讯" desc="接口返回为空，稍后会随缓存自动刷新。" />
			) : (
				<ol className="news-list">
					{displayItems.map((item, index) => (
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
			)}
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
	const displayNews = state.loading ? skeletonLines(8) : news;
	const isEmpty = !state.loading && !state.error && news.length === 0;
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
			{isEmpty ? (
				<EmptyState title="今日简报暂时为空" desc="上游接口已响应，但没有返回新闻条目。" />
			) : (
				<ol className="news-list">
					{displayNews.slice(0, 8).map((item, index) => (
						<li key={`${item}-${index}`}>
							<span>
								{typeof item === "string" ? item : "正在读取今日简报..."}
							</span>
							<time>{String(index + 1).padStart(2, "0")}</time>
						</li>
					))}
				</ol>
			)}
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
	const displayItems = state.loading ? skeletonItems(10) : items;
	const isEmpty = !state.loading && !state.error && items.length === 0;

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
			{isEmpty ? (
				<EmptyState
					title="暂无热榜数据"
					desc="接口返回了空列表，不再假装加载中。可以手动刷新或切换榜单。"
				/>
			) : (
				<ol className="rank-list">
					{displayItems.map((item, index) => (
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
			)}
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
