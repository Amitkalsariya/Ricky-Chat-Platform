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
        <div className="flex flex-col items-center gap-4">
          <span className="loader"></span>
          <p className="text-base-content/50 text-sm animate-pulse">Loading Ricky...</p>
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
