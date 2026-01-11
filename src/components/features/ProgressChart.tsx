import { motion } from 'framer-motion';
import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './ProgressChart.css';

interface DayData {
    date: string;
    xp: number;
}

interface ProgressChartProps {
    data?: DayData[];
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function ProgressChart({ data = [] }: ProgressChartProps) {
    const { mode } = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'bar' | 'line'>('bar');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const chartData = useMemo(() => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date().toISOString().split('T')[0];

        const days: { day: number; date: string; xp: number; isToday: boolean }[] = [];
        let maxXP = 50;

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayData = data.find(dd => dd.date === dateStr);
            // Use actual XP from history, or 0 if no data (fresh user gets empty chart)
            const xp = dayData?.xp ?? 0;

            days.push({ day: d, date: dateStr, xp, isToday: dateStr === today });
            if (Math.abs(xp) > maxXP) maxXP = Math.abs(xp);
        }

        return { days, maxXP };
    }, [year, month, data]);

    const getBarClass = (xp: number) => {
        if (xp < 0) return 'negative';
        if (xp >= 100) return 'high';
        if (xp >= 50) return 'medium';
        return 'low';
    };

    const navigateMonth = (direction: number) => {
        setCurrentDate(new Date(year, month + direction, 1));
    };

    // Line graph rendering on canvas
    useEffect(() => {
        if (viewMode !== 'line' || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = 400;
        ctx.scale(2, 2);

        const w = rect.width;
        const h = 200;
        const padding = { top: 25, right: 20, bottom: 35, left: 45 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        const { days, maxXP } = chartData;
        const isDark = mode === 'dark';

        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = isDark ? 'rgba(15, 31, 53, 0.8)' : 'rgba(246, 249, 252, 0.8)';
        ctx.fillRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.stroke();
        }

        // Y-axis labels
        ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartH / 4) * i;
            const val = Math.round(maxXP - (maxXP / 4) * i);
            ctx.fillText(String(val), padding.left - 10, y + 4);
        }

        // X-axis labels
        ctx.textAlign = 'center';
        const step = Math.ceil(days.length / 8);
        days.forEach((d, i) => {
            if (i % step === 0 || i === days.length - 1) {
                const x = padding.left + (chartW / (days.length - 1)) * i;
                ctx.fillText(String(d.day), x, h - 12);
            }
        });

        // Line path
        ctx.beginPath();
        ctx.strokeStyle = isDark ? '#a78bfa' : '#7c3aed';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        days.forEach((d, i) => {
            const x = padding.left + (chartW / (days.length - 1)) * i;
            const y = padding.top + chartH - (Math.max(d.xp, 0) / maxXP) * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
        gradient.addColorStop(0, isDark ? 'rgba(167, 139, 250, 0.35)' : 'rgba(124, 58, 237, 0.25)');
        gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');

        ctx.lineTo(padding.left + chartW, h - padding.bottom);
        ctx.lineTo(padding.left, h - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Data points
        days.forEach((d, i) => {
            const x = padding.left + (chartW / (days.length - 1)) * i;
            const y = padding.top + chartH - (Math.max(d.xp, 0) / maxXP) * chartH;

            ctx.beginPath();
            ctx.arc(x, y, d.isToday ? 6 : 4, 0, Math.PI * 2);
            ctx.fillStyle = d.xp >= 100 ? '#10b981' : d.xp >= 50 ? '#f97316' : d.xp < 0 ? '#ef4444' : (isDark ? '#a78bfa' : '#7c3aed');
            ctx.fill();

            if (d.isToday) {
                ctx.strokeStyle = '#fcd34d';
                ctx.lineWidth = 2.5;
                ctx.stroke();
            }
        });

    }, [chartData, viewMode, mode]);

    const totalXP = chartData.days.reduce((sum, d) => sum + Math.max(d.xp, 0), 0);
    const avgXP = Math.round(totalXP / Math.max(chartData.days.filter(d => d.xp > 0).length, 1));

    return (
        <div className={`chart-section ${mode}`}>
            <div className="chart-header">
                <h3 className="chart-title">
                    <span className="chart-icon">📊</span>
                    Progress Graph
                </h3>
                <div className="chart-controls">
                    <div className="view-toggle">
                        <motion.button
                            className={`toggle-btn ${viewMode === 'bar' ? 'active' : ''}`}
                            onClick={() => setViewMode('bar')}
                            whileTap={{ scale: 0.95 }}
                        >
                            <BarChart3 size={16} />
                        </motion.button>
                        <motion.button
                            className={`toggle-btn ${viewMode === 'line' ? 'active' : ''}`}
                            onClick={() => setViewMode('line')}
                            whileTap={{ scale: 0.95 }}
                        >
                            <TrendingUp size={16} />
                        </motion.button>
                    </div>
                    <div className="chart-nav">
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
            </div>

            {/* Stats row */}
            <div className="chart-stats">
                <div className="stat-item">
                    <span className="stat-value">{totalXP}</span>
                    <span className="stat-label">Total XP</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{avgXP}</span>
                    <span className="stat-label">Avg/Active Day</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{chartData.days.filter(d => d.xp > 0).length}</span>
                    <span className="stat-label">Active Days</span>
                </div>
            </div>

            {/* Bar Graph */}
            {viewMode === 'bar' && (
                <div className="bar-graph">
                    <div className="bars-container">
                        {chartData.days.map((day, index) => {
                            const height = Math.max((Math.abs(day.xp) / chartData.maxXP) * 100, 3);
                            return (
                                <motion.div
                                    key={day.date}
                                    className={`bar-wrapper ${day.isToday ? 'today' : ''}`}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ delay: index * 0.02, duration: 0.4, ease: "easeOut" }}
                                >
                                    <div
                                        className={`bar ${getBarClass(day.xp)}`}
                                        title={`Day ${day.day}: ${day.xp} XP`}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                    <div className="bar-labels">
                        {chartData.days.map((day, i) => (
                            [1, 10, 20, chartData.days.length].includes(day.day)
                                ? <span key={i} className="bar-label">{day.day}</span>
                                : <span key={i} className="bar-label"></span>
                        ))}
                    </div>
                </div>
            )}

            {/* Line Graph (Canvas) */}
            {viewMode === 'line' && (
                <div className="line-graph">
                    <canvas ref={canvasRef} className="line-canvas" />
                </div>
            )}
        </div>
    );
}
