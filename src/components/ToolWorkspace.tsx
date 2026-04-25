import {
	Copy,
	KeyRound,
	Languages,
	Palette,
	QrCode,
	RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	type ColorPaletteResult,
	fetchApi,
	type PasswordResult,
	type QrCodeResult,
	type TranslationResult,
	unwrap,
} from "../api";
import { API_REPO_URL, toolDefinitions } from "../config";
import type { ApiState, ToolId } from "../types";
import { CardTitle, Status } from "./ui";

export function ToolWorkspace({
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
