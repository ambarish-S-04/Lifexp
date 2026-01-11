import { motion } from 'framer-motion';
import { LayoutDashboard, CheckSquare, BarChart3, Settings } from 'lucide-react';
import './BottomNav.css';

type TabName = 'dashboard' | 'tasks' | 'stats' | 'settings';

interface BottomNavProps {
    activeTab: TabName;
    onTabChange: (tab: TabName) => void;
}

const tabs = [
    { id: 'dashboard' as TabName, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks' as TabName, label: 'Tasks', icon: CheckSquare },
    { id: 'stats' as TabName, label: 'Stats', icon: BarChart3 },
    { id: 'settings' as TabName, label: 'Settings', icon: Settings },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    return (
        <nav className="bottom-nav">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <motion.button
                        key={tab.id}
                        className={`nav-tab ${isActive ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ y: -2 }}
                    >
                        {isActive && (
                            <motion.div
                                className="active-bg"
                                layoutId="activeTab"
                                initial={false}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                }}
                            />
                        )}
                        <motion.div
                            className="nav-icon-wrapper"
                            animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                        >
                            <Icon
                                size={22}
                                className={`nav-icon ${isActive ? 'active' : ''}`}
                            />
                            {isActive && <div className="icon-glow" />}
                        </motion.div>
                        <span className={`nav-label ${isActive ? 'active' : ''}`}>
                            {tab.label}
                        </span>
                    </motion.button>
                );
            })}
        </nav>
    );
}
