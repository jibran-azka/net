import { useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = 'light';
export type UseAppearanceReturn = { readonly appearance: Appearance; readonly resolvedAppearance: ResolvedAppearance; readonly updateAppearance: (mode: Appearance) => void };

const subscribe = () => () => undefined;
const applyLightTheme = (): void => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    localStorage.setItem('appearance', 'light');
    document.cookie = 'appearance=light;path=/;max-age=31536000;SameSite=Lax';
};
export function initializeTheme(): void { applyLightTheme(); }
export function useAppearance(): UseAppearanceReturn {
    useSyncExternalStore(subscribe, () => 'light', () => 'light');
    return { appearance: 'light', resolvedAppearance: 'light', updateAppearance: applyLightTheme };
}
