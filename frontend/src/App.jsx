import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import PracticePage from './pages/PracticePage';
import MockTestsPage from './pages/MockTestsPage';
import TestPage from './pages/TestPage';
import ResultPage from './pages/ResultPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import DailyChallengePage from './pages/DailyChallengePage';
import BookmarksPage from './pages/BookmarksPage';
import MistakeNotebookPage from './pages/MistakeNotebookPage';
import AchievementsPage from './pages/AchievementsPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

function AppContent() {
  const location = useLocation();
  const hideNavFooter = location.pathname.startsWith('/test/');

  return (
    <>
      {!hideNavFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/mock-tests" element={<MockTestsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />

        {/* Protected Student Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
        <Route path="/test/:id" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
        <Route path="/results/:id" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/daily-challenge" element={<ProtectedRoute><DailyChallengePage /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
        <Route path="/mistakes" element={<ProtectedRoute><MistakeNotebookPage /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />

        {/* Error Pages */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {!hideNavFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1E293B',
              color: '#F1F5F9',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: '10px',
              fontSize: '0.9rem'
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } }
          }}
        />
      </AuthProvider>
    </Router>
  );
}
