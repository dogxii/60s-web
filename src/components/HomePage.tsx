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
import { Check, PencilLine } from "lucide-react";
import {
	getHomeCards,
	moveHomeCard,
	type HomeCardColumn,
	type HomeCardId,
	type HomeCardLayout,
} from "../cards";
import { hotTabs } from "../config";
import type { ApiState, PageId, SettingsState, ToolId } from "../types";
import {
	useState,
	type MouseEvent as ReactMouseEvent,
	type PointerEvent,
} from "react";
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
	setHomeCardLayout: (layout: HomeCardLayout) => void;
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
	setHomeCardLayout,
	setActivePage,
	setActiveTool,
	setSettings,
	reloadAll,
}: HomePageProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [draggedCard, setDraggedCard] = useState<{
		cardId: HomeCardId;
		column: HomeCardColumn;
	} | null>(null);
	const [dropTarget, setDropTarget] = useState<{
		column: HomeCardColumn;
		index: number;
	} | null>(null);
	const [pointerDrag, setPointerDrag] = useState<{
		cardId: HomeCardId;
		column: HomeCardColumn;
		pointerId: number;
		startX: number;
		startY: number;
		active: boolean;
	} | null>(null);

	const resetDragState = () => {
		setDraggedCard(null);
		setDropTarget(null);
		setPointerDrag(null);
	};

	const readHomeColumn = (value?: string): HomeCardColumn | null => {
		if (value === "left" || value === "right") return value;
		return null;
	};

	const getDropTargetFromPoint = (clientX: number, clientY: number) => {
		const element = document.elementFromPoint(clientX, clientY);
		const slot = element?.closest<HTMLElement>("[data-home-card-id]");
		const slotColumn = readHomeColumn(slot?.dataset.homeCardColumn);
		const slotCardId = slot?.dataset.homeCardId as HomeCardId | undefined;
		if (slotColumn && slotCardId) {
			const index = homeCardLayout[slotColumn].indexOf(slotCardId);
			if (index >= 0) return { column: slotColumn, index };
		}

		const columnElement = element?.closest<HTMLElement>("[data-home-column]");
		const column = readHomeColumn(columnElement?.dataset.homeColumn);
		if (!column) return null;
		return { column, index: homeCardLayout[column].length };
	};

	const isInteractiveDragTarget = (target: HTMLElement) =>
		Boolean(target.closest("a, button, input, textarea, select, label"));

	const handlePointerDown = (
		event: PointerEvent<HTMLDivElement>,
		cardId: HomeCardId,
		column: HomeCardColumn,
	) => {
		if (!isEditing) return;
		const target = event.target as HTMLElement;
		if (
			event.pointerType === "mouse" ||
			isInteractiveDragTarget(target)
		) {
			return;
		}
		event.currentTarget.setPointerCapture(event.pointerId);
		setPointerDrag({
			cardId,
			column,
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			active: false,
		});
	};

	const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
		if (!pointerDrag || event.pointerId !== pointerDrag.pointerId) return;
		const distance = Math.hypot(
			event.clientX - pointerDrag.startX,
			event.clientY - pointerDrag.startY,
		);
		if (!pointerDrag.active && distance < 8) return;
		event.preventDefault();
		if (!pointerDrag.active) {
			setDraggedCard({
				cardId: pointerDrag.cardId,
				column: pointerDrag.column,
			});
			setPointerDrag({ ...pointerDrag, active: true });
		}
		const nextTarget = getDropTargetFromPoint(event.clientX, event.clientY);
		if (nextTarget) setDropTarget(nextTarget);
	};

	const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
		if (!pointerDrag || event.pointerId !== pointerDrag.pointerId) return;
		if (pointerDrag.active) {
			const nextTarget =
				getDropTargetFromPoint(event.clientX, event.clientY) || dropTarget;
			if (nextTarget) {
				setHomeCardLayout(
					moveHomeCard(
						homeCardLayout,
						pointerDrag.cardId,
						nextTarget.column,
						nextTarget.index,
					),
				);
			}
		}
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
		resetDragState();
	};

	const handleMouseDown = (
		event: ReactMouseEvent<HTMLDivElement>,
		cardId: HomeCardId,
		column: HomeCardColumn,
	) => {
		if (!isEditing) return;
		const target = event.target as HTMLElement;
		if (event.button !== 0 || isInteractiveDragTarget(target)) return;
		const startX = event.clientX;
		const startY = event.clientY;
		let isActive = false;
		let latestTarget: { column: HomeCardColumn; index: number } | null = null;

		const handleMouseMove = (moveEvent: MouseEvent) => {
			const distance = Math.hypot(
				moveEvent.clientX - startX,
				moveEvent.clientY - startY,
			);
			if (!isActive && distance < 8) return;
			moveEvent.preventDefault();
			if (!isActive) {
				isActive = true;
				setDraggedCard({ cardId, column });
			}
			latestTarget = getDropTargetFromPoint(
				moveEvent.clientX,
				moveEvent.clientY,
			);
			if (latestTarget) setDropTarget(latestTarget);
		};

		const handleMouseUp = (upEvent: MouseEvent) => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
			if (isActive) {
				const nextTarget =
					getDropTargetFromPoint(upEvent.clientX, upEvent.clientY) ||
					latestTarget;
				if (nextTarget) {
					setHomeCardLayout(
						moveHomeCard(
							homeCardLayout,
							cardId,
							nextTarget.column,
							nextTarget.index,
						),
					);
				}
			}
			resetDragState();
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
	};

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

	const renderColumn = (
		column: HomeCardColumn,
		className: "home-left" | "home-right",
		label: string,
	) => {
		const cards = getHomeCards(column, settings, homeCardLayout);
		const endIndex = homeCardLayout[column].length;
		return (
			<div
				className={`${className} home-drop-column ${
					isEditing ? "is-editing" : ""
				} ${draggedCard ? "is-reordering" : ""}`}
				aria-label={label}
				data-home-column={column}
			>
				{cards.map((card) => {
					const index = homeCardLayout[column].indexOf(card.id);
					const isDragging = draggedCard?.cardId === card.id;
					const isDropTarget =
						dropTarget?.column === column && dropTarget.index === index;
					return (
						<div
							className={`home-card-slot ${isDragging ? "is-dragging" : ""} ${
								isDropTarget ? "is-drop-target" : ""
							} ${isEditing ? "is-editable" : ""}`}
							key={card.id}
							aria-grabbed={isDragging}
							data-home-card-id={card.id}
							data-home-card-column={column}
							onPointerDown={(event) =>
								handlePointerDown(event, card.id, column)
							}
							onPointerMove={handlePointerMove}
							onPointerUp={handlePointerEnd}
							onPointerCancel={handlePointerEnd}
							onMouseDown={(event) =>
								handleMouseDown(event, card.id, column)
							}
						>
							{renderHomeCard(card.id)}
						</div>
					);
				})}
				<div
					className={`home-drop-zone ${
						dropTarget?.column === column && dropTarget.index === endIndex
							? "is-drop-target"
							: ""
					}`}
					data-home-column={column}
					aria-label={`放到${label}末尾`}
				/>
			</div>
		);
	};

	return (
		<section className={`home-layout ${isEditing ? "is-editing" : ""}`}>
			<div className="home-editbar">
				<button
					type="button"
					className={isEditing ? "active" : ""}
					onClick={() => {
						if (isEditing) resetDragState();
						setIsEditing(!isEditing);
					}}
				>
					{isEditing ? <Check size={15} /> : <PencilLine size={15} />}
					{isEditing ? "完成" : "编辑"}
				</button>
			</div>
			{renderColumn("left", "home-left", "主阅读栏")}
			{renderColumn("right", "home-right", "辅助信息栏")}
		</section>
	);
}
