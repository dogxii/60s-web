import { nav } from "../config";
import type { PageId } from "../types";

const mobilePages: PageId[] = ["home", "hot", "news", "weather", "tools"];

export function MobileBottomNav({
	activePage,
	setActivePage,
}: {
	activePage: PageId;
	setActivePage: (page: PageId) => void;
}) {
	return (
		<nav className="mobile-bottom-nav" aria-label="移动端主导航">
			{nav
				.filter((item) => mobilePages.includes(item.id))
				.map((item) => {
					const Icon = item.icon;
					const active = activePage === item.id;
					const handleClick = () => {
						setActivePage(item.id);
						window.requestAnimationFrame(() => {
							window.scrollTo({
								top: 0,
								behavior: active ? "smooth" : "auto",
							});
						});
					};
					return (
						<button
							key={item.id}
							type="button"
							className={active ? "active" : ""}
							aria-current={active ? "page" : undefined}
							onClick={handleClick}
						>
							<Icon size={21} />
							<span>{item.label}</span>
						</button>
					);
				})}
		</nav>
	);
}
