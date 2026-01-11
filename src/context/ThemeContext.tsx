import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Color theme definitions
export type ColorTheme = 'ocean' | 'forest' | 'sunset' | 'lavender' | 'rose';
export type Mode = 'dark' | 'light';

export interface ThemeConfig {
    colorTheme: ColorTheme;
    mode: Mode;
}

// Theme colors for each color theme
export const COLOR_THEMES: Record<ColorTheme, {
    name: string;
    emoji: string;
    dark: { primary: string; secondary: string; accent: string };
    light: { primary: string; secondary: string; accent: string };
}> = {
    ocean: {
        name: 'Ocean',
        emoji: '🌊',
        dark: { primary: '#0c4a6e', secondary: '#0369a1', accent: '#38bdf8' },
        light: { primary: '#e0f2fe', secondary: '#bae6fd', accent: '#0284c7' },
    },
    forest: {
        name: 'Forest',
        emoji: '🌲',
        dark: { primary: '#14532d', secondary: '#166534', accent: '#4ade80' },
        light: { primary: '#dcfce7', secondary: '#bbf7d0', accent: '#16a34a' },
    },
    sunset: {
        name: 'Sunset',
        emoji: '🌅',
        dark: { primary: '#7c2d12', secondary: '#9a3412', accent: '#fb923c' },
        light: { primary: '#fff7ed', secondary: '#fed7aa', accent: '#ea580c' },
    },
    lavender: {
        name: 'Lavender',
        emoji: '💜',
        dark: { primary: '#4c1d95', secondary: '#5b21b6', accent: '#a78bfa' },
        light: { primary: '#f5f3ff', secondary: '#e9d5ff', accent: '#7c3aed' },
    },
    rose: {
        name: 'Rose',
        emoji: '🌹',
        dark: { primary: '#881337', secondary: '#9f1239', accent: '#fb7185' },
        light: { primary: '#fff1f2', secondary: '#ffe4e6', accent: '#e11d48' },
    },
};

interface ThemeContextType {
    colorTheme: ColorTheme;
    mode: Mode;
    setColorTheme: (theme: ColorTheme) => void;
    setMode: (mode: Mode) => void;
    toggleMode: () => void;
    themeConfig: typeof COLOR_THEMES[ColorTheme];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('lifexp-color-theme') as ColorTheme;
            if (saved && COLOR_THEMES[saved]) return saved;
        }
        return 'ocean';
    });

    const [mode, setModeState] = useState<Mode>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('lifexp-mode') as Mode;
            if (saved) return saved;
            return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', mode);
        root.setAttribute('data-color-theme', colorTheme);
        localStorage.setItem('lifexp-mode', mode);
        localStorage.setItem('lifexp-color-theme', colorTheme);

        // Apply CSS variables for the current theme
        const theme = COLOR_THEMES[colorTheme];
        const colors = mode === 'dark' ? theme.dark : theme.light;

        root.style.setProperty('--theme-primary', colors.primary);
        root.style.setProperty('--theme-secondary', colors.secondary);
        root.style.setProperty('--theme-accent', colors.accent);
    }, [colorTheme, mode]);

    const toggleMode = () => {
        setModeState(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const setColorTheme = (theme: ColorTheme) => {
        setColorThemeState(theme);
    };

    const setMode = (newMode: Mode) => {
        setModeState(newMode);
    };

    return (
        <ThemeContext.Provider value={{
            colorTheme,
            mode,
            setColorTheme,
            setMode,
            toggleMode,
            themeConfig: COLOR_THEMES[colorTheme],
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}

// Helper to get theme class string
export function getThemeClass(colorTheme: ColorTheme, mode: Mode): string {
    return `theme-${colorTheme} ${mode}`;
}
