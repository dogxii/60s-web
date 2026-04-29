import {
	AlertTriangle,
	CheckCircle2,
	Download,
	FileUp,
	Image as ImageIcon,
	LayoutGrid,
	Loader2,
	Moon,
	RotateCcw,
	Settings,
	Star,
	Sun,
	Wifi,
} from "lucide-react";
import { useRef, useState } from "react";
import { fetchApi, getApiBaseError } from "../api";
import { chromeThemes, colorThemes, quickActions, wallpaperOptions } from "../config";
import type {
	ChromeTheme,
	ColorTheme,
	QuickActionDefinition,
	QuickFavoriteId,
	SettingsState,
	WallpaperState,
} from "../types";
import { CardTitle } from "./ui";

type ConfigActionResult = {
	ok: boolean;
	message: string;
};

export function SettingsPanel({
	apiBase,
	setApiBase,
	city,
	setCity,
	wallpaper,
	setWallpaper,
	chromeTheme,
	setChromeTheme,
	colorTheme,
	setColorTheme,
	onExportConfig,
	onImportConfig,
	onResetConfig,
	quickFavorites,
	setQuickFavorites,
	onResetQuickFavorites,
	compact = false,
}: {
	apiBase: string;
	setApiBase: (value: string) => void;
	city?: string;
	setCity?: (value: string) => void;
	wallpaper?: WallpaperState;
	setWallpaper?: (value: WallpaperState) => void;
	chromeTheme?: ChromeTheme;
	setChromeTheme?: (value: ChromeTheme) => void;
	colorTheme?: ColorTheme;
	setColorTheme?: (value: ColorTheme) => void;
	onExportConfig?: () => ConfigActionResult;
	onImportConfig?: (raw: string) => ConfigActionResult;
	onResetConfig?: () => ConfigActionResult;
	quickFavorites?: QuickFavoriteId[];
	setQuickFavorites?: (favorites: QuickFavoriteId[]) => void;
	onResetQuickFavorites?: () => void;
	compact?: boolean;
}) {
	const wallpaperInputRef = useRef<HTMLInputElement | null>(null);
	const configInputRef = useRef<HTMLInputElement | null>(null);
	const [apiCheck, setApiCheck] = useState<{
		status: "idle" | "checking" | "success" | "error";
		message: string;
	}>({ status: "idle", message: "" });
	const [configNotice, setConfigNotice] = useState<ConfigActionResult | null>(
		null,
	);
	const favoriteQuickSet = new Set(quickFavorites || []);
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

	const checkApiConnection = async () => {
		const baseError = getApiBaseError(apiBase);
		if (baseError) {
			setApiCheck({ status: "error", message: baseError });
			return;
		}

		const controller = new AbortController();
		const timer = window.setTimeout(() => controller.abort(), 6000);
		setApiCheck({ status: "checking", message: "正在检测 API 连接..." });
		try {
			await fetchApi(apiBase, "/60s", {}, controller.signal);
			setApiCheck({
				status: "success",
				message: "连接正常，/60s 接口可以访问。",
			});
		} catch (error) {
			const message =
				error instanceof DOMException && error.name === "AbortError"
					? "检测超时，请确认 API 服务可访问。"
					: error instanceof Error
						? error.message
						: "检测失败，请稍后重试。";
			setApiCheck({ status: "error", message });
		} finally {
			window.clearTimeout(timer);
		}
	};

	const importConfigFile = (file?: File) => {
		if (!file || !onImportConfig) return;
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result !== "string") {
				setConfigNotice({ ok: false, message: "无法读取配置文件。" });
				return;
			}
			setConfigNotice(onImportConfig(reader.result));
		};
		reader.onerror = () => {
			setConfigNotice({ ok: false, message: "配置文件读取失败。" });
		};
		reader.readAsText(file);
	};

	const exportConfig = () => {
		if (!onExportConfig) return;
		setConfigNotice(onExportConfig());
	};

	const resetConfig = () => {
		if (!onResetConfig) return;
		const confirmed = window.confirm(
			"确定恢复默认设置并清理 60s-web 本地缓存吗？",
		);
		if (!confirmed) return;
		setApiCheck({ status: "idle", message: "" });
		setConfigNotice(onResetConfig());
	};

	const toggleQuickFavorite = (action: QuickActionDefinition) => {
		if (!quickFavorites || !setQuickFavorites) return;
		if (favoriteQuickSet.has(action.id)) {
			setQuickFavorites(quickFavorites.filter((id) => id !== action.id));
			return;
		}
		setQuickFavorites([...quickFavorites, action.id]);
	};

	return (
		<article
			className={`card settings-panel ${compact ? "compact-settings" : ""}`}
		>
			<CardTitle icon={<Settings size={21} />} title="全局设置" />
			<div className="settings-grid">
				<label className="api-base">
					默认 API
					<span className="api-control-row">
						<input
							value={apiBase}
							onChange={(event) => {
								setApiBase(event.target.value);
								setApiCheck({ status: "idle", message: "" });
							}}
						/>
						<button
							type="button"
							className="outline-button"
							onClick={checkApiConnection}
							disabled={apiCheck.status === "checking"}
						>
							{apiCheck.status === "checking" ? (
								<Loader2 className="spin" size={16} />
							) : (
								<Wifi size={16} />
							)}
							检测
						</button>
					</span>
					{apiCheck.message && (
						<span className={`settings-notice ${apiCheck.status}`}>
							{apiCheck.status === "success" ? (
								<CheckCircle2 size={15} />
							) : apiCheck.status === "checking" ? (
								<Loader2 className="spin" size={15} />
							) : (
								<AlertTriangle size={15} />
							)}
							{apiCheck.message}
						</span>
					)}
				</label>
				{!compact && city !== undefined && setCity && (
					<label className="api-base city-setting">
						默认城市
						<input
							value={city}
							onChange={(event) => setCity(event.target.value)}
							placeholder="例如 上海"
						/>
					</label>
				)}
			</div>
			{!compact && wallpaper && setWallpaper && (
				<div className="appearance-settings">
					{colorTheme && setColorTheme && (
						<>
							<div className="settings-subtitle">
								<span>
									{colorTheme === "dark" ? (
										<Moon size={18} />
									) : (
										<Sun size={18} />
									)}
									明暗主题
								</span>
							</div>
							<div className="color-theme-grid">
								{colorThemes.map((theme) => (
									<button
										type="button"
										key={theme.id}
										className={colorTheme === theme.id ? "active" : ""}
										onClick={() => setColorTheme(theme.id)}
									>
										<i className={`color-preview color-preview-${theme.id}`}>
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
					{chromeTheme && setChromeTheme && (
						<>
							<div className="settings-subtitle">
								<span>
									<LayoutGrid size={18} /> 外壳主题
								</span>
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
			{!compact && quickFavorites && setQuickFavorites && (
				<div className="quick-settings">
					<div className="settings-subtitle">
						<span>
							<Star size={18} /> 快捷入口
						</span>
						<small>{quickFavorites.length} 个收藏，显示在首页搜索下方</small>
					</div>
					<div className="quick-settings-grid">
						{quickActions.map((action) => {
							const Icon = action.icon;
							const active = favoriteQuickSet.has(action.id);
							return (
								<button
									type="button"
									key={action.id}
									className={active ? "active" : ""}
									onClick={() => toggleQuickFavorite(action)}
									aria-pressed={active}
								>
									{Icon ? (
										<Icon size={19} />
									) : (
										<i className={`chip-symbol ${action.symbolTone || ""}`}>
											{action.symbol}
										</i>
									)}
									<span>
										<b>{action.label}</b>
										<small>{action.sub}</small>
									</span>
									<Star size={16} className="quick-star" />
								</button>
							);
						})}
					</div>
					{onResetQuickFavorites && (
						<button
							type="button"
							className="quick-reset-button"
							onClick={onResetQuickFavorites}
						>
							<RotateCcw size={16} /> 恢复默认快捷入口
						</button>
					)}
				</div>
			)}
			{!compact && onExportConfig && onImportConfig && onResetConfig && (
				<div className="config-settings">
					<div className="settings-subtitle">
						<span>
							<FileUp size={18} /> 配置管理
						</span>
						<small>导出不包含头像、QQ 号和自定义壁纸图片</small>
					</div>
					<div className="config-action-grid">
						<button type="button" onClick={exportConfig}>
							<Download size={18} />
							<span>
								<b>导出配置</b>
								<small>保存当前偏好</small>
							</span>
						</button>
						<button
							type="button"
							onClick={() => configInputRef.current?.click()}
						>
							<FileUp size={18} />
							<span>
								<b>导入配置</b>
								<small>从 JSON 恢复</small>
							</span>
						</button>
						<button type="button" className="danger" onClick={resetConfig}>
							<RotateCcw size={18} />
							<span>
								<b>恢复默认</b>
								<small>清理本地缓存</small>
							</span>
						</button>
					</div>
					<input
						ref={configInputRef}
						type="file"
						accept="application/json,.json"
						hidden
						onChange={(event) => {
							importConfigFile(event.target.files?.[0]);
							event.currentTarget.value = "";
						}}
					/>
					{configNotice && (
						<p
							className={`config-notice ${
								configNotice.ok ? "success" : "error"
							}`}
							role="status"
						>
							{configNotice.ok ? (
								<CheckCircle2 size={16} />
							) : (
								<AlertTriangle size={16} />
							)}
							{configNotice.message}
						</p>
					)}
				</div>
			)}
		</article>
	);
}

export function HomeModuleSettings({
	apiBase,
	setApiBase,
	city,
	setCity,
	settings,
	setSettings,
}: {
	apiBase: string;
	setApiBase: (value: string) => void;
	city: string;
	setCity: (value: string) => void;
	settings: SettingsState;
	setSettings: (value: SettingsState) => void;
}) {
	const toggles: Array<[keyof SettingsState, string]> = [
		["showWeather", "显示天气"],
		["showHot", "显示热榜"],
		["showNews", "显示新闻"],
		["autoRefresh", "自动刷新"],
	];

	return (
		<article className="card settings-panel home-module-settings">
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
				<label className="api-base city-setting">
					天气设置
					<input
						value={city}
						onChange={(event) => setCity(event.target.value)}
						placeholder="例如 上海"
					/>
				</label>
				<label className="api-base">
					API 设置
					<input
						value={apiBase}
						onChange={(event) => setApiBase(event.target.value)}
					/>
				</label>
			</div>
		</article>
	);
}
