import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import './GlassCard.css';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    variant?: 'default' | 'hover' | 'glow';
    className?: string;
    accentColor?: 'purple' | 'blue' | 'red' | 'green' | 'gold';
}

export function GlassCard({
    children,
    variant = 'hover',
    className = '',
    accentColor,
    ...props
}: GlassCardProps) {
    const variants = {
        default: {},
        hover: {
            initial: { y: 0 },
            whileHover: {
                y: -4,
                transition: { duration: 0.2 }
            },
        },
        glow: {
            initial: { boxShadow: '0 0 0 rgba(139, 92, 246, 0)' },
            whileHover: {
                y: -4,
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)',
                transition: { duration: 0.2 }
            },
        },
    };

    const accentClass = accentColor ? `accent-${accentColor}` : '';

    return (
        <motion.div
            className={`glass-card ${variant} ${accentClass} ${className}`}
            {...variants[variant]}
            {...props}
        >
            {accentColor && <div className="accent-bar" />}
            <div className="glass-card-content">
                {children}
            </div>
        </motion.div>
    );
}
