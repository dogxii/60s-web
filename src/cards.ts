import type { SettingsState } from "./types";

export type HomeCardId =
	| "daily"
	| "hot"
	| "settings"
	| "weather"
	| "market"
	| "entertainmentTools"
	| "quote";

export type HomeCardColumn = "left" | "right";

export type HomeCardDefinition = {
	id: HomeCardId;
	label: string;
	column: HomeCardColumn;
	settingKey?: keyof Pick<SettingsState, "showNews" | "showHot" | "showWeather">;
};

export const homeCardRegistry: HomeCardDefinition[] = [
	{
		id: "daily",
		label: "今日 60 秒",
		column: "left",
		settingKey: "showNews",
	},
	{
		id: "hot",
		label: "全网热榜",
		column: "left",
		settingKey: "showHot",
	},
	{
		id: "settings",
		label: "模块设置",
		column: "left",
	},
	{
		id: "weather",
		label: "城市天气",
		column: "right",
		settingKey: "showWeather",
	},
	{
		id: "market",
		label: "实用数据",
		column: "right",
	},
	{
		id: "entertainmentTools",
		label: "娱乐与工具",
		column: "right",
	},
	{
		id: "quote",
		label: "每日一句",
		column: "right",
	},
];

export function getHomeCards(column: HomeCardColumn, settings: SettingsState) {
	return homeCardRegistry.filter((card) => {
		if (card.column !== column) return false;
		if (!card.settingKey) return true;
		return settings[card.settingKey];
	});
}
