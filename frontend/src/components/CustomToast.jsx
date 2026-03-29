import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X, MessageSquare, Heart, UserPlus, UserCheck, Users } from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

let toastIdCounter = 0;
let globalAddToast = null;

// Standalone toast function (can be used outside React components)
const toast = (message, options = {}) => {
  if (globalAddToast) {
    globalAddToast(message, { type: 'default', ...options });
  }
};

toast.success = (message, options = {}) => {
  if (globalAddToast) {
    globalAddToast(message, { type: 'success', ...options });
  }
};

toast.error = (message, options = {}) => {
  if (globalAddToast) {
    globalAddToast(message, { type: 'error', ...options });
  }
};

toast.warning = (message, options = {}) => {
  if (globalAddToast) {
    globalAddToast(message, { type: 'warning', ...options });
  }
};

toast.info = (message, options = {}) => {
  if (globalAddToast) {
    globalAddToast(message, { type: 'info', ...options });
  }
};

// Rich notification toast (with avatar, title, subtitle)
toast.notification = (title, subtitle, options = {}) => {
  if (globalAddToast) {
    globalAddToast(title, {
      type: 'notification',
      subtitle,
      ...options,
    });
  }
};

// Single Toast Component
const ToastItem = ({ toast: t, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const duration = t.duration || 4000;

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(t.id), 300);
  }, [t.id, onDismiss]);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [duration, handleDismiss]);

  const config = {
    success: {
      icon: <CheckCircle className="size-5" />,
      gradient: 'from-emerald-500/20 to-teal-500/10',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      progressColor: 'bg-emerald-400',
      glow: 'shadow-emerald-500/10',
      leftAccent: 'bg-emerald-500',
    },
    error: {
      icon: <XCircle className="size-5" />,
      gradient: 'from-rose-500/20 to-red-500/10',
      border: 'border-rose-500/30',
      iconColor: 'text-rose-400',
      progressColor: 'bg-rose-400',
      glow: 'shadow-rose-500/10',
      leftAccent: 'bg-rose-500',
    },
    warning: {
      icon: <AlertTriangle className="size-5" />,
      gradient: 'from-amber-500/20 to-yellow-500/10',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      progressColor: 'bg-amber-400',
      glow: 'shadow-amber-500/10',
      leftAccent: 'bg-amber-500',
    },
    info: {
      icon: <Info className="size-5" />,
      gradient: 'from-blue-500/20 to-cyan-500/10',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      progressColor: 'bg-blue-400',
      glow: 'shadow-blue-500/10',
      leftAccent: 'bg-blue-500',
    },
    default: {
      icon: <Info className="size-5" />,
      gradient: 'from-primary/20 to-secondary/10',
      border: 'border-primary/30',
      iconColor: 'text-primary',
      progressColor: 'bg-primary',
      glow: 'shadow-primary/10',
      leftAccent: 'bg-primary',
    },
    notification: {
      icon: <MessageSquare className="size-5" />,
      gradient: 'from-primary/15 via-secondary/10 to-accent/5',
      border: 'border-primary/20',
      iconColor: 'text-primary',
      progressColor: 'bg-gradient-to-r from-primary to-secondary',
      glow: 'shadow-primary/15',
      leftAccent: 'bg-gradient-to-b from-primary to-secondary',
    },
  };

  // Pick icon based on notification subtype
  const getNotificationIcon = () => {
    if (t.notificationType === 'reaction') return <Heart className="size-5 text-rose-400" />;
    if (t.notificationType === 'chat_request') return <UserPlus className="size-5 text-blue-400" />;
    if (t.notificationType === 'chat_request_accepted') return <UserCheck className="size-5 text-emerald-400" />;
    if (t.notificationType === 'group_invite') return <Users className="size-5 text-secondary" />;
    if (t.notificationType === 'message') return <MessageSquare className="size-5 text-primary" />;
    return null;
  };

  const c = config[t.type] || config.default;

  // ── RICH NOTIFICATION TOAST ──
  if (t.type === 'notification') {
    return (
      <div
        className={`
          relative overflow-hidden rounded-2xl border backdrop-blur-xl
          bg-gradient-to-r ${c.gradient} ${c.border}
          shadow-2xl ${c.glow}
          transform transition-all duration-300 ease-out
          ${isExiting
            ? 'translate-x-[120%] opacity-0 scale-95'
            : 'translate-x-0 opacity-100 scale-100'
          }
          max-w-[92vw] sm:max-w-md w-full
        `}
        style={{
          animation: !isExiting ? 'toast-slide-in 0.4s cubic-bezier(0.21, 1.02, 0.73, 1)' : undefined,
        }}
      >
        {/* Left accent bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.leftAccent} rounded-l-2xl`} />

        <div className="flex items-start gap-3 p-4 pl-5">
          {/* Avatar or Icon */}
          {t.avatar ? (
            <div className="flex-shrink-0 size-10 rounded-full overflow-hidden ring-2 ring-base-content/10">
              <img src={t.avatar} alt="" className="size-full object-cover" />
            </div>
          ) : (
            <div className={`flex-shrink-0 size-10 rounded-full flex items-center justify-center bg-base-content/5`}>
              {getNotificationIcon() || c.icon}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-base-content leading-tight truncate">
              {t.message}
            </p>
            {t.subtitle && (
              <p className="text-xs text-base-content/50 mt-0.5 truncate">
                {t.subtitle}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-[10px] text-base-content/30 font-medium">now</span>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg hover:bg-base-content/10 transition-colors"
            >
              <X className="size-3 text-base-content/40" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-base-content/5">
          <div
            className={`h-full ${c.progressColor} transition-all duration-100 ease-linear rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  // ── STANDARD TOAST ──
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border backdrop-blur-xl
        bg-gradient-to-r ${c.gradient} ${c.border}
        shadow-lg ${c.glow}
        transform transition-all duration-300 ease-out
        ${isExiting
          ? 'translate-x-[120%] opacity-0 scale-95'
          : 'translate-x-0 opacity-100 scale-100'
        }
        max-w-[90vw] sm:max-w-sm w-full
      `}
      style={{
        animation: !isExiting ? 'toast-slide-in 0.4s cubic-bezier(0.21, 1.02, 0.73, 1)' : undefined,
      }}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.leftAccent} rounded-l-2xl`} />

      <div className="flex items-start gap-3 p-4 pl-5">
        <div className={`flex-shrink-0 mt-0.5 ${c.iconColor}`}>
          {c.icon}
        </div>
        <p className="flex-1 text-sm font-medium text-base-content leading-relaxed">
          {t.message}
        </p>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-base-content/10 transition-colors"
        >
          <X className="size-3.5 text-base-content/50" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-base-content/5">
        <div
          className={`h-full ${c.progressColor} transition-all duration-100 ease-linear rounded-full`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Toast Container Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, options = {}) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev.slice(-4), { id, message, ...options }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Register global toast function
  useEffect(() => {
    globalAddToast = addToast;
    return () => { globalAddToast = null; };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Stack */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export default toast;
