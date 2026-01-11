import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './ActivityCalendar.css';

interface DayData {
    date: string;
    xp: number;
}

interface ActivityCalendarProps {
    data?: DayData[];
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ActivityCalendar({ data = [] }: ActivityCalendarProps) {
    const { mode } = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const calendarData = useMemo(() => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfWeek = new Date(year, month, 1).getDay();
        const today = new Date().toISOString().split('T')[0];

        const days: { date: string; day: number; xp: number; isToday: boolean; isEmpty: boolean }[] = [];

        // Empty slots before first day
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push({ date: '', day: 0, xp: 0, isToday: false, isEmpty: true });
        }

        // Days of month
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayData = data.find(dd => dd.date === dateStr);
            // Use actual XP from history, or 0 if no data (fresh user gets empty calendar)
            const xp = dayData?.xp ?? 0;

            days.push({
                date: dateStr,
                day: d,
                xp,
                isToday: dateStr === today,
                isEmpty: false,
            });
        }

        return days;
    }, [year, month, data]);

    const getXPClass = (xp: number) => {
        if (xp < 0) return 'xp-negative';
        if (xp >= 100) return 'xp-high';
        if (xp >= 50) return 'xp-medium';
        if (xp > 0) return 'xp-low';
        return '';
    };

    const navigateMonth = (direction: number) => {
        setCurrentDate(new Date(year, month + direction, 1));
    };

    return (
        <div className={`calendar-section ${mode}`}>
            <div className="calendar-header">
                <h3 className="calendar-title">
                    <span className="calendar-icon">📅</span>
                    Monthly Activity
                </h3>
                <div className="calendar-nav">
                    <motion.button
                        className="nav-btn"
                        onClick={() => navigateMonth(-1)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ChevronLeft size={18} />
                    </motion.button>
                    <span className="month-label">{MONTHS[month]} {year}</span>
                    <motion.button
                        className="nav-btn"
                        onClick={() => navigateMonth(1)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ChevronRight size={18} />
                    </motion.button>
                </div>
            </div>

            {/* Day labels */}
            <div className="calendar-weekdays">
                {DAYS.map(day => (
                    <span key={day} className="weekday">{day}</span>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="calendar-grid">
                {calendarData.map((day, index) => (
                    <motion.div
                        key={index}
                        className={`calendar-day ${day.isEmpty ? 'empty' : ''} ${day.isToday ? 'today' : ''} ${getXPClass(day.xp)}`}
                        initial={!day.isEmpty ? { scale: 0, opacity: 0 } : false}
                        animate={!day.isEmpty ? { scale: 1, opacity: 1 } : {}}
                        transition={{ delay: index * 0.01, type: "spring", stiffness: 300, damping: 25 }}
                        whileHover={!day.isEmpty ? { scale: 1.1, zIndex: 5 } : {}}
                    >
                        {!day.isEmpty && (
                            <>
                                <span className="day-number">{day.day}</span>
                                {day.xp !== 0 && (
                                    <span className={`day-xp ${day.xp >= 0 ? 'positive' : 'negative'}`}>
                                        {day.xp >= 0 ? '+' : ''}{day.xp}
                                    </span>
                                )}
                            </>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Legend */}
            <div className="calendar-legend">
                <div className="legend-item">
                    <span className="legend-dot xp-low"></span>
                    <span>&lt;50 XP</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot xp-medium"></span>
                    <span>50-99 XP</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot xp-high"></span>
                    <span>100+ XP</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot xp-negative"></span>
                    <span>Negative</span>
                </div>
            </div>
        </div>
    );
}
