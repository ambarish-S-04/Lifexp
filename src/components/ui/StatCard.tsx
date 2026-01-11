import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import './StatCard.css';

interface StatCardProps {
    icon: ReactNode;
    label: string;
    value: string | number;
    suffix?: string;
    variant?: 'default' | 'xp' | 'streak';
    className?: string;
}

export function StatCard({
    icon,
    label,
    value,
    suffix,
    variant = 'default',
    className = ''
}: StatCardProps) {
    return (
        <motion.div
            className={`stat-card ${variant} ${className}`}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
            <div className="stat-card-glow" />
            <div className="stat-icon-wrapper">
                <motion.div
                    className={`stat-icon ${variant}`}
                    animate={variant === 'streak' ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                    } : variant === 'xp' ? {
                        scale: [1, 1.05, 1],
                    } : {}}
                    transition={{
                        duration: variant === 'streak' ? 0.8 : 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {icon}
                </motion.div>
            </div>
            <div className="stat-content">
                <span className="stat-label">{label}</span>
                <div className="stat-value-wrapper">
                    <span className={`stat-value ${variant}`}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </span>
                    {suffix && <span className="stat-suffix">{suffix}</span>}
                </div>
            </div>
        </motion.div>
    );
}
