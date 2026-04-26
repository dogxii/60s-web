import {
	Moon,
	RotateCcw,
	Save,
	Sun,
	Upload,
	UserRound,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { nav } from "../config";
import type { AvatarState, ColorTheme, PageId } from "../types";
import { getAvatarSrc, getQqAvatarUrl } from "../utils";

export function Header({
	activePage,
	setActivePage,
	avatar,
	setAvatar,
	colorTheme,
	setColorTheme,
}: {
	activePage: PageId;
	setActivePage: (page: PageId) => void;
	avatar: AvatarState;
	setAvatar: (avatar: AvatarState) => void;
	colorTheme: ColorTheme;
	setColorTheme: (theme: ColorTheme) => void;
}) {
	const [avatarOpen, setAvatarOpen] = useState(false);
	const [qqInput, setQqInput] = useState(avatar.qq || "");
	const [avatarNotice, setAvatarNotice] = useState("");
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const avatarWrapRef = useRef<HTMLDivElement | null>(null);
	const avatarSrc = getAvatarSrc(avatar);

	const handleAvatarFile = (file?: File) => {
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			setAvatarNotice("请选择图片文件");
			return;
		}
		if (file.size > 1.5 * 1024 * 1024) {
			setAvatarNotice("图片请控制在 1.5MB 内，避免本地缓存过大");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result !== "string") return;
			setAvatar({
				mode: "upload",
				src: reader.result,
				updatedAt: Date.now(),
			});
			setAvatarNotice("");
			setAvatarOpen(false);
		};
		reader.readAsDataURL(file);
	};

	const saveQqAvatar = () => {
		const qq = qqInput.trim();
		if (!/^\d{5,12}$/.test(qq)) {
			setAvatarNotice("请输入 5-12 位 QQ 号");
			return;
		}
		setAvatar({
			mode: "qq",
			qq,
			src: getQqAvatarUrl(qq),
			updatedAt: Date.now(),
		});
		setAvatarNotice("");
		setAvatarOpen(false);
	};

	useEffect(() => {
		setQqInput(avatar.qq || "");
	}, [avatar.qq]);

	useEffect(() => {
		if (!avatarOpen) return;
		const onPointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (
				target instanceof Node &&
				avatarWrapRef.current &&
				!avatarWrapRef.current.contains(target)
			) {
				setAvatarOpen(false);
			}
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setAvatarOpen(false);
		};
		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [avatarOpen]);

	return (
		<header className="topbar">
			<button
				className="brand"
				onClick={() => setActivePage("home")}
				aria-label="60s 信息聚合首页"
			>
				<img src="/favicon.png" alt="60s logo" width={24} height={24} />
				<strong>60s 信息聚合</strong>
			</button>
			<nav>
				{nav.map((item) => {
					const Icon = item.icon;
					return (
						<button
							key={item.id}
							className={activePage === item.id ? "active" : ""}
							onClick={() => setActivePage(item.id)}
						>
							<Icon size={19} />
							<span className="nav-label">{item.label}</span>
						</button>
					);
				})}
			</nav>
			<div className="header-actions">
				<button
					className="theme-toggle"
					type="button"
					aria-label={
						colorTheme === "dark" ? "切换到浅色主题" : "切换到暗色主题"
					}
					onClick={() =>
						setColorTheme(colorTheme === "dark" ? "light" : "dark")
					}
				>
					{colorTheme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
				</button>
				<div className="avatar-wrap" ref={avatarWrapRef}>
					<button
						className="avatar"
						type="button"
						aria-label="自定义头像"
						onClick={() => {
							setAvatarNotice("");
							setAvatarOpen((open) => !open);
						}}
					>
						<img src={avatarSrc} alt="" />
					</button>
					{avatarOpen && (
						<div className="avatar-popover">
							<div className="avatar-popover-head">
								<span>
									<UserRound size={18} /> 自定义头像
								</span>
								<button
									type="button"
									aria-label="关闭头像设置"
									onClick={() => setAvatarOpen(false)}
								>
									<X size={16} />
								</button>
							</div>
							<div className="avatar-preview">
								<img src={avatarSrc} alt="" />
								<small>
									{avatar.mode === "qq"
										? `QQ ${avatar.qq}`
										: avatar.mode === "upload"
											? "本地头像"
											: "默认头像"}
								</small>
							</div>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								hidden
								onChange={(event) => handleAvatarFile(event.target.files?.[0])}
							/>
							<button
								className="avatar-action"
								type="button"
								onClick={() => fileInputRef.current?.click()}
							>
								<Upload size={16} /> 上传本地图片
							</button>
							<label className="qq-avatar-field">
								<span>QQ 头像缓存</span>
								<div>
									<input
										value={qqInput}
										onChange={(event) => setQqInput(event.target.value)}
										placeholder="输入 QQ 号"
										inputMode="numeric"
									/>
									<button type="button" onClick={saveQqAvatar}>
										<Save size={15} /> 保存
									</button>
								</div>
							</label>
							{avatarNotice && (
								<p className="avatar-notice" role="status">
									{avatarNotice}
								</p>
							)}
							<button
								className="avatar-action subtle"
								type="button"
								onClick={() => {
									setAvatar({ mode: "default" });
									setAvatarNotice("");
									setAvatarOpen(false);
								}}
							>
								<RotateCcw size={16} /> 恢复默认
							</button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
