import {
	Download,
	RefreshCw,
	WifiOff,
	X,
} from "lucide-react";

export function PwaStatusBar({
	isOffline,
	updateReady,
	showInstallHint,
	onApplyUpdate,
	onDismissInstallHint,
}: {
	isOffline: boolean;
	updateReady: boolean;
	showInstallHint: boolean;
	onApplyUpdate: () => void;
	onDismissInstallHint: () => void;
}) {
	if (!isOffline && !updateReady && !showInstallHint) return null;

	return (
		<div className="pwa-status-stack" aria-live="polite">
			{updateReady && (
				<div className="pwa-status-strip update" role="status">
					<span>
						<RefreshCw size={17} />
						<b>发现新版本</b>
						<small>刷新后即可使用最新内容</small>
					</span>
					<button type="button" onClick={onApplyUpdate}>
						刷新
					</button>
				</div>
			)}
			{isOffline && (
				<div className="pwa-status-strip offline" role="status">
					<span>
						<WifiOff size={17} />
						<b>离线模式</b>
						<small>页面壳可继续打开，实时数据会在联网后恢复</small>
					</span>
				</div>
			)}
			{showInstallHint && (
				<div className="pwa-status-strip install" role="status">
					<span>
						<Download size={17} />
						<b>添加到主屏幕</b>
						<small>在 Safari 中点分享，再选择添加到主屏幕</small>
					</span>
					<button
						type="button"
						className="icon-only"
						aria-label="关闭安装提示"
						onClick={onDismissInstallHint}
					>
						<X size={16} />
					</button>
				</div>
			)}
		</div>
	);
}
