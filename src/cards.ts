import type { SettingsState } from "./types";

export type HomeCardId =
	| "daily"
	| "hot"
	| "weather"
	| "market"
	| "entertainmentTools"
	| "quote";

export type HomeCardColumn = "left" | "right";

export type HomeCardDefinition = {
	id: HomeCardId;
	label: string;
	description: string;
	settingKey?: keyof Pick<SettingsState, "showNews" | "showHot" | "showWeather">;
};

export type HomeCardLayout = Record<HomeCardColumn, HomeCardId[]>;

export const homeCardRegistry: Record<HomeCardId, HomeCardDefinition> = {
	daily: {
		id: "daily",
		label: "今日 60 秒",
		description: "每日新闻摘要与快捷阅读入口",
		settingKey: "showNews",
	},
	hot: {
		id: "hot",
		label: "全网热榜",
		description: "微博、知乎、B 站等平台热榜聚合",
		settingKey: "showHot",
	},
	weather: {
		id: "weather",
		label: "城市天气",
		description: "实时天气与未来预报",
		settingKey: "showWeather",
	},
	market: {
		id: "market",
		label: "实用数据",
		description: "金价、油价、汇率等生活数据",
	},
	entertainmentTools: {
		id: "entertainmentTools",
		label: "娱乐与工具",
		description: "影视娱乐信息与常用工具快捷入口",
	},
	quote: {
		id: "quote",
		label: "每日一句",
		description: "随机一言与轻量阅读收尾",
	},
};

export const defaultHomeCardLayout: HomeCardLayout = {
	left: ["daily", "hot"],
	right: ["weather", "market", "entertainmentTools", "quote"],
};

const homeCardColumns: HomeCardColumn[] = ["left", "right"];

function isHomeCardId(value: unknown): value is HomeCardId {
	return typeof value === "string" && value in homeCardRegistry;
}

export function getHomeCardDefinition(cardId: HomeCardId) {
	return homeCardRegistry[cardId];
}

export function isHomeCardVisible(
	card: HomeCardDefinition,
	settings: SettingsState,
) {
	if (!card.settingKey) return true;
	return settings[card.settingKey];
}

export function getHomeCards(
	column: HomeCardColumn,
	settings: SettingsState,
	layout: HomeCardLayout = defaultHomeCardLayout,
) {
	return layout[column]
		.map(getHomeCardDefinition)
		.filter((card) => isHomeCardVisible(card, settings));
}

export function normalizeHomeCardLayout(
	layout?: Partial<Record<HomeCardColumn, unknown>>,
): HomeCardLayout {
	const assigned = new Set<HomeCardId>();
	const next: HomeCardLayout = { left: [], right: [] };

	for (const column of homeCardColumns) {
		const rawCards = Array.isArray(layout?.[column])
			? layout[column]
			: defaultHomeCardLayout[column];
		for (const cardId of rawCards) {
			if (!isHomeCardId(cardId) || assigned.has(cardId)) continue;
			next[column].push(cardId);
			assigned.add(cardId);
		}
	}

	for (const column of homeCardColumns) {
		for (const cardId of defaultHomeCardLayout[column]) {
			if (assigned.has(cardId)) continue;
			next[column].push(cardId);
			assigned.add(cardId);
		}
	}

	return next;
}

export function moveHomeCard(
	layout: HomeCardLayout,
	cardId: HomeCardId,
	targetColumn: HomeCardColumn,
	targetIndex: number,
): HomeCardLayout {
	const next = normalizeHomeCardLayout(layout);
	const sourceColumn = homeCardColumns.find((column) =>
		next[column].includes(cardId),
	);
	if (!sourceColumn) return next;

	const sourceIndex = next[sourceColumn].indexOf(cardId);
	next[sourceColumn].splice(sourceIndex, 1);

	const adjustedIndex =
		sourceColumn === targetColumn && sourceIndex < targetIndex
			? targetIndex - 1
			: targetIndex;
	const insertIndex = Math.max(
		0,
		Math.min(adjustedIndex, next[targetColumn].length),
	);
	next[targetColumn].splice(insertIndex, 0, cardId);

	return normalizeHomeCardLayout(next);
}
