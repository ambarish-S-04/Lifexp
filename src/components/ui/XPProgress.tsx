import { motion } from 'framer-motion';
import './XPProgress.css';

interface XPProgressProps {
    currentXP: number;
    requiredXP: number;
    level: number;
    totalXP: number;
}

export function XPProgress({ currentXP, requiredXP, level, totalXP }: XPProgressProps) {
    const progress = Math.min((currentXP / requiredXP) * 100, 100);

    return (
        <div className="xp-progress-container">
            <div className="xp-header">
                <div className="level-badge-wrapper">
                    <motion.div
                        className="level-badge"
                        whileHover={{ scale: 1.05 }}
                        animate={{
                            boxShadow: [
                                '0 0 20px rgba(139, 92, 246, 0.3)',
                                '0 0 40px rgba(139, 92, 246, 0.5)',
                                '0 0 20px rgba(139, 92, 246, 0.3)',
                            ]
                        }}
                        transition={{
                            boxShadow: {
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }
                        }}
                    >
                        <span className="level-number">{level}</span>
                        <span className="level-label">LEVEL</span>
                    </motion.div>
                </div>

                <div className="xp-info">
                    <div className="progress-label">
                        <span>Progress to Level {level + 1}</span>
                        <span className="xp-hint">({requiredXP} XP needed)</span>
                    </div>
                    <div className="progress-value">
                        {currentXP} / {requiredXP} XP
                    </div>
                </div>
            </div>

            <div className="progress-bar-wrapper">
                <div className="progress-bar-bg">
                    <motion.div
                        className="progress-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <div className="progress-shimmer" />
                    </motion.div>
                </div>
                <div className="progress-glow" style={{ width: `${progress}%` }} />
            </div>

            <div className="total-xp-display">
                Total Lifetime XP: <span className="total-xp-value">{totalXP.toLocaleString()}</span>
            </div>
        </div>
    );
}
