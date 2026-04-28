import {
	Code2,
	Copy,
	ExternalLink,
	Loader2,
	TerminalSquare,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import {
	type EndpointDefinition,
	endpoints,
	fetchApi,
	tryBuildUrl,
} from "../api";
import { categoryIcons, categoryLabels } from "../config";
import type { ApiState } from "../types";
import { defaults } from "../utils";

export function EndpointLab({
	apiBase,
	query,
}: {
	apiBase: string;
	query: string;
}) {
	const [category, setCategory] = useState<
		EndpointDefinition["category"] | "all"
	>("all");
	const [active, setActive] = useState(endpoints[0]);
	const [params, setParams] = useState<Record<string, string>>(
		defaults(endpoints[0]),
	);
	const [result, setResult] = useState<ApiState<unknown>>({ loading: false });
	const activeUrl = useMemo(
		() => tryBuildUrl(apiBase, active.path, params),
		[active.path, apiBase, params],
	);

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
						{activeUrl ? (
							<a href={activeUrl} target="_blank" rel="noreferrer">
								打开 <ExternalLink size={15} />
							</a>
						) : (
							<span className="disabled-link">地址无效</span>
						)}
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
								disabled={!activeUrl}
								onClick={() => {
									if (activeUrl) navigator.clipboard?.writeText(activeUrl);
								}}
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
