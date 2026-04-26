import {
	type DailyNews,
	type EpicGame,
	type ExchangeRate,
	type FuelPrice,
	type GoldPrice,
	type HotItem,
	type WeatherForecast,
	type WeatherRealtime,
} from "../api";
import { getHomeCards, type HomeCardId, type HomeCardLayout } from "../cards";
import { hotTabs } from "../config";
import type { ApiState, PageId, SettingsState, ToolId } from "../types";
import {
	EntertainmentCard,
	MarketStrip,
	QuoteCard,
	ToolShortcuts,
} from "./HomeCards";
import { HotBoard } from "./Hot";
import { DailyCard } from "./News";
import { SettingsPanel } from "./SettingsPanel";
import { WeatherCard } from "./Weather";

type HomePageProps = {
	settings: SettingsState;
	daily: ApiState<DailyNews> & { reload: () => void };
	weather: ApiState<WeatherRealtime> & { reload: () => void };
	forecast: ApiState<WeatherForecast> & { reload: () => void };
	city: string;
	setCity: (city: string) => void;
	gold: ApiState<GoldPrice> & { reload: () => void };
	fuel: ApiState<FuelPrice> & { reload: () => void };
	exchange: ApiState<ExchangeRate> & { reload: () => void };
	hotTab: (typeof hotTabs)[number];
	setHotTab: (tab: (typeof hotTabs)[number]) => void;
	hot: ApiState<unknown> & { reload: () => void };
	hotItems: HotItem[];
	epic: ApiState<EpicGame[]>;
	movieItems: HotItem[];
	hitokoto?: unknown;
	apiBase: string;
	setApiBase: (value: string) => void;
	homeCardLayout: HomeCardLayout;
	setActivePage: (page: PageId) => void;
	setActiveTool: (tool: ToolId) => void;
	setSettings: (value: SettingsState) => void;
	reloadAll: () => void;
};

export function HomePage({
	settings,
	daily,
	weather,
	forecast,
	city,
	setCity,
	gold,
	fuel,
	exchange,
	hotTab,
	setHotTab,
	hot,
	hotItems,
	epic,
	movieItems,
	hitokoto,
	apiBase,
	setApiBase,
	homeCardLayout,
	setActivePage,
	setActiveTool,
	setSettings,
	reloadAll,
}: HomePageProps) {
	const renderHomeCard = (cardId: HomeCardId) => {
		if (cardId === "daily") return <DailyCard state={daily} />;
		if (cardId === "hot") {
			return (
				<HotBoard
					tabs={hotTabs}
					active={hotTab.id}
					setActive={setHotTab}
					state={hot}
					items={hotItems}
				/>
			);
		}
		if (cardId === "settings") {
			return (
				<SettingsPanel
					apiBase={apiBase}
					setApiBase={setApiBase}
					settings={settings}
					setSettings={setSettings}
					reloadAll={reloadAll}
					compact
				/>
			);
		}
		if (cardId === "weather") {
			return (
				<WeatherCard
					city={city}
					setCity={setCity}
					realtime={weather}
					forecast={forecast}
					compact
				/>
			);
		}
		if (cardId === "market") {
			return <MarketStrip gold={gold} fuel={fuel} exchange={exchange} city={city} />;
		}
		if (cardId === "entertainmentTools") {
			return (
				<div className="home-right-split">
					<EntertainmentCard epic={epic} movies={movieItems} />
					<ToolShortcuts
						apiBase={apiBase}
						setActivePage={setActivePage}
						setActiveTool={setActiveTool}
					/>
				</div>
			);
		}
		return <QuoteCard data={hitokoto} />;
	};

	return (
		<section className="home-layout">
			<div className="home-left">
				{getHomeCards("left", settings, homeCardLayout).map((card) => (
					<div className="home-card-slot" key={card.id}>
						{renderHomeCard(card.id)}
					</div>
				))}
			</div>
			<div className="home-right">
				{getHomeCards("right", settings, homeCardLayout).map((card) => (
					<div className="home-card-slot" key={card.id}>
						{renderHomeCard(card.id)}
					</div>
				))}
			</div>
		</section>
	);
}
