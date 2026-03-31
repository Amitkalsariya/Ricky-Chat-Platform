import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { IncomingCallModal, CallScreen } from "./components/CallComponents";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthStore } from "./store/AuthStore";
import { CallStore } from "./store/CallStore";
import { ChatRequestStore } from "./store/ChatRequestStore";
import { useEffect } from "react";
import { useThemeStore } from "./store/UseThemeStore";
import { ToastProvider } from "./components/CustomToast";
import "../src/styles/loader.css";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, socket } = AuthStore();
  const { theme } = useThemeStore();
  const { subscribeToCallEvents, unsubscribeFromCallEvents } = CallStore();
  const { subscribeToChatRequestEvents, unsubscribeFromChatRequestEvents, getAcceptedContacts } = ChatRequestStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Subscribe to socket events when authenticated
  useEffect(() => {
    if (authUser && socket?.on) {
      subscribeToCallEvents();
      subscribeToChatRequestEvents();
      getAcceptedContacts();
      return () => {
        unsubscribeFromCallEvents();
        unsubscribeFromChatRequestEvents();
      };
    }
  }, [authUser, socket]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen bg-base-100" data-theme={theme}>
        <div className="ricky-loader">
          {/* Animated ring with logo */}
          <div className="ricky-loader-ring">
            <div className="ricky-loader-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
          {/* Brand text + animated dots */}
          <div className="ricky-loader-text">
            <span className="ricky-loader-brand">Ricky Chat</span>
            <span className="ricky-loader-status">Loading your conversations</span>
            <div className="ricky-loader-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div data-theme={theme}>
      <ToastProvider>
        <Navbar />
        <Routes>
          {/* Landing page for unauthenticated users, Home for authenticated */}
          <Route path="/" element={authUser ? <HomePage /> : <LandingPage />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>

        {/* Global Call Overlays */}
        {authUser && (
          <>
            <IncomingCallModal />
            <CallScreen />
          </>
        )}
      </ToastProvider>
    </div>
  );
};

export default App;
