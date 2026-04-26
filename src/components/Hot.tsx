import { Flame, RefreshCw } from "lucide-react";
import { formatHotValue, type HotItem, toItems } from "../api";
import { hotTabs } from "../config";
import { useApi } from "../hooks/useApi";
import type { ApiState } from "../types";
import { skeletonItems } from "../utils";
import { CardTitle, EmptyState, Status } from "./ui";

export function HotPage({
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

export function HotBoard({
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
