import {
	CheckCircle2,
	Github,
	Globe2,
	Loader2,
	Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import packageInfo from "../../package.json";
import { API_REPO_URL, WEB_REPO_URL } from "../config";
import type { ApiState } from "../types";
import { weatherIconType } from "../utils";

export function CardTitle({
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

export function EmptyState({ title, desc }: { title: string; desc: string }) {
	return (
		<div className="empty-state" role="status">
			<Sparkles size={20} />
			<b>{title}</b>
			<small>{desc}</small>
		</div>
	);
}

export function Status({ state }: { state: ApiState<unknown> }) {
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

export function Metric({
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

export function WeatherIcon({
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

export function Footer({
	apiBase,
	updatedAt,
	isOffline = false,
}: {
	apiBase: string;
	updatedAt?: Date;
	isOffline?: boolean;
}) {
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
					<span className={`footer-meta ${isOffline ? "error" : "ok"}`}>
						<strong>状态</strong>
						{isOffline ? "离线" : "正常"}
					</span>
					<span className="footer-dot" />
					<span className="footer-meta version">
						<strong>版本</strong>v{packageInfo.version}
					</span>
					<span className="footer-dot" />
					<span className="footer-meta">
						<strong>PWA</strong>
						可安装
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
