import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthChange, getUserData, saveUserData } from '../lib/firebase';

// Task type definition
export interface Task {
    id: string;
    name: string;
    xp: number;
    completed: boolean;
    isDefault?: boolean;
    dueAt?: number; // Unix timestamp for when task is due (null = EOD)
}

// Section type definition
export interface Section {
    id: string;
    name: string;
    icon: string;
    color: string;
    tasks: Task[];
    isDefault?: boolean;
}

// Default sections with their tasks
const DEFAULT_SECTIONS: Section[] = [
    {
        id: 'career',
        name: 'Career',
        icon: '💼',
        color: 'career',
        isDefault: true,
        tasks: [
            { id: 'c1', name: 'Deep work session (2+ hours)', xp: 20, completed: false, isDefault: true },
            { id: 'c2', name: 'Learn something new', xp: 15, completed: false, isDefault: true },
            { id: 'c3', name: 'Networking/outreach', xp: 10, completed: false, isDefault: true },
        ],
    },
    {
        id: 'health',
        name: 'Health',
        icon: '❤️',
        color: 'health',
        isDefault: true,
        tasks: [
            { id: 'h1', name: 'Exercise (30+ min)', xp: 20, completed: false, isDefault: true },
            { id: 'h2', name: 'Healthy meals all day', xp: 15, completed: false, isDefault: true },
            { id: 'h3', name: 'Sleep 7+ hours', xp: 15, completed: false, isDefault: true },
            { id: 'h4', name: 'Meditation/mindfulness', xp: 10, completed: false, isDefault: true },
        ],
    },
    {
        id: 'creativity',
        name: 'Creativity',
        icon: '🎨',
        color: 'creativity',
        isDefault: true,
        tasks: [
            { id: 'cr1', name: 'Creative project work', xp: 15, completed: false, isDefault: true },
            { id: 'cr2', name: 'Read for 30+ min', xp: 10, completed: false, isDefault: true },
            { id: 'cr3', name: 'Journal/reflect', xp: 10, completed: false, isDefault: true },
        ],
    },
];

// State types
interface AppState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    level: number;
    currentXP: number;
    totalXP: number;
    streak: number;
    sections: Section[];
    lastActiveDate: string;
    history: { date: string; xp: number; tasksCompleted: number }[];
}

type Action =
    | { type: 'SET_USER'; payload: User | null }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_DATA'; payload: Partial<AppState> }
    | { type: 'TOGGLE_TASK'; payload: { sectionId: string; taskId: string } }
    | { type: 'ADD_TASK'; payload: { sectionId: string; task: Task } }
    | { type: 'REMOVE_TASK'; payload: { sectionId: string; taskId: string } }
    | { type: 'ADD_SECTION'; payload: Section }
    | { type: 'UPDATE_SECTION'; payload: { sectionId: string; name: string; icon: string } }
    | { type: 'REMOVE_SECTION'; payload: string }
    | { type: 'APPLY_PENALTY' }
    | { type: 'CHECK_OVERDUE' }
    | { type: 'RESET_DAILY' };

// XP calculation helpers
const XP_PER_LEVEL = 100;
const calculateLevel = (totalXP: number) => Math.floor(totalXP / XP_PER_LEVEL) + 1;
const calculateCurrentXP = (totalXP: number) => totalXP % XP_PER_LEVEL;
const getRequiredXP = () => XP_PER_LEVEL;

// Initial state
const initialState: AppState = {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    level: 1,
    currentXP: 0,
    totalXP: 0,
    streak: 0,
    sections: DEFAULT_SECTIONS,
    lastActiveDate: new Date().toISOString().split('T')[0],
    history: [],
};

// Reducer
function appReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: !!action.payload,
                isLoading: false,
            };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_DATA':
            return { ...state, ...action.payload };
        case 'TOGGLE_TASK': {
            const { sectionId, taskId } = action.payload;
            const sectionIndex = state.sections.findIndex(s => s.id === sectionId);
            if (sectionIndex === -1) return state;

            const section = state.sections[sectionIndex];
            const taskIndex = section.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) return state;

            const task = section.tasks[taskIndex];
            const wasCompleted = task.completed;
            const newTasks = [
                ...section.tasks.slice(0, taskIndex),
                { ...task, completed: !wasCompleted },
                ...section.tasks.slice(taskIndex + 1),
            ];

            const newSections = [
                ...state.sections.slice(0, sectionIndex),
                { ...section, tasks: newTasks },
                ...state.sections.slice(sectionIndex + 1),
            ];

            const xpChange = wasCompleted ? -task.xp : task.xp;
            const newTotalXP = Math.max(0, state.totalXP + xpChange);

            // Update history for calendar
            const today = new Date().toISOString().split('T')[0];
            const existingHistoryIndex = state.history.findIndex(h => h.date === today);
            let newHistory = [...state.history];

            if (existingHistoryIndex >= 0) {
                // Update existing day
                const existing = newHistory[existingHistoryIndex];
                newHistory[existingHistoryIndex] = {
                    ...existing,
                    xp: existing.xp + xpChange,
                    tasksCompleted: existing.tasksCompleted + (wasCompleted ? -1 : 1),
                };
            } else {
                // Add new day entry
                newHistory.push({
                    date: today,
                    xp: xpChange,
                    tasksCompleted: wasCompleted ? 0 : 1,
                });
            }

            return {
                ...state,
                sections: newSections,
                totalXP: newTotalXP,
                level: calculateLevel(newTotalXP),
                currentXP: calculateCurrentXP(newTotalXP),
                history: newHistory,
            };
        }
        case 'ADD_TASK': {
            const { sectionId, task } = action.payload;
            const sectionIndex = state.sections.findIndex(s => s.id === sectionId);
            if (sectionIndex === -1) return state;

            const newSections = [...state.sections];
            newSections[sectionIndex] = {
                ...newSections[sectionIndex],
                tasks: [...newSections[sectionIndex].tasks, task],
            };

            return { ...state, sections: newSections };
        }
        case 'REMOVE_TASK': {
            const { sectionId, taskId } = action.payload;
            const sectionIndex = state.sections.findIndex(s => s.id === sectionId);
            if (sectionIndex === -1) return state;

            // Find the task to check if it's incomplete
            const task = state.sections[sectionIndex].tasks.find(t => t.id === taskId);
            let newTotalXP = state.totalXP;
            let penalty = 0;

            // If task is incomplete, apply half XP penalty
            if (task && !task.completed) {
                penalty = Math.floor(task.xp / 2);
                newTotalXP = Math.max(0, state.totalXP - penalty);
            }

            const newSections = [...state.sections];
            newSections[sectionIndex] = {
                ...newSections[sectionIndex],
                tasks: newSections[sectionIndex].tasks.filter(t => t.id !== taskId),
            };

            // Update history for calendar with negative XP
            let newHistory = [...state.history];
            if (penalty > 0) {
                const today = new Date().toISOString().split('T')[0];
                const existingHistoryIndex = newHistory.findIndex(h => h.date === today);
                if (existingHistoryIndex >= 0) {
                    newHistory[existingHistoryIndex] = {
                        ...newHistory[existingHistoryIndex],
                        xp: newHistory[existingHistoryIndex].xp - penalty,
                    };
                } else {
                    newHistory.push({ date: today, xp: -penalty, tasksCompleted: 0 });
                }
            }

            return {
                ...state,
                sections: newSections,
                totalXP: newTotalXP,
                level: calculateLevel(newTotalXP),
                currentXP: calculateCurrentXP(newTotalXP),
                history: newHistory,
            };
        }
        case 'ADD_SECTION': {
            return {
                ...state,
                sections: [...state.sections, action.payload],
            };
        }
        case 'UPDATE_SECTION': {
            const { sectionId, name, icon } = action.payload;
            const sectionIndex = state.sections.findIndex(s => s.id === sectionId);
            if (sectionIndex === -1) return state;

            const newSections = [...state.sections];
            newSections[sectionIndex] = {
                ...newSections[sectionIndex],
                name,
                icon,
            };

            return { ...state, sections: newSections };
        }
        case 'REMOVE_SECTION': {
            // Find the section to calculate penalty
            const sectionToRemove = state.sections.find(s => s.id === action.payload);
            let newTotalXP = state.totalXP;
            let penalty = 0;

            // Calculate penalty for all incomplete tasks in the section
            if (sectionToRemove) {
                penalty = sectionToRemove.tasks
                    .filter(t => !t.completed)
                    .reduce((sum, t) => sum + Math.floor(t.xp / 2), 0);
                newTotalXP = Math.max(0, state.totalXP - penalty);
            }

            // Update history for calendar with negative XP
            let newHistory = [...state.history];
            if (penalty > 0) {
                const today = new Date().toISOString().split('T')[0];
                const existingHistoryIndex = newHistory.findIndex(h => h.date === today);
                if (existingHistoryIndex >= 0) {
                    newHistory[existingHistoryIndex] = {
                        ...newHistory[existingHistoryIndex],
                        xp: newHistory[existingHistoryIndex].xp - penalty,
                    };
                } else {
                    newHistory.push({ date: today, xp: -penalty, tasksCompleted: 0 });
                }
            }

            return {
                ...state,
                sections: state.sections.filter(s => s.id !== action.payload),
                totalXP: newTotalXP,
                level: calculateLevel(newTotalXP),
                currentXP: calculateCurrentXP(newTotalXP),
                history: newHistory,
            };
        }
        case 'CHECK_OVERDUE': {
            const now = Date.now();
            let penaltyXP = 0;

            // Find overdue incomplete tasks with deadlines
            const newSections = state.sections.map(section => ({
                ...section,
                tasks: section.tasks.map(task => {
                    // Check if task has deadline, is not completed, and is overdue
                    if (task.dueAt && !task.completed && task.dueAt < now) {
                        penaltyXP += task.xp;
                        // Mark as completed to prevent repeated penalties, but it's failed
                        return { ...task, completed: true, dueAt: undefined };
                    }
                    return task;
                }),
            }));

            if (penaltyXP === 0) return state;

            const newTotalXP = Math.max(0, state.totalXP - penaltyXP);

            // Update history for calendar with negative XP
            const today = new Date().toISOString().split('T')[0];
            let newHistory = [...state.history];
            const existingHistoryIndex = newHistory.findIndex(h => h.date === today);
            if (existingHistoryIndex >= 0) {
                newHistory[existingHistoryIndex] = {
                    ...newHistory[existingHistoryIndex],
                    xp: newHistory[existingHistoryIndex].xp - penaltyXP,
                };
            } else {
                newHistory.push({ date: today, xp: -penaltyXP, tasksCompleted: 0 });
            }

            return {
                ...state,
                sections: newSections,
                totalXP: newTotalXP,
                level: calculateLevel(newTotalXP),
                currentXP: calculateCurrentXP(newTotalXP),
                history: newHistory,
            };
        }
        case 'APPLY_PENALTY': {
            // Calculate penalty for incomplete tasks (EOD penalty)
            const incompleteXP = state.sections
                .flatMap(s => s.tasks)
                .filter(t => !t.completed)
                .reduce((sum, t) => sum + t.xp, 0);

            const newTotalXP = Math.max(0, state.totalXP - incompleteXP);

            // Reset tasks for new day
            const resetSections = state.sections.map(section => ({
                ...section,
                tasks: section.tasks.map(t => ({ ...t, completed: false, dueAt: undefined })),
            }));

            // Update history for calendar with negative XP (for yesterday since it's EOD penalty)
            let newHistory = [...state.history];
            if (incompleteXP > 0 && state.lastActiveDate) {
                const yesterdayDate = state.lastActiveDate;
                const existingHistoryIndex = newHistory.findIndex(h => h.date === yesterdayDate);
                if (existingHistoryIndex >= 0) {
                    newHistory[existingHistoryIndex] = {
                        ...newHistory[existingHistoryIndex],
                        xp: newHistory[existingHistoryIndex].xp - incompleteXP,
                    };
                } else {
                    newHistory.push({ date: yesterdayDate, xp: -incompleteXP, tasksCompleted: 0 });
                }
            }

            return {
                ...state,
                sections: resetSections,
                totalXP: newTotalXP,
                level: calculateLevel(newTotalXP),
                currentXP: calculateCurrentXP(newTotalXP),
                lastActiveDate: new Date().toISOString().split('T')[0],
                history: newHistory,
            };
        }
        case 'RESET_DAILY': {
            const resetSections = state.sections.map(section => ({
                ...section,
                tasks: section.tasks.map(t => ({ ...t, completed: false })),
            }));
            return { ...state, sections: resetSections, lastActiveDate: new Date().toISOString().split('T')[0] };
        }
        default:
            return state;
    }
}

// Context
interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<Action>;
    toggleTask: (sectionId: string, taskId: string) => void;
    addTask: (sectionId: string, name: string, xp: number, dueAt?: number) => void;
    removeTask: (sectionId: string, taskId: string) => void;
    addSection: (name: string, icon: string, color?: string) => void;
    updateSection: (sectionId: string, name: string, icon: string) => void;
    removeSection: (sectionId: string) => void;
    getTodayXP: () => number;
    getRequiredXP: () => number;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Ref to prevent saving during initial auth/data load (prevents overwriting Firebase data)
    const isInitializingRef = useRef(true);

    // Auth listener
    useEffect(() => {
        const unsubscribe = onAuthChange(async (user) => {
            // First, reset state to defaults when user changes (prevents data leaking between accounts)
            dispatch({
                type: 'SET_DATA',
                payload: {
                    totalXP: 0,
                    level: 1,
                    currentXP: 0,
                    streak: 0,
                    sections: DEFAULT_SECTIONS.map(s => ({
                        ...s,
                        tasks: s.tasks.map(t => ({ ...t, completed: false }))
                    })),
                    history: [],
                    lastActiveDate: new Date().toISOString().split('T')[0],
                },
            });

            dispatch({ type: 'SET_USER', payload: user });

            if (user) {
                const userData = await getUserData(user.uid);
                if (userData) {
                    // User has existing data - load it
                    dispatch({
                        type: 'SET_DATA',
                        payload: {
                            totalXP: userData.totalXP || 0,
                            level: calculateLevel(userData.totalXP || 0),
                            currentXP: calculateCurrentXP(userData.totalXP || 0),
                            streak: userData.streak || 0,
                            sections: userData.sections || DEFAULT_SECTIONS,
                            history: userData.history || [],
                        },
                    });
                }
                // If no userData, the reset above already set clean defaults
            }
            // If no user (logged out), the reset above already set clean defaults

            // Done initializing - allow saves from now on
            // Use setTimeout to ensure this happens after React processes the state updates
            setTimeout(() => {
                isInitializingRef.current = false;
            }, 500);
        });

        return () => unsubscribe();
    }, []);

    // Save to Firebase when state changes
    useEffect(() => {
        // Skip saving during initialization to prevent overwriting Firebase data
        if (isInitializingRef.current) return;

        if (state.user && state.isAuthenticated) {
            const saveData = async () => {
                await saveUserData(state.user!.uid, {
                    totalXP: state.totalXP,
                    level: state.level,
                    streak: state.streak,
                    sections: state.sections,
                    history: state.history,
                });
            };
            saveData();
        }
    }, [state.totalXP, state.sections, state.user, state.isAuthenticated, state.level, state.streak, state.history]);

    // Check for day change and apply penalty for incomplete tasks
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        if (state.lastActiveDate && state.lastActiveDate !== today && !state.isLoading) {
            // It's a new day - apply penalty for incomplete tasks
            dispatch({ type: 'APPLY_PENALTY' });
        }
    }, [state.lastActiveDate, state.isLoading]);

    // Check every minute for midnight rollover
    useEffect(() => {
        const checkMidnight = () => {
            const today = new Date().toISOString().split('T')[0];
            if (state.lastActiveDate && state.lastActiveDate !== today) {
                dispatch({ type: 'APPLY_PENALTY' });
            }
        };

        const interval = setInterval(checkMidnight, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [state.lastActiveDate]);

    // Check for overdue tasks every 30 seconds
    useEffect(() => {
        const checkOverdue = () => {
            dispatch({ type: 'CHECK_OVERDUE' });
        };

        // Check immediately and then every 30 seconds
        checkOverdue();
        const interval = setInterval(checkOverdue, 30000);
        return () => clearInterval(interval);
    }, []);

    const toggleTask = (sectionId: string, taskId: string) => {
        dispatch({ type: 'TOGGLE_TASK', payload: { sectionId, taskId } });
    };

    const addTask = (sectionId: string, name: string, xp: number, dueAt?: number) => {
        const task: Task = {
            id: `task_${Date.now()}`,
            name,
            xp,
            completed: false,
            isDefault: false,
            dueAt,
        };
        dispatch({ type: 'ADD_TASK', payload: { sectionId, task } });
    };

    const removeTask = (sectionId: string, taskId: string) => {
        dispatch({ type: 'REMOVE_TASK', payload: { sectionId, taskId } });
    };

    const addSection = (name: string, icon: string, color?: string) => {
        const section: Section = {
            id: `section_${Date.now()}`,
            name,
            icon,
            color: color || 'custom',
            tasks: [],
            isDefault: false,
        };
        dispatch({ type: 'ADD_SECTION', payload: section });
    };

    const updateSection = (sectionId: string, name: string, icon: string) => {
        dispatch({ type: 'UPDATE_SECTION', payload: { sectionId, name, icon } });
    };

    const removeSection = (sectionId: string) => {
        dispatch({ type: 'REMOVE_SECTION', payload: sectionId });
    };

    const getTodayXP = () => {
        return state.sections
            .flatMap(s => s.tasks)
            .filter(t => t.completed)
            .reduce((sum, t) => sum + t.xp, 0);
    };

    return (
        <AppContext.Provider value={{
            state,
            dispatch,
            toggleTask,
            addTask,
            removeTask,
            addSection,
            updateSection,
            removeSection,
            getTodayXP,
            getRequiredXP,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}
