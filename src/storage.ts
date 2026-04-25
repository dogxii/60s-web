import { CACHE_TTL } from "./config";

export function readStoredValue(key: string, fallback: string) {
	if (typeof window === "undefined") return fallback;
	return window.localStorage.getItem(key) || fallback;
}

export function writeStoredValue(key: string, value: string) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(key, value);
}

export function readStoredJson<T>(key: string, fallback: T): T {
	if (typeof window === "undefined") return fallback;
	try {
		const raw = window.localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
}

export function writeStoredJson<T>(key: string, value: T) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(key, JSON.stringify(value));
}

export function readCache<T>(key: string): { data: T; updatedAt: number } | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as { data: T; updatedAt: number };
		if (!parsed?.updatedAt || Date.now() - parsed.updatedAt > CACHE_TTL) {
			window.localStorage.removeItem(key);
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

export function writeCache<T>(key: string, data: T | undefined, updatedAt: number) {
	if (typeof window === "undefined" || data === undefined) return;
	window.localStorage.setItem(key, JSON.stringify({ data, updatedAt }));
}
