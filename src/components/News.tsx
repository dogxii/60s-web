import { ExternalLink, Globe2, Newspaper, RefreshCw } from "lucide-react";
import {
	buildUrl,
	type DailyNews,
	DEFAULT_API_BASE,
	toItems,
	tryBuildUrl,
} from "../api";
import { useApi } from "../hooks/useApi";
import type { ApiState } from "../types";
import { skeletonItems, skeletonLines } from "../utils";
import { CardTitle, EmptyState, Status } from "./ui";

export function NewsPage({
	apiBase,
	daily,
}: {
	apiBase: string;
	daily: ApiState<DailyNews> & { reload: () => void };
}) {
	const markdownUrl = tryBuildUrl(apiBase, "/60s", { encoding: "markdown" });
	return (
		<section className="page-stack">
			<div className="page-title">
				<span>
					<Newspaper size={24} /> 新闻资讯
				</span>
				{markdownUrl ? (
					<a href={markdownUrl} target="_blank" rel="noreferrer">
						Markdown <ExternalLink size={15} />
					</a>
				) : (
					<span className="disabled-link">API 地址无效</span>
				)}
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

export function DailyCard({
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
