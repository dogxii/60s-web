import {
	Image as ImageIcon,
	LayoutGrid,
	Moon,
	RefreshCw,
	Settings,
	Sun,
} from "lucide-react";
import { useRef } from "react";
import {
	defaultHomeCardLayout,
	getHomeCardDefinition,
	isHomeCardVisible,
	moveHomeCard,
	type HomeCardColumn,
	type HomeCardId,
	type HomeCardLayout,
} from "../cards";
import { chromeThemes, colorThemes, wallpaperOptions } from "../config";
import type {
	ChromeTheme,
	ColorTheme,
	SettingsState,
	WallpaperState,
} from "../types";
import { CardTitle } from "./ui";

export function SettingsPanel({
	apiBase,
	setApiBase,
	city,
	setCity,
	settings,
	setSettings,
	reloadAll,
	wallpaper,
	setWallpaper,
	chromeTheme,
	setChromeTheme,
	colorTheme,
	setColorTheme,
	homeCardLayout = defaultHomeCardLayout,
	setHomeCardLayout,
	compact = false,
}: {
	apiBase: string;
	setApiBase: (value: string) => void;
	city?: string;
	setCity?: (value: string) => void;
	settings: SettingsState;
	setSettings: (value: SettingsState) => void;
	reloadAll: () => void;
	wallpaper?: WallpaperState;
	setWallpaper?: (value: WallpaperState) => void;
	chromeTheme?: ChromeTheme;
	setChromeTheme?: (value: ChromeTheme) => void;
	colorTheme?: ColorTheme;
	setColorTheme?: (value: ColorTheme) => void;
	homeCardLayout?: HomeCardLayout;
	setHomeCardLayout?: (value: HomeCardLayout) => void;
	compact?: boolean;
}) {
	const wallpaperInputRef = useRef<HTMLInputElement | null>(null);
	const toggles: Array<[keyof SettingsState, string]> = [
		["showWeather", "显示天气"],
		["showHot", "显示热榜"],
		["showNews", "显示新闻"],
		["autoRefresh", "自动刷新"],
	];
	const homeCardColumns: Array<[HomeCardColumn, string]> = [
		["left", "主阅读栏"],
		["right", "辅助信息栏"],
	];
	const updateHomeCardLayout = (
		cardId: HomeCardId,
		column: HomeCardColumn,
		action: "up" | "down" | "swap",
	) => {
		if (!setHomeCardLayout) return;
		const currentIndex = homeCardLayout[column].indexOf(cardId);
		if (currentIndex < 0) return;
		let targetColumn = column;
		let targetIndex = currentIndex;
		if (action === "up" && currentIndex > 0) {
			targetIndex = currentIndex - 1;
		}
		if (action === "down" && currentIndex < homeCardLayout[column].length - 1) {
			targetIndex = currentIndex + 2;
		}
		if (action === "swap") {
			targetColumn = column === "left" ? "right" : "left";
			targetIndex = homeCardLayout[targetColumn].length;
		}
		setHomeCardLayout(
			moveHomeCard(homeCardLayout, cardId, targetColumn, targetIndex),
		);
	};
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
	return (
		<article
			className={`card settings-panel ${compact ? "compact-settings" : ""}`}
		>
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
				<label className="api-base">
					默认 API
					<input
						value={apiBase}
						onChange={(event) => setApiBase(event.target.value)}
					/>
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
				<button className="primary-subtle" onClick={reloadAll}>
					<RefreshCw size={17} /> 刷新全部模块
				</button>
			</div>
			{!compact && (
				<div className="home-card-settings">
					<div className="settings-subtitle">
						<span>
							<LayoutGrid size={18} /> 首页卡片
						</span>
					</div>
					<div className="home-card-manager">
						{homeCardColumns.map(([column, label]) => (
							<div className="home-card-column" key={column}>
								<b>{label}</b>
								{homeCardLayout[column].map((cardId, index) => {
									const card = getHomeCardDefinition(cardId);
									const visible = isHomeCardVisible(card, settings);
									return (
										<div
											className={`home-card-item ${visible ? "" : "is-hidden"}`}
											key={card.id}
										>
											<span>
												<b>{card.label}</b>
											</span>
											<div className="home-card-actions">
												<em>{visible ? "显示中" : "已隐藏"}</em>
												<button
													type="button"
													disabled={!setHomeCardLayout || index === 0}
													onClick={() => updateHomeCardLayout(card.id, column, "up")}
												>
													上移
												</button>
												<button
													type="button"
													disabled={
														!setHomeCardLayout ||
														index === homeCardLayout[column].length - 1
													}
													onClick={() =>
														updateHomeCardLayout(card.id, column, "down")
													}
												>
													下移
												</button>
												<button
													type="button"
													disabled={!setHomeCardLayout}
													onClick={() =>
														updateHomeCardLayout(card.id, column, "swap")
													}
												>
													{column === "left" ? "到右栏" : "到左栏"}
												</button>
											</div>
										</div>
									);
								})}
							</div>
						))}
					</div>
					{setHomeCardLayout && (
						<div className="home-card-toolbar">
							<button
								type="button"
								onClick={() =>
									setHomeCardLayout({
										left: [...defaultHomeCardLayout.left],
										right: [...defaultHomeCardLayout.right],
									})
								}
							>
								恢复默认布局
							</button>
						</div>
					)}
				</div>
			)}
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
		</article>
	);
}
