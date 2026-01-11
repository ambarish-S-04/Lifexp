import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import './AnimatedBackground.css';

export function AnimatedBackground() {
    const { mode, colorTheme } = useTheme();

    // More varied orb configurations for different themes
    const orbConfigs = [
        { className: 'orb-1', delay: 0, duration: 25 },
        { className: 'orb-2', delay: 2, duration: 28 },
        { className: 'orb-3', delay: 4, duration: 22 },
        { className: 'orb-4', delay: 6, duration: 30 },
        { className: 'orb-5', delay: 8, duration: 26 },
        { className: 'orb-6', delay: 1, duration: 24 },
    ];

    return (
        <div className={`animated-background ${mode} theme-${colorTheme}`} data-theme={mode}>
            {/* Multiple floating gradient orbs */}
            {orbConfigs.map((orb, i) => (
                <motion.div
                    key={i}
                    className={`orb ${orb.className}`}
                    animate={{
                        x: [0, 40, -30, 20, 0],
                        y: [0, -30, 20, -40, 0],
                        scale: [1, 1.1, 0.95, 1.05, 1],
                    }}
                    transition={{
                        duration: orb.duration,
                        delay: orb.delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}

            {/* Floating particles */}
            <div className="particles">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="particle" style={{
                        left: `${i * 10 + 5}%`,
                        animationDelay: `${i * 1.5}s`,
                        animationDuration: `${12 + i * 2}s`
                    }} />
                ))}
            </div>

            {/* Noise texture */}
            <div className="noise-overlay" />

            {/* Gradient mesh overlay */}
            <div className="gradient-mesh" />
        </div>
    );
}
