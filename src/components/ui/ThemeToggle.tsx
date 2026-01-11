import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { useState } from 'react';
import { useTheme, COLOR_THEMES } from '../../context/ThemeContext';
import type { ColorTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

export function ThemeToggle() {
    const { mode, toggleMode, colorTheme, setColorTheme } = useTheme();
    const [showPalette, setShowPalette] = useState(false);
    const isDark = mode === 'dark';

    return (
        <div className="theme-toggle-container">
            {/* Mode Toggle (Sun/Moon) */}
            <motion.button
                className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
                onClick={toggleMode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
                <div className="toggle-track">
                    <motion.div
                        className="toggle-stars"
                        initial={false}
                        animate={{ opacity: isDark ? 1 : 0 }}
                    >
                        <span className="star">✦</span>
                        <span className="star">✧</span>
                        <span className="star">✦</span>
                    </motion.div>

                    <motion.div
                        className="toggle-clouds"
                        initial={false}
                        animate={{ opacity: isDark ? 0 : 1 }}
                    >
                        <div className="cloud cloud-1" />
                        <div className="cloud cloud-2" />
                    </motion.div>

                    <motion.div
                        className="toggle-handle"
                        initial={false}
                        animate={{
                            x: isDark ? 0 : 28,
                            rotate: isDark ? 0 : 360,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                        }}
                    >
                        <motion.div
                            className="handle-icon sun"
                            initial={false}
                            animate={{ scale: isDark ? 0 : 1 }}
                        >
                            <Sun size={16} />
                        </motion.div>
                        <motion.div
                            className="handle-icon moon"
                            initial={false}
                            animate={{ scale: isDark ? 1 : 0 }}
                        >
                            <Moon size={14} />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.button>

            {/* Color Theme Picker */}
            <motion.button
                className="palette-btn"
                onClick={() => setShowPalette(!showPalette)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Palette size={18} />
            </motion.button>

            {/* Theme Palette Dropdown */}
            <AnimatePresence>
                {showPalette && (
                    <motion.div
                        className="theme-palette"
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="palette-header">
                            <span>Choose Theme</span>
                        </div>
                        <div className="theme-options">
                            {(Object.keys(COLOR_THEMES) as ColorTheme[]).map((themeKey) => {
                                const theme = COLOR_THEMES[themeKey];
                                const isActive = colorTheme === themeKey;

                                return (
                                    <motion.button
                                        key={themeKey}
                                        className={`theme-option ${isActive ? 'active' : ''}`}
                                        onClick={() => {
                                            setColorTheme(themeKey);
                                            setShowPalette(false);
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="theme-preview">
                                            <div
                                                className="preview-swatch dark"
                                                style={{ background: theme.dark.accent }}
                                            />
                                            <div
                                                className="preview-swatch light"
                                                style={{ background: theme.light.accent }}
                                            />
                                        </div>
                                        <span className="theme-name">
                                            <span className="theme-emoji">{theme.emoji}</span>
                                            {theme.name}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                className="check-icon"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <Check size={14} />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop to close palette */}
            {showPalette && (
                <div
                    className="palette-backdrop"
                    onClick={() => setShowPalette(false)}
                />
            )}
        </div>
    );
}
