import { motion } from 'framer-motion';
import { Chrome, ArrowRight, Sparkles } from 'lucide-react';
import { signInWithGoogle } from '../../lib/firebase';
import './LoginScreen.css';

interface LoginScreenProps {
    onContinueWithoutLogin: () => void;
}

export function LoginScreen({ onContinueWithoutLogin }: LoginScreenProps) {
    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <div className="login-screen">
            <div className="login-background">
                <motion.div
                    className="login-orb login-orb-1"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="login-orb login-orb-2"
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <motion.div
                className="login-content"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <motion.div
                    className="login-logo"
                    animate={{
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    ⚔️
                </motion.div>

                <h1 className="login-title">
                    Life<span className="gradient-text">XP</span>
                </h1>

                <p className="login-tagline">
                    Level up your life, one task at a time
                </p>

                <div className="login-features">
                    <div className="feature">
                        <Sparkles size={18} className="feature-icon" />
                        <span>Gamified Progress Tracking</span>
                    </div>
                    <div className="feature">
                        <motion.span
                            className="feature-fire"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                        >
                            🔥
                        </motion.span>
                        <span>Streak System</span>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">📊</span>
                        <span>Visual Analytics</span>
                    </div>
                </div>

                <div className="login-buttons">
                    <motion.button
                        className="login-btn google"
                        onClick={handleGoogleSignIn}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Chrome size={20} />
                        <span>Sign in with Google</span>
                    </motion.button>

                    <motion.button
                        className="login-btn guest"
                        onClick={onContinueWithoutLogin}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span>Continue as Guest</span>
                        <ArrowRight size={18} />
                    </motion.button>
                </div>

                <p className="login-disclaimer">
                    Your data syncs across devices when signed in
                </p>
            </motion.div>
        </div>
    );
}
