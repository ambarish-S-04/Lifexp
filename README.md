# 🌿 LifeXP - Gamify Your Daily Productivity

Turn your daily tasks into XP! Complete tasks, earn experience points, level up, and build streaks to stay motivated.

**Live Demo:** [https://gamified-daily-progress.web.app](https://gamified-daily-progress.web.app)

![LifeXP Banner](https://img.shields.io/badge/LifeXP-Gamify%20Productivity-8B5CF6?style=for-the-badge)

## ✨ Features

### 🎮 Gamification System
- **XP Points** - Earn experience points for completing tasks
- **Level Progression** - Level up as you accumulate XP (100 XP per level)
- **Streak Tracking** - Build daily streaks by staying consistent
- **XP Penalties** - Lose XP for incomplete tasks or missed deadlines

### 📋 Task Management
- **Custom Sections** - Create personalized task categories with icons
- **Flexible XP Values** - Set 10, 15, or 20 XP per task
- **Timed Deadlines** - Optional deadlines (1-12 hours or end of day)
- **Deletion Penalties** - Half XP penalty for deleting incomplete tasks

### 📊 Progress Tracking
- **Activity Calendar** - Visual monthly view showing daily XP earned
- **Progress Charts** - Bar and line graphs showing XP trends
- **Negative XP Display** - Red indicators for days with net XP loss
- **Monthly Stats** - Total XP, average per active day, and active day count

### 🎨 Beautiful UI
- **Light/Dark Mode** - Toggle between themes
- **Color Themes** - Choose from 8 accent colors
- **Animated Backgrounds** - Floating geometric shapes and patterns
- **Glassmorphism Design** - Modern frosted glass effects

### 🔐 Authentication
- **Google Sign-In** - Secure authentication via Firebase
- **Guest Mode** - Try the app without signing up
- **Data Persistence** - Cloud sync for authenticated users
- **Account Deletion** - 24-hour delayed account deletion with confirmation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account (for authentication & database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ambarish-S-04/Lifexp.git
   cd Lifexp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then fill in your Firebase credentials in `.env`:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 📦 Deployment

### Firebase Hosting

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only hosting
   ```

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** CSS with Variables, Framer Motion
- **Auth & Database:** Firebase (Auth + Firestore)
- **Icons:** Lucide React
- **Deployment:** Firebase Hosting

## 📁 Project Structure

```
src/
├── components/
│   ├── features/       # Feature components (TaskSection, Calendar, etc.)
│   ├── layout/         # Layout components (GlassCard, BottomNav, etc.)
│   └── ui/             # UI components (XPProgress, StatCard, etc.)
├── context/            # React Context (AppContext, ThemeContext)
├── lib/                # Utilities (Firebase config)
└── App.tsx             # Main application
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with React and Firebase
- Icons by Lucide React
- Animations by Framer Motion

---

Made with ❤️ by [Ambarish](https://github.com/ambarish-S-04)
