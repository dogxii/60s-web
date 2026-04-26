import {
	CalendarClock,
	CircleDollarSign,
	Coins,
	Film,
	Fuel,
	Gauge,
	ShieldCheck,
} from "lucide-react";
import {
	buildUrl,
	type EpicGame,
	type ExchangeRate,
	formatHotValue,
	type FuelPrice,
	type GoldPrice,
	type HotItem,
} from "../api";
import {
	API_REPO_URL,
	EPIC_COVER_PLACEHOLDER,
	toolDefinitions,
} from "../config";
import type { ApiState, PageId, ToolId } from "../types";
import { readCurrencyRate } from "../utils";
import { CardTitle, Metric } from "./ui";

export function MarketStrip({
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

export function EntertainmentCard({
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
			<div className="entertainment-sections">
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
			</div>
		</article>
	);
}

export function ToolShortcuts({
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
		</article>
	);
}

export function QuoteCard({ data }: { data?: unknown }) {
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
