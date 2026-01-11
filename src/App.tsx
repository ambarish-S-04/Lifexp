import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, Trophy, TrendingUp, Percent, Zap, LogOut, User, Trash2, AlertTriangle } from 'lucide-react';
import { AnimatedBackground } from './components/layout/AnimatedBackground';
import { BottomNav } from './components/layout/BottomNav';
import { GlassCard } from './components/layout/GlassCard';
import { XPProgress } from './components/ui/XPProgress';
import { StatCard } from './components/ui/StatCard';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { TaskSection, AddSectionButton } from './components/features/TaskSection';
import { LoginScreen } from './components/features/LoginScreen';
import { ActivityCalendar } from './components/features/ActivityCalendar';
import { ProgressChart } from './components/features/ProgressChart';
import { useApp } from './context/AppContext';
import { useTheme } from './context/ThemeContext';
import { logOut, scheduleAccountDeletion, signInWithGoogle } from './lib/firebase';
import './App.css';

type TabName = 'dashboard' | 'tasks' | 'stats' | 'settings';

function AppContent() {
  const { state, toggleTask, addTask, removeTask, addSection, removeSection, getTodayXP, getRequiredXP } = useApp();
  const { mode, colorTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabName>('dashboard');
  const [isGuest, setIsGuest] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletionScheduled, setDeletionScheduled] = useState<Date | null>(null);

  // Show loading
  if (state.isLoading && !isGuest) {
    return (
      <div className="loading-screen">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p>Loading your journey...</p>
      </div>
    );
  }

  // Show login if not authenticated and not guest
  if (!state.isAuthenticated && !isGuest) {
    return <LoginScreen onContinueWithoutLogin={() => setIsGuest(true)} />;
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const todayXP = getTodayXP();
  const totalCompletedToday = state.sections.flatMap(s => s.tasks).filter(t => t.completed).length;

  const handleLogout = async () => {
    await logOut();
    setIsGuest(false);
  };

  const handleDeleteAccount = async () => {
    if (!state.user?.uid) return;
    try {
      const deletionDate = await scheduleAccountDeletion(state.user.uid);
      setDeletionScheduled(deletionDate);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to schedule deletion:', error);
    }
  };

  return (
    <div className={`app ${mode} theme-${colorTheme}`}>
      <AnimatedBackground />

      <main className="main-content">
        <header className="app-header">
          <div className="brand">
            <motion.span
              className="brand-icon"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              🌿
            </motion.span>
            <h1 className="brand-name">LifeXP</h1>
          </div>
          <div className="header-right">
            <ThemeToggle />
            {state.isAuthenticated && (
              <motion.button
                className="logout-btn"
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={16} />
              </motion.button>
            )}
            {isGuest && !state.isAuthenticated && (
              <motion.button
                className="signin-btn"
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                    setIsGuest(false);
                  } catch (error) {
                    console.error('Sign in failed:', error);
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User size={14} />
                Sign In
              </motion.button>
            )}
            <motion.div
              className="level-pill"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trophy size={14} />
              <span>Level {state.level}</span>
            </motion.div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              className="tab-content"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <XPProgress
                currentXP={state.currentXP}
                requiredXP={getRequiredXP()}
                level={state.level}
                totalXP={state.totalXP}
              />

              <div className="stats-grid">
                <StatCard
                  icon={<Sparkles size={28} className="icon-gold" />}
                  label="Today's XP"
                  value={todayXP}
                  variant="xp"
                />
                <StatCard
                  icon={<Flame size={28} className="icon-fire" />}
                  label="Streak"
                  value={state.streak}
                  suffix="days"
                  variant="streak"
                />
              </div>

              <GlassCard className="overview-card">
                <h2 className="section-title">Today's Progress</h2>
                <div className="overview-grid">
                  <div className="overview-stat">
                    <Zap size={20} className="icon-purple" />
                    <div className="overview-info">
                      <span className="overview-label">XP Earned</span>
                      <span className="overview-value">+{todayXP}</span>
                    </div>
                  </div>
                  <div className="overview-stat">
                    <TrendingUp size={20} className="icon-cyan" />
                    <div className="overview-info">
                      <span className="overview-label">Tasks Done</span>
                      <span className="overview-value">{totalCompletedToday}</span>
                    </div>
                  </div>
                  <div className="overview-stat">
                    <Trophy size={20} className="icon-green" />
                    <div className="overview-info">
                      <span className="overview-label">Lifetime XP</span>
                      <span className="overview-value">{state.totalXP.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="overview-stat">
                    <Percent size={20} className="icon-pink" />
                    <div className="overview-info">
                      <span className="overview-label">Consistency</span>
                      <span className="overview-value">{state.streak > 0 ? '🔥' : '--'}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              className="tab-content"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {state.sections.map((section) => (
                <TaskSection
                  key={section.id}
                  section={section}
                  onToggleTask={toggleTask}
                  onAddTask={addTask}
                  onRemoveTask={removeTask}
                  onRemoveSection={removeSection}
                />
              ))}

              <AddSectionButton onAddSection={addSection} />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              className="tab-content"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="stats-card">
                <ActivityCalendar data={state.history} />
              </GlassCard>

              <GlassCard className="stats-card">
                <ProgressChart data={state.history} />
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              className="tab-content"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="settings-card">
                <h2 className="section-title">⚙️ Settings</h2>
                <div className="settings-list">
                  <div className="settings-item">
                    <span>Theme</span>
                    <ThemeToggle />
                  </div>
                  <div className="settings-item">
                    <span>Account</span>
                    <span className="settings-value">
                      {state.isAuthenticated ? state.user?.email : 'Guest Mode'}
                    </span>
                  </div>
                  <div className="settings-item">
                    <span>Total XP</span>
                    <span className="settings-value">{state.totalXP.toLocaleString()}</span>
                  </div>
                  <div className="settings-item">
                    <span>Current Level</span>
                    <span className="settings-value">{state.level}</span>
                  </div>
                  {state.isAuthenticated && (
                    <motion.button
                      className="logout-btn-full"
                      onClick={handleLogout}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut size={18} />
                      Sign Out
                    </motion.button>
                  )}
                </div>
              </GlassCard>

              {/* Delete Account Section - Only for Google users */}
              {state.isAuthenticated && (
                <GlassCard className="settings-card danger-zone">
                  <h2 className="section-title">⚠️ Danger Zone</h2>

                  {deletionScheduled ? (
                    <div className="deletion-scheduled">
                      <AlertTriangle size={24} className="warning-icon" />
                      <div className="deletion-info">
                        <p className="deletion-title">Account scheduled for deletion</p>
                        <p className="deletion-date">
                          Your account and all data will be permanently deleted on{' '}
                          <strong>{deletionScheduled.toLocaleString()}</strong>
                        </p>
                        <p className="deletion-note">You can cancel this by logging out and back in.</p>
                      </div>
                    </div>
                  ) : showDeleteConfirm ? (
                    <div className="delete-confirm-dialog">
                      <AlertTriangle size={32} className="warning-icon" />
                      <h3>Are you sure?</h3>
                      <p>This will permanently delete:</p>
                      <ul>
                        <li>Your account ({state.user?.email})</li>
                        <li>All your XP and level progress ({state.totalXP} XP, Level {state.level})</li>
                        <li>All your tasks and sections</li>
                        <li>Your entire activity history</li>
                      </ul>
                      <p className="delay-warning">
                        Deletion will occur after <strong>24 hours</strong>. You can cancel by signing in again.
                      </p>
                      <div className="confirm-actions">
                        <motion.button
                          className="btn-cancel-delete"
                          onClick={() => setShowDeleteConfirm(false)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          className="btn-confirm-delete"
                          onClick={handleDeleteAccount}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Trash2 size={16} />
                          Yes, Delete My Account
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="delete-account-section">
                      <p className="delete-description">
                        Permanently delete your account and all associated data.
                        This action cannot be undone.
                      </p>
                      <motion.button
                        className="delete-account-btn"
                        onClick={() => setShowDeleteConfirm(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Trash2 size={18} />
                        Delete Account
                      </motion.button>
                    </div>
                  )}
                </GlassCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
