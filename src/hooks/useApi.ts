import { useCallback, useEffect, useMemo, useState } from "react";
import {
	fetchApi,
	getApiBaseError,
	tryBuildUrl,
	unwrap,
} from "../api";
import { CACHE_TTL } from "../config";
import { readCache, writeCache } from "../storage";
import type { ApiState } from "../types";

export function useApi<T>(
	base: string,
	path: string,
	params: Record<string, string | undefined>,
	enabled = true,
	autoRefresh = true,
) {
	const paramsKey = JSON.stringify(params);
	const stableParams = useMemo(
		() => JSON.parse(paramsKey) as Record<string, string | undefined>,
		[paramsKey],
	);
	const requestUrl = useMemo(
		() => tryBuildUrl(base, path, stableParams),
		[base, path, stableParams],
	);
	const cacheKey = useMemo(
		() => (requestUrl ? `60s-web:cache:${requestUrl}` : ""),
		[requestUrl],
	);
	const [state, setState] = useState<ApiState<T>>(() => {
		if (!enabled || typeof window === "undefined") return { loading: enabled };
		if (!requestUrl) {
			return {
				loading: false,
				error: getApiBaseError(base) || "API 地址无效",
			};
		}
		const cached = readCache<T>(cacheKey);
		if (!cached) return { loading: true };
		return {
			data: cached.data,
			loading: false,
			updatedAt: new Date(cached.updatedAt),
		};
	});

	const load = useCallback(
		async (force = false) => {
			if (!enabled) return;
			if (!requestUrl) {
				setState({
					loading: false,
					error: getApiBaseError(base) || "API 地址无效",
				});
				return;
			}
			if (!force) {
				const cached = readCache<T>(cacheKey);
				if (cached) {
					setState({
						data: cached.data,
						loading: false,
						error: undefined,
						updatedAt: new Date(cached.updatedAt),
					});
					return;
				}
			}

			setState((current) => ({ ...current, loading: true, error: undefined }));
			try {
				const payload = await fetchApi<T>(base, path, stableParams);
				const data = unwrap(payload);
				const updatedAt = Date.now();
				writeCache(cacheKey, data, updatedAt);
				setState({
					data,
					loading: false,
					updatedAt: new Date(updatedAt),
				});
			} catch (error) {
				setState((current) => ({
					...current,
					loading: false,
					error: error instanceof Error ? error.message : "请求失败",
				}));
			}
		},
		[base, cacheKey, enabled, path, requestUrl, stableParams],
	);

	useEffect(() => {
		if (!enabled) return;
		void load(false);
	}, [enabled, load]);

	useEffect(() => {
		if (!enabled || !autoRefresh) return;
		const timer = window.setInterval(() => void load(true), CACHE_TTL);
		return () => window.clearInterval(timer);
	}, [autoRefresh, enabled, load]);

	const reload = useCallback(() => load(true), [load]);

	return { ...state, reload };
}
