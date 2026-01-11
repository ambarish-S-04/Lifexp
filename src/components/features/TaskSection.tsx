import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, X, Trash2, Clock } from 'lucide-react';
import { useState } from 'react';
import type { Section } from '../../context/AppContext';
import './TaskSection.css';

interface TaskSectionProps {
    section: Section;
    onToggleTask: (sectionId: string, taskId: string) => void;
    onAddTask: (sectionId: string, name: string, xp: number, dueAt?: number) => void;
    onRemoveTask: (sectionId: string, taskId: string) => void;
    onRemoveSection?: (sectionId: string) => void;
}

// Helper to format time remaining
function formatTimeRemaining(dueAt: number): string {
    const now = Date.now();
    const remaining = dueAt - now;

    if (remaining <= 0) return 'Overdue!';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
}

export function TaskSection({
    section,
    onToggleTask,
    onAddTask,
    onRemoveTask,
    onRemoveSection,
}: TaskSectionProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskXP, setNewTaskXP] = useState(10);
    const [deadline, setDeadline] = useState<string>('eod'); // 'eod' or hours as string
    const [confirmDeleteTask, setConfirmDeleteTask] = useState<string | null>(null);
    const [confirmDeleteSection, setConfirmDeleteSection] = useState(false);

    const handleAddTask = () => {
        if (newTaskName.trim()) {
            let dueAt: number | undefined;

            if (deadline === 'eod') {
                // End of day - midnight local time
                const now = new Date();
                const eod = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                dueAt = eod.getTime();
            } else {
                // X hours from now
                dueAt = Date.now() + (parseInt(deadline) * 60 * 60 * 1000);
            }

            onAddTask(section.id, newTaskName.trim(), newTaskXP, dueAt);
            setNewTaskName('');
            setNewTaskXP(10);
            setDeadline('eod');
            setIsAdding(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddTask();
        } else if (e.key === 'Escape') {
            setIsAdding(false);
            setNewTaskName('');
        }
    };

    const handleDeleteTask = (taskId: string) => {
        onRemoveTask(section.id, taskId);
        setConfirmDeleteTask(null);
    };

    const handleDeleteSection = () => {
        if (onRemoveSection) {
            onRemoveSection(section.id);
        }
        setConfirmDeleteSection(false);
    };

    // Get task XP for the confirmation warning
    const getTaskXPPenalty = (taskId: string) => {
        const task = section.tasks.find(t => t.id === taskId);
        if (task && !task.completed) {
            return Math.floor(task.xp / 2);
        }
        return 0;
    };

    return (
        <motion.div
            className={`task-section section-${section.color}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="section-header">
                <h3 className="section-title">
                    <span className="section-icon">{section.icon}</span>
                    {section.name}
                </h3>
                <div className="section-actions">
                    {onRemoveSection && !confirmDeleteSection && (
                        <motion.button
                            className="section-delete-btn"
                            onClick={() => setConfirmDeleteSection(true)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete section"
                        >
                            <Trash2 size={14} />
                        </motion.button>
                    )}
                    {confirmDeleteSection && (
                        <div className="confirm-delete-section">
                            <span className="confirm-text">Delete section?</span>
                            <motion.button
                                className="confirm-yes"
                                onClick={handleDeleteSection}
                                whileTap={{ scale: 0.9 }}
                            >
                                Yes
                            </motion.button>
                            <motion.button
                                className="confirm-no"
                                onClick={() => setConfirmDeleteSection(false)}
                                whileTap={{ scale: 0.9 }}
                            >
                                No
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>

            <div className="task-list">
                <AnimatePresence>
                    {section.tasks.map((task) => (
                        <motion.div
                            key={task.id}
                            className={`task-item ${task.completed ? 'completed' : ''} ${task.dueAt && task.dueAt < Date.now() && !task.completed ? 'overdue' : ''}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            layout
                        >
                            <motion.button
                                className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                                onClick={() => onToggleTask(section.id, task.id)}
                                whileTap={{ scale: 0.85 }}
                            >
                                <AnimatePresence>
                                    {task.completed && (
                                        <motion.span
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            exit={{ scale: 0, rotate: 180 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                        >
                                            <Check size={14} strokeWidth={3} />
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            <div className="task-info">
                                <span className="task-name">{task.name}</span>
                                {task.dueAt && !task.completed && (
                                    <span className={`task-deadline ${task.dueAt < Date.now() ? 'overdue' : ''}`}>
                                        <Clock size={10} /> {formatTimeRemaining(task.dueAt)}
                                    </span>
                                )}
                            </div>
                            <span className="task-xp">+{task.xp} XP</span>

                            {confirmDeleteTask === task.id ? (
                                <div className="confirm-delete-inline">
                                    {!task.completed && (
                                        <span className="penalty-warning">-{getTaskXPPenalty(task.id)} XP</span>
                                    )}
                                    <motion.button
                                        className="confirm-yes"
                                        onClick={() => handleDeleteTask(task.id)}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Check size={12} />
                                    </motion.button>
                                    <motion.button
                                        className="confirm-no"
                                        onClick={() => setConfirmDeleteTask(null)}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <X size={12} />
                                    </motion.button>
                                </div>
                            ) : (
                                <motion.button
                                    className="task-delete"
                                    onClick={() => setConfirmDeleteTask(task.id)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title="Delete task"
                                >
                                    <X size={14} />
                                </motion.button>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add Task Form */}
            <AnimatePresence>
                {isAdding ? (
                    <motion.div
                        className="add-task-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <input
                            type="text"
                            className="add-task-input"
                            placeholder="Task name..."
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                        <div className="task-options-row">
                            <div className="xp-selector">
                                <span className="xp-label">XP:</span>
                                <select
                                    value={newTaskXP}
                                    onChange={(e) => setNewTaskXP(Number(e.target.value))}
                                    className="xp-select"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={20}>20</option>
                                    <option value={25}>25</option>
                                    <option value={30}>30</option>
                                </select>
                            </div>
                            <div className="deadline-selector">
                                <span className="deadline-label">⏰ Due:</span>
                                <select
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="deadline-select"
                                >
                                    <option value="eod">End of Day</option>
                                    <option value="1">In 1 hour</option>
                                    <option value="2">In 2 hours</option>
                                    <option value="3">In 3 hours</option>
                                    <option value="4">In 4 hours</option>
                                    <option value="6">In 6 hours</option>
                                    <option value="8">In 8 hours</option>
                                    <option value="12">In 12 hours</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-actions">
                            <motion.button
                                className="btn-confirm"
                                onClick={handleAddTask}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Check size={16} />
                            </motion.button>
                            <motion.button
                                className="btn-cancel"
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewTaskName('');
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <X size={16} />
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        className="add-task-btn"
                        onClick={() => setIsAdding(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Plus size={16} />
                        <span>Add Task</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Add Section Component
interface AddSectionProps {
    onAddSection: (name: string, icon: string) => void;
}

export function AddSectionButton({ onAddSection }: AddSectionProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('📌');

    const ICONS = ['📌', '🎯', '📚', '💪', '🧘', '🎵', '🏠', '💰', '🌱', '⭐'];

    const handleAdd = () => {
        if (name.trim()) {
            onAddSection(name.trim(), icon);
            setName('');
            setIcon('📌');
            setIsAdding(false);
        }
    };

    return (
        <AnimatePresence>
            {isAdding ? (
                <motion.div
                    className="add-section-form"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                >
                    <div className="section-form-header">
                        <span>New Section</span>
                    </div>
                    <div className="icon-picker">
                        {ICONS.map((i) => (
                            <button
                                key={i}
                                className={`icon-option ${icon === i ? 'selected' : ''}`}
                                onClick={() => setIcon(i)}
                            >
                                {i}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        className="section-name-input"
                        placeholder="Section name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        autoFocus
                    />
                    <div className="form-actions">
                        <motion.button
                            className="btn-confirm"
                            onClick={handleAdd}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Check size={16} />
                            <span>Create</span>
                        </motion.button>
                        <motion.button
                            className="btn-cancel"
                            onClick={() => setIsAdding(false)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <X size={16} />
                        </motion.button>
                    </div>
                </motion.div>
            ) : (
                <motion.button
                    className="add-section-btn"
                    onClick={() => setIsAdding(true)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus size={18} />
                    <span>Add New Section</span>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
