export const DEFAULT_API_BASE = "https://60s.viki.moe/v2";

export type ApiCategory =
	| "periodic"
	| "utility"
	| "hot"
	| "entertainment"
	| "beta"
	| "legacy";

export type EndpointParam = {
	name: string;
	label: string;
	defaultValue?: string;
	placeholder?: string;
	required?: boolean;
};

export type EndpointDefinition = {
	id: string;
	name: string;
	category: ApiCategory;
	path: string;
	method: "GET" | "ANY";
	description: string;
	params?: EndpointParam[];
};

export type ApiEnvelope<T = unknown> = {
	code?: number;
	message?: string;
	data?: T;
};

export type DailyNews = {
	date: string;
	day_of_week: string;
	lunar_date: string;
	news: string[];
	cover?: string;
	tip?: string;
	image?: string;
	link?: string;
	updated?: string;
	api_updated?: string;
};

export type HotItem = {
	title?: string;
	name?: string;
	movie_name?: string;
	hot_value?: number | string;
	hot?: number | string;
	heat?: number | string;
	score?: number | string;
	box_office_desc?: string;
	desc?: string;
	link?: string;
	url?: string;
};

export type WeatherRealtime = {
	location?: {
		name?: string;
		province?: string;
		city?: string;
		county?: string;
	};
	weather?: {
		condition?: string;
		temperature?: number;
		humidity?: number;
		wind_direction?: string;
		wind_power?: string;
		weather_icon?: string;
		updated?: string;
	};
	air_quality?: {
		aqi?: number;
		quality?: string;
		pm25?: number;
		pm10?: number;
	} | null;
	sunrise?: {
		sunrise_desc?: string;
		sunset_desc?: string;
	} | null;
};

export type WeatherForecast = {
	location?: WeatherRealtime["location"];
	daily_forecast?: Array<{
		time?: string;
		date?: string;
		day_weather?: string;
		day_condition?: string;
		night_weather?: string;
		night_condition?: string;
		max_degree?: string | number;
		max_temperature?: string | number;
		min_degree?: string | number;
		min_temperature?: string | number;
		day_weather_url?: string;
		day_weather_icon?: string;
		night_weather_icon?: string;
		air_quality?: string;
		aqi?: number;
	}>;
	hourly_forecast?: Array<{
		degree?: string | number;
		temperature?: string | number;
		weather?: string;
		condition?: string;
		update_time?: string;
		datetime?: string;
		weather_icon?: string;
	}>;
};

export type GoldPrice = {
	date?: string;
	metals?: Array<{
		name: string;
		today_price: string;
		sell_price?: string;
		high_price?: string;
		low_price?: string;
		unit: string;
		updated?: string;
	}>;
	stores?: Array<{ brand: string; product: string; formatted: string }>;
	banks?: Array<{ bank: string; product: string; formatted: string }>;
	recycle?: Array<{ type: string; formatted: string; purity?: string }>;
};

export type EpicGame = {
	id: string;
	title: string;
	cover?: string;
	original_price_desc?: string;
	seller?: string;
	is_free_now?: boolean;
	free_start?: string;
	free_end?: string;
	link?: string;
};

export type FuelPrice = {
	region?: string;
	oil92?: string;
	oil95?: string;
	oil98?: string;
	oil0?: string;
	items?: Array<{ name: string; price: number; price_desc: string }>;
	price?: Record<string, string>;
	updated?: string;
};

export type ExchangeRate = {
	base?: string;
	currency?: string;
	rates?:
		| Record<string, number>
		| Array<{
				currency?: string;
				code?: string;
				rate?: number | string;
				value?: number | string;
		  }>;
	list?: Array<{
		name?: string;
		currency?: string;
		code?: string;
		rate?: number | string;
		value?: number | string;
	}>;
	[key: string]: unknown;
};

export type TranslationResult = {
	source?: {
		text?: string;
		type?: string;
		type_desc?: string;
		pronounce?: string;
	};
	target?: {
		text?: string;
		type?: string;
		type_desc?: string;
		pronounce?: string;
	};
};

export type QrCodeResult = {
	mime_type?: string;
	text?: string;
	base64?: string;
	data_uri?: string;
};

export type PasswordResult = {
	password?: string;
	length?: number;
	config?: {
		include_numbers?: boolean;
		include_symbols?: boolean;
		include_lowercase?: boolean;
		include_uppercase?: boolean;
		exclude_similar?: boolean;
		exclude_ambiguous?: boolean;
	};
	generation_info?: {
		entropy?: number;
		strength?: string;
		time_to_crack?: string;
	};
};

export type ColorPaletteResult = {
	input?: {
		hex?: string;
		rgb?: {
			r?: number;
			g?: number;
			b?: number;
		};
		hsl?: {
			h?: number;
			s?: number;
			l?: number;
		};
		name?: string;
	};
	palettes?: Array<{
		name?: string;
		description?: string;
		colors?: Array<{
			hex?: string;
			name?: string;
			role?: string;
			theory?: string;
		}>;
	}>;
	metadata?: {
		color_theory?: string;
		total_palettes?: number;
		applications?: string[];
	};
};

export const endpoints: EndpointDefinition[] = [
	{
		id: "60s",
		name: "每天 60 秒读懂世界",
		category: "periodic",
		path: "/60s",
		method: "GET",
		description: "每日精选新闻、微语、海报",
		params: [{ name: "date", label: "日期", placeholder: "YYYY-MM-DD" }],
	},
	{
		id: "60s-rss",
		name: "60s RSS",
		category: "periodic",
		path: "/60s/rss",
		method: "GET",
		description: "每天 60 秒读世界 RSS 订阅",
	},
	{
		id: "ai-news",
		name: "AI 资讯快报",
		category: "periodic",
		path: "/ai-news",
		method: "GET",
		description: "AI 与大模型资讯",
		params: [{ name: "date", label: "日期", placeholder: "YYYY-MM-DD" }],
	},
	{
		id: "bing",
		name: "必应每日壁纸",
		category: "periodic",
		path: "/bing",
		method: "GET",
		description: "Bing 每日壁纸",
	},
	{
		id: "exchange-rate",
		name: "当日货币汇率",
		category: "periodic",
		path: "/exchange-rate",
		method: "GET",
		description: "指定基准货币汇率",
		params: [{ name: "currency", label: "基准货币", defaultValue: "CNY" }],
	},
	{
		id: "today-in-history",
		name: "历史上的今天",
		category: "periodic",
		path: "/today-in-history",
		method: "GET",
		description: "按日期查询历史事件",
		params: [
			{ name: "date", label: "日期", placeholder: "MM-DD 或 YYYY-MM-DD" },
		],
	},
	{
		id: "epic",
		name: "Epic Games 游戏",
		category: "periodic",
		path: "/epic",
		method: "GET",
		description: "Epic 每周免费游戏",
	},
	{
		id: "it-news",
		name: "实时 IT 资讯",
		category: "periodic",
		path: "/it-news",
		method: "GET",
		description: "IT 之家实时资讯",
		params: [{ name: "limit", label: "数量", defaultValue: "12" }],
	},

	{
		id: "olympics",
		name: "奥运奖牌榜",
		category: "utility",
		path: "/olympics",
		method: "GET",
		description: "奥运会奖牌榜",
		params: [{ name: "id", label: "赛事 ID", placeholder: "留空为最近赛事" }],
	},
	{
		id: "olympics-events",
		name: "奥运赛事列表",
		category: "utility",
		path: "/olympics/events",
		method: "GET",
		description: "可查询的奥运赛事 ID",
	},
	{
		id: "gold-price",
		name: "黄金价格",
		category: "utility",
		path: "/gold-price",
		method: "GET",
		description: "金价、金店、银行金条、回收价",
	},
	{
		id: "fuel-price",
		name: "汽油价格",
		category: "utility",
		path: "/fuel-price",
		method: "ANY",
		description: "按省份查询油价",
		params: [{ name: "region", label: "地区", defaultValue: "上海" }],
	},
	{
		id: "weather-realtime",
		name: "实时天气",
		category: "utility",
		path: "/weather/realtime",
		method: "GET",
		description: "腾讯天气实时数据",
		params: [
			{ name: "query", label: "城市", defaultValue: "上海", required: true },
		],
	},
	{
		id: "weather-forecast",
		name: "天气预报",
		category: "utility",
		path: "/weather/forecast",
		method: "GET",
		description: "7 天天气预报",
		params: [
			{ name: "query", label: "城市", defaultValue: "上海", required: true },
			{ name: "days", label: "天数", defaultValue: "7" },
		],
	},
	{
		id: "moyu",
		name: "摸鱼日报",
		category: "utility",
		path: "/moyu",
		method: "GET",
		description: "摸鱼人日历",
		params: [{ name: "date", label: "日期", placeholder: "YYYY-MM-DD" }],
	},
	{
		id: "lyric",
		name: "歌词搜索",
		category: "utility",
		path: "/lyric",
		method: "ANY",
		description: "QQ 音乐歌词搜索",
		params: [
			{ name: "query", label: "关键词", defaultValue: "晴天", required: true },
			{ name: "clean", label: "清理歌词", defaultValue: "true" },
		],
	},
	{
		id: "whois",
		name: "Whois 查询",
		category: "utility",
		path: "/whois",
		method: "GET",
		description: "域名 Whois 信息",
		params: [
			{
				name: "domain",
				label: "域名",
				defaultValue: "github.com",
				required: true,
			},
		],
	},
	{
		id: "qrcode",
		name: "生成二维码",
		category: "utility",
		path: "/qrcode",
		method: "GET",
		description: "二维码图片或 Base64",
		params: [
			{
				name: "text",
				label: "内容",
				defaultValue: "https://github.com/vikiboss/60s",
				required: true,
			},
			{ name: "size", label: "尺寸", defaultValue: "256" },
			{ name: "encoding", label: "返回格式", defaultValue: "json" },
		],
	},
	{
		id: "baike",
		name: "百度百科词条",
		category: "utility",
		path: "/baike",
		method: "GET",
		description: "百科词条摘要",
		params: [
			{ name: "word", label: "词条", defaultValue: "人工智能", required: true },
		],
	},
	{
		id: "fanyi",
		name: "在线翻译",
		category: "utility",
		path: "/fanyi",
		method: "ANY",
		description: "有道网页翻译",
		params: [
			{
				name: "text",
				label: "文本",
				defaultValue: "你好，世界",
				required: true,
			},
			{ name: "from", label: "源语言", defaultValue: "auto" },
			{ name: "to", label: "目标语言", defaultValue: "en" },
		],
	},
	{
		id: "fanyi-langs",
		name: "翻译语言列表",
		category: "utility",
		path: "/fanyi/langs",
		method: "ANY",
		description: "支持语言列表",
	},
	{
		id: "ip",
		name: "公网 IP 地址",
		category: "utility",
		path: "/ip",
		method: "GET",
		description: "查询公网 IP 与归属地",
		params: [{ name: "ip", label: "IP", placeholder: "留空查当前请求 IP" }],
	},
	{
		id: "og",
		name: "链接 OG 信息",
		category: "utility",
		path: "/og",
		method: "ANY",
		description: "解析网页 Open Graph 信息",
		params: [
			{
				name: "url",
				label: "URL",
				defaultValue: "https://github.com/vikiboss/60s",
				required: true,
			},
		],
	},
	{
		id: "hash",
		name: "哈希/压缩/编码",
		category: "utility",
		path: "/hash",
		method: "ANY",
		description: "MD5、SHA、Base64、URL、压缩编码",
		params: [
			{
				name: "content",
				label: "内容",
				defaultValue: "60s API",
				required: true,
			},
		],
	},
	{
		id: "health",
		name: "身体健康分析",
		category: "utility",
		path: "/health",
		method: "GET",
		description: "BMI、代谢、体脂等估算",
		params: [
			{ name: "height", label: "身高 cm", defaultValue: "170", required: true },
			{ name: "weight", label: "体重 kg", defaultValue: "65", required: true },
			{ name: "gender", label: "性别", defaultValue: "male", required: true },
			{ name: "age", label: "年龄", defaultValue: "28", required: true },
		],
	},
	{
		id: "password",
		name: "密码生成器",
		category: "utility",
		path: "/password",
		method: "GET",
		description: "生成强密码",
		params: [
			{ name: "length", label: "长度", defaultValue: "18" },
			{ name: "symbols", label: "符号", defaultValue: "true" },
		],
	},
	{
		id: "password-check",
		name: "密码强度检测",
		category: "utility",
		path: "/password/check",
		method: "GET",
		description: "检测密码强度",
		params: [
			{
				name: "password",
				label: "密码",
				defaultValue: "S0mething-safe!2026",
				required: true,
			},
		],
	},
	{
		id: "color-random",
		name: "随机颜色/颜色转换",
		category: "utility",
		path: "/color/random",
		method: "GET",
		description: "随机色或颜色转换",
		params: [{ name: "color", label: "颜色", placeholder: "#0f9b8e" }],
	},
	{
		id: "color-palette",
		name: "配色方案",
		category: "utility",
		path: "/color/palette",
		method: "GET",
		description: "生成色彩搭配",
		params: [{ name: "color", label: "基准色", defaultValue: "#0f9b8e" }],
	},
	{
		id: "lunar",
		name: "农历信息",
		category: "utility",
		path: "/lunar",
		method: "GET",
		description: "农历、节气、干支信息",
		params: [{ name: "date", label: "日期", placeholder: "YYYY-MM-DD" }],
	},

	{
		id: "douyin",
		name: "抖音热搜",
		category: "hot",
		path: "/douyin",
		method: "GET",
		description: "抖音实时热搜",
	},
	{
		id: "rednote",
		name: "小红书热点",
		category: "hot",
		path: "/rednote",
		method: "GET",
		description: "小红书实时热点",
	},
	{
		id: "bili",
		name: "哔哩哔哩热搜",
		category: "hot",
		path: "/bili",
		method: "GET",
		description: "B 站热搜",
	},
	{
		id: "quark",
		name: "夸克热点",
		category: "hot",
		path: "/quark",
		method: "GET",
		description: "夸克 7x24 小时热点",
	},
	{
		id: "weibo",
		name: "微博热搜",
		category: "hot",
		path: "/weibo",
		method: "GET",
		description: "微博热搜榜",
	},
	{
		id: "baidu-hot",
		name: "百度实时热搜",
		category: "hot",
		path: "/baidu/hot",
		method: "GET",
		description: "百度热搜",
	},
	{
		id: "baidu-teleplay",
		name: "百度电视剧榜",
		category: "hot",
		path: "/baidu/teleplay",
		method: "GET",
		description: "百度电视剧榜",
	},
	{
		id: "baidu-tieba",
		name: "百度贴吧话题榜",
		category: "hot",
		path: "/baidu/tieba",
		method: "GET",
		description: "贴吧话题榜",
	},
	{
		id: "toutiao",
		name: "头条热搜榜",
		category: "hot",
		path: "/toutiao",
		method: "GET",
		description: "今日头条热搜",
	},
	{
		id: "zhihu",
		name: "知乎话题榜",
		category: "hot",
		path: "/zhihu",
		method: "GET",
		description: "知乎热榜",
	},
	{
		id: "dongchedi",
		name: "懂车帝热搜",
		category: "hot",
		path: "/dongchedi",
		method: "GET",
		description: "懂车帝热搜",
	},
	{
		id: "ncm-rank-list",
		name: "网易云榜单列表",
		category: "hot",
		path: "/ncm-rank/list",
		method: "GET",
		description: "网易云榜单列表",
		params: [{ name: "size", label: "数量", defaultValue: "20" }],
	},
	{
		id: "ncm-rank-detail",
		name: "网易云榜单详情",
		category: "hot",
		path: "/ncm-rank/3778678",
		method: "GET",
		description: "网易云热歌榜详情",
	},
	{
		id: "hacker-news-new",
		name: "Hacker News 最新",
		category: "hot",
		path: "/hacker-news/new",
		method: "GET",
		description: "HN 最新热帖",
		params: [{ name: "limit", label: "数量", defaultValue: "20" }],
	},
	{
		id: "hacker-news-top",
		name: "Hacker News Top",
		category: "hot",
		path: "/hacker-news/top",
		method: "GET",
		description: "HN Top 热帖",
		params: [{ name: "limit", label: "数量", defaultValue: "20" }],
	},
	{
		id: "hacker-news-best",
		name: "Hacker News Best",
		category: "hot",
		path: "/hacker-news/best",
		method: "GET",
		description: "HN Best 热帖",
		params: [{ name: "limit", label: "数量", defaultValue: "20" }],
	},
	{
		id: "maoyan-all-movie",
		name: "猫眼全球票房总榜",
		category: "hot",
		path: "/maoyan/all/movie",
		method: "GET",
		description: "猫眼全球票房",
	},
	{
		id: "maoyan-realtime-movie",
		name: "猫眼电影实时票房",
		category: "hot",
		path: "/maoyan/realtime/movie",
		method: "GET",
		description: "电影实时票房",
	},
	{
		id: "maoyan-realtime-tv",
		name: "猫眼电视收视排行",
		category: "hot",
		path: "/maoyan/realtime/tv",
		method: "GET",
		description: "电视实时收视",
	},
	{
		id: "maoyan-realtime-web",
		name: "猫眼网剧实时热度",
		category: "hot",
		path: "/maoyan/realtime/web",
		method: "GET",
		description: "网剧实时热度",
	},
	{
		id: "douban-movie",
		name: "豆瓣全球口碑电影榜",
		category: "hot",
		path: "/douban/weekly/movie",
		method: "GET",
		description: "豆瓣周榜电影",
	},
	{
		id: "douban-tv-cn",
		name: "豆瓣华语口碑剧集榜",
		category: "hot",
		path: "/douban/weekly/tv_chinese",
		method: "GET",
		description: "豆瓣华语剧集周榜",
	},
	{
		id: "douban-tv-global",
		name: "豆瓣全球口碑剧集榜",
		category: "hot",
		path: "/douban/weekly/tv_global",
		method: "GET",
		description: "豆瓣全球剧集周榜",
	},
	{
		id: "douban-show-cn",
		name: "豆瓣华语口碑综艺榜",
		category: "hot",
		path: "/douban/weekly/show_chinese",
		method: "GET",
		description: "豆瓣华语综艺周榜",
	},
	{
		id: "douban-show-global",
		name: "豆瓣全球口碑综艺榜",
		category: "hot",
		path: "/douban/weekly/show_global",
		method: "GET",
		description: "豆瓣全球综艺周榜",
	},

	{
		id: "changya",
		name: "随机唱歌音频",
		category: "entertainment",
		path: "/changya",
		method: "GET",
		description: "随机唱歌音频",
	},
	{
		id: "hitokoto",
		name: "随机一言",
		category: "entertainment",
		path: "/hitokoto",
		method: "GET",
		description: "一句话内容",
		params: [{ name: "id", label: "ID", placeholder: "留空随机" }],
	},
	{
		id: "luck",
		name: "随机运势",
		category: "entertainment",
		path: "/luck",
		method: "GET",
		description: "随机运势",
		params: [{ name: "id", label: "ID", placeholder: "留空随机" }],
	},
	{
		id: "awesome-js",
		name: "随机 JS 趣味题",
		category: "entertainment",
		path: "/awesome-js",
		method: "GET",
		description: "JavaScript 趣味题",
		params: [{ name: "id", label: "ID", placeholder: "留空随机" }],
	},
	{
		id: "duanzi",
		name: "随机搞笑段子",
		category: "entertainment",
		path: "/duanzi",
		method: "GET",
		description: "随机段子",
		params: [{ name: "id", label: "ID", placeholder: "留空随机" }],
	},
	{
		id: "fabing",
		name: "随机发病文学",
		category: "entertainment",
		path: "/fabing",
		method: "GET",
		description: "发病文学生成",
		params: [
			{ name: "name", label: "称呼", defaultValue: "主人" },
			{ name: "id", label: "ID", placeholder: "留空随机" },
		],
	},
	{
		id: "answer",
		name: "随机答案之书",
		category: "entertainment",
		path: "/answer",
		method: "GET",
		description: "答案之书",
		params: [{ name: "id", label: "ID", placeholder: "留空随机" }],
	},
	{
		id: "kfc",
		name: "随机 KFC 文案",
		category: "entertainment",
		path: "/kfc",
		method: "GET",
		description: "疯狂星期四文案",
	},
	{
		id: "dad-joke",
		name: "随机冷笑话",
		category: "entertainment",
		path: "/dad-joke",
		method: "GET",
		description: "冷笑话",
		params: [{ name: "id", label: "ID", placeholder: "留空随机" }],
	},
	{
		id: "chemical",
		name: "随机化合物",
		category: "entertainment",
		path: "/chemical",
		method: "GET",
		description: "失效接口，保留入口",
		params: [{ name: "id", label: "ID", placeholder: "留空随机" }],
	},

	{
		id: "beta-kuan",
		name: "酷安 beta",
		category: "beta",
		path: "/beta/kuan",
		method: "GET",
		description: "测试接口，可能不稳定",
	},
	{
		id: "beta-qq-profile",
		name: "QQ 资料 beta",
		category: "beta",
		path: "/beta/qq/profile",
		method: "GET",
		description: "测试接口，可能不稳定",
		params: [
			{ name: "qq", label: "QQ", defaultValue: "10000", required: true },
			{ name: "size", label: "头像尺寸", defaultValue: "100" },
		],
	},

	{
		id: "legacy-exchange-rate",
		name: "兼容：exchange_rate",
		category: "legacy",
		path: "/exchange_rate",
		method: "GET",
		description: "旧路径兼容",
		params: [{ name: "currency", label: "基准货币", defaultValue: "CNY" }],
	},
	{
		id: "legacy-today",
		name: "兼容：today_in_history",
		category: "legacy",
		path: "/today_in_history",
		method: "GET",
		description: "旧路径兼容",
	},
	{
		id: "legacy-maoyan",
		name: "兼容：maoyan",
		category: "legacy",
		path: "/maoyan",
		method: "GET",
		description: "旧路径兼容",
	},
	{
		id: "legacy-baidu",
		name: "兼容：baidu/realtime",
		category: "legacy",
		path: "/baidu/realtime",
		method: "GET",
		description: "旧路径兼容",
	},
	{
		id: "legacy-weather",
		name: "兼容：weather",
		category: "legacy",
		path: "/weather",
		method: "GET",
		description: "旧路径兼容",
		params: [{ name: "query", label: "城市", defaultValue: "上海" }],
	},
	{
		id: "legacy-ncm",
		name: "兼容：ncm-rank",
		category: "legacy",
		path: "/ncm-rank",
		method: "GET",
		description: "旧路径兼容",
	},
	{
		id: "legacy-color",
		name: "兼容：color",
		category: "legacy",
		path: "/color",
		method: "GET",
		description: "旧路径兼容",
		params: [{ name: "color", label: "颜色", placeholder: "#0f9b8e" }],
	},
];

export function buildUrl(
	base: string,
	path: string,
	params: Record<string, string | undefined> = {},
) {
	const cleanBase = normalizeApiBase(base);
	const cleanPath = path.startsWith("/") ? path : `/${path}`;
	const url = new URL(`${cleanBase}${cleanPath}`);

	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== "") {
			url.searchParams.set(key, value);
		}
	}

	return url.toString();
}

export function normalizeApiBase(base: string) {
	const cleanBase = base.trim().replace(/\/+$/, "");
	if (!cleanBase) {
		throw new Error("请输入 API 地址");
	}

	let url: URL;
	try {
		url = new URL(cleanBase);
	} catch {
		throw new Error("API 地址格式无效，请输入完整的 http(s) 地址");
	}

	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new Error("API 地址仅支持 http 或 https");
	}

	const path = url.pathname.replace(/\/+$/, "");
	return `${url.origin}${path === "/" ? "" : path}`;
}

export function getApiBaseError(base: string) {
	try {
		normalizeApiBase(base);
		return "";
	} catch (error) {
		return error instanceof Error ? error.message : "API 地址无效";
	}
}

export function tryBuildUrl(
	base: string,
	path: string,
	params: Record<string, string | undefined> = {},
) {
	try {
		return buildUrl(base, path, params);
	} catch {
		return "";
	}
}

export async function fetchApi<T = unknown>(
	base: string,
	path: string,
	params: Record<string, string | undefined> = {},
	signal?: AbortSignal,
): Promise<ApiEnvelope<T>> {
	const response = await fetch(buildUrl(base, path, params), {
		signal,
		headers: {
			accept: "application/json,text/plain,*/*",
		},
	});

	const contentType = response.headers.get("content-type") || "";
	if (contentType.includes("application/json")) {
		const body = (await response.json()) as ApiEnvelope<T>;
		if (!response.ok) {
			throw new Error(body.message || `请求失败：${response.status}`);
		}
		return body;
	}

	const text = await response.text();
	if (!response.ok) {
		throw new Error(text || `请求失败：${response.status}`);
	}
	return { code: response.status, message: "文本响应", data: text as T };
}

export function unwrap<T>(payload?: ApiEnvelope<T> | null): T | undefined {
	if (!payload) return undefined;
	return payload.data ?? (payload as T);
}

export function formatHotValue(value: unknown) {
	const number = typeof value === "number" ? value : Number(value);
	if (Number.isNaN(number) || number <= 0) return "";
	if (number >= 100000000) return `${(number / 100000000).toFixed(1)}亿`;
	if (number >= 10000) return `${(number / 10000).toFixed(1)}万`;
	return String(Math.round(number));
}

export function toItems(value: unknown): HotItem[] {
	if (!value) return [];
	if (Array.isArray(value)) return value as HotItem[];
	if (typeof value === "object") {
		const objectValue = value as Record<string, unknown>;
		for (const key of [
			"list",
			"items",
			"data",
			"news",
			"rank",
			"movies",
			"subjects",
		]) {
			if (Array.isArray(objectValue[key])) return objectValue[key] as HotItem[];
		}
	}
	return [];
}
