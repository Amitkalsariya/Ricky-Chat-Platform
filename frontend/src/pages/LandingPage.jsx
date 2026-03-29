import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare, Shield, Zap, Users, Globe, Lock,
  ArrowRight, Sparkles, Send, Star, ChevronDown,
  MessageCircle, Image, Smile, Mic, Phone, Video,
  CheckCheck, Paperclip, Bell, Heart, Search,
  Moon, Sun
} from 'lucide-react';
import { useThemeStore } from '../store/UseThemeStore';

/* ═══════════════════════════════════════════
   Utility: Intersection Observer Hook
   ═══════════════════════════════════════════ */
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (!options.repeat) observer.unobserve(entry.target);
      } else if (options.repeat) {
        setIsVisible(false);
      }
    }, { threshold: options.threshold || 0.15, ...options });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, isVisible];
};

/* ═══════════════════════════════════════════
   Animated Counter
   ═══════════════════════════════════════════ */
const AnimatedCounter = ({ end, suffix = '', label }) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useInView();
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 2200;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end]);
  return (
    <div ref={ref} className="text-center group">
      <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-base-content/40 mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base font-medium tracking-wide uppercase">{label}</p>
    </div>
  );
};

/* ═══════════════════════════════════════════
   Animated Gradient Blobs Background
   ═══════════════════════════════════════════ */
const GradientBlobs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] animate-blob" />
    <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[100px] animate-blob animation-delay-2000" />
    <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] bg-accent/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
  </div>
);

/* ═══════════════════════════════════════════
   Floating Particles
   ═══════════════════════════════════════════ */
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(30)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full"
        style={{
          width: `${Math.random() * 4 + 1}px`,
          height: `${Math.random() * 4 + 1}px`,
          background: `hsla(${200 + Math.random() * 60}, 70%, 65%, ${0.15 + Math.random() * 0.25})`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float-particle ${10 + Math.random() * 20}s linear infinite`,
          animationDelay: `${-Math.random() * 20}s`,
        }}
      />
    ))}
  </div>
);

/* ═══════════════════════════════════════════
   Ripple Button Component
   ═══════════════════════════════════════════ */
const RippleButton = ({ children, className = '', ...props }) => {
  const btnRef = useRef(null);

  const handleClick = (e) => {
    const btn = btnRef.current;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    ripple.style.cssText = `position:absolute;border-radius:50%;background:rgba(255,255,255,0.35);width:${size}px;height:${size}px;left:${x}px;top:${y}px;transform:scale(0);animation:ripple-effect 0.6s ease-out;pointer-events:none;`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    if (props.onClick) props.onClick(e);
  };

  return (
    <button ref={btnRef} {...props} onClick={handleClick}
      className={`relative overflow-hidden ${className}`}>
      {children}
    </button>
  );
};

/* ═══════════════════════════════════════════
   Interactive Chat Demo (Hero)
   ═══════════════════════════════════════════ */
const InteractiveChatDemo = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [phase, setPhase] = useState(0);
  const chatRef = useRef(null);

  const demoConversation = [
    { text: "Hey! Welcome to Ricky Chat 👋", sender: 'other', delay: 800 },
    { text: "It's super fast and secure!", sender: 'other', delay: 1600 },
    { text: "Try typing a message below ⬇️", sender: 'other', delay: 2800 },
  ];

  const autoReplies = [
    "That's awesome! 🎉",
    "Ricky Chat is blazing fast ⚡",
    "We support voice, images & more 📸",
    "End-to-end encrypted too! 🔒",
    "Group chats are amazing here 💬",
    "Welcome aboard! 🚀",
  ];

  useEffect(() => {
    demoConversation.forEach((msg, i) => {
      setTimeout(() => {
        if (i > 0) setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, { ...msg, id: `demo-${i}` }]);
          if (i === demoConversation.length - 1) setPhase(1);
        }, i > 0 ? 1000 : 0);
      }, msg.delay);
    });
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg = { text: inputValue, sender: 'me', id: `user-${Date.now()}` };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Auto reply
    setTimeout(() => setIsTyping(true), 400);
    setTimeout(() => {
      setIsTyping(false);
      const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      setMessages(prev => [...prev, { text: reply, sender: 'other', id: `reply-${Date.now()}` }]);
    }, 1800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="relative w-full max-w-[320px] sm:max-w-[380px] mx-auto">
      {/* Glow effect behind */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-[3rem] blur-2xl opacity-60 animate-pulse-slow" />

      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-b from-base-300/80 to-base-200/80 p-[3px] shadow-2xl shadow-primary/10 backdrop-blur-sm">
        <div className="rounded-[2.4rem] bg-base-100 overflow-hidden">
          {/* Notch */}
          <div className="flex justify-center pt-2 pb-1 bg-base-100">
            <div className="w-28 h-5 bg-base-300/60 rounded-full" />
          </div>

          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-base-200/80 bg-base-100/95 backdrop-blur-sm">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary/30">
                R
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-base-100 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-base-content">Ricky Chat</p>
              <p className="text-[11px] text-emerald-500 font-medium">Online now</p>
            </div>
            <div className="flex gap-3 text-base-content/30">
              <Phone className="size-4 hover:text-primary transition-colors cursor-pointer" />
              <Video className="size-4 hover:text-primary transition-colors cursor-pointer" />
            </div>
          </div>

          {/* Messages area */}
          <div ref={chatRef} className="px-4 py-3 space-y-2.5 h-[240px] sm:h-[300px] overflow-y-auto custom-scrollbar bg-gradient-to-b from-base-100 to-base-200/30">
            {/* Date chip */}
            <div className="flex justify-center mb-3">
              <span className="text-[10px] bg-base-200/80 backdrop-blur-sm text-base-content/40 px-3 py-1 rounded-full font-medium">
                Today
              </span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-message-in`}
              >
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 shadow-sm
                  ${msg.sender === 'me'
                    ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-content rounded-br-sm'
                    : 'bg-base-200/80 backdrop-blur-sm text-base-content rounded-bl-sm'
                  }`}>
                  <p className="text-[13px] leading-relaxed">{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-0.5 
                    ${msg.sender === 'me' ? 'text-primary-content/50' : 'text-base-content/30'}`}>
                    <span className="text-[9px]">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.sender === 'me' && <CheckCheck className="size-3" />}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-message-in">
                <div className="bg-base-200/80 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-base-content/30 rounded-full animate-typing-dot" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-base-content/30 rounded-full animate-typing-dot" style={{ animationDelay: '200ms' }} />
                    <span className="w-2 h-2 bg-base-content/30 rounded-full animate-typing-dot" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-base-200/50 bg-base-100">
            <div className="flex gap-1.5">
              <button className="p-1.5 rounded-full hover:bg-base-200 transition-colors">
                <Smile className="size-5 text-base-content/30 hover:text-primary transition-colors" />
              </button>
              <button className="p-1.5 rounded-full hover:bg-base-200 transition-colors">
                <Paperclip className="size-5 text-base-content/30 hover:text-primary transition-colors" />
              </button>
            </div>
            <input
              type="text"
              className="flex-1 bg-base-200/60 rounded-full px-4 py-2.5 text-sm text-base-content placeholder:text-base-content/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-base-200 transition-all"
              placeholder={phase >= 1 ? "Type a message to try..." : "Waiting..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={phase < 1}
            />
            {inputValue.trim() ? (
              <button
                onClick={handleSend}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all"
              >
                <Send className="size-4" />
              </button>
            ) : (
              <button className="w-9 h-9 rounded-full bg-base-200/60 flex items-center justify-center hover:bg-base-200 transition-colors">
                <Mic className="size-4 text-base-content/30" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating decorations */}
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-primary/15 to-secondary/15 rounded-3xl rotate-12 blur-md animate-float" />
      <div className="absolute -bottom-6 -left-10 w-20 h-20 bg-gradient-to-br from-secondary/15 to-accent/15 rounded-2xl -rotate-12 blur-md animate-float animation-delay-2000" />
      <div className="absolute top-1/3 -left-6 w-3 h-3 bg-primary/40 rounded-full animate-float animation-delay-4000" />
      <div className="absolute top-1/4 -right-4 w-2 h-2 bg-secondary/40 rounded-full animate-float" />
    </div>
  );
};

/* ═══════════════════════════════════════════
   Feature Card with Hover Effects
   ═══════════════════════════════════════════ */
const FeatureCard = ({ icon, title, description, gradient, delay }) => {
  const [ref, isVisible] = useInView();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={ref}
      className={`group relative bg-base-100/80 backdrop-blur-sm rounded-3xl p-7 sm:p-8 border border-base-200/80
        hover:border-primary/20 transition-all duration-700 hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/8
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
      `}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover glow */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} transition-opacity duration-500 ${isHovered ? 'opacity-[0.04]' : 'opacity-0'}`} />

      {/* Icon */}
      <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-5 shadow-lg transition-all duration-500 ${isHovered ? 'scale-110 rotate-3 shadow-xl' : ''}`}>
        {icon}
      </div>

      <h3 className="text-lg font-bold text-base-content mb-2 group-hover:text-primary transition-colors duration-300">{title}</h3>
      <p className="text-base-content/50 leading-relaxed text-sm">{description}</p>

      {/* Arrow hint */}
      <div className={`mt-4 flex items-center gap-1 text-sm font-medium text-primary transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
        Learn more <ArrowRight className="size-3.5" />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   Notification Demo
   ═══════════════════════════════════════════ */
const NotificationDemo = () => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const [ref, isInView] = useInView({ repeat: true });

  useEffect(() => {
    if (isInView) {
      setVisible(true);
      setProgress(100);
      const start = Date.now();
      const duration = 4000;
      const interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          setVisible(false);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isInView]);

  return (
    <div ref={ref} className="relative">
      <div className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}>
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 backdrop-blur-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/10 shadow-xl shadow-emerald-500/10 max-w-sm">
          <div className="flex items-start gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-base-content">Alex sent a message</p>
              <p className="text-xs text-base-content/50 mt-0.5 truncate">Hey! Are you coming to the meetup tonight? 🎉</p>
            </div>
            <span className="text-[10px] text-base-content/30 flex-shrink-0 mt-0.5">now</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-base-content/5">
            <div className="h-full bg-emerald-400 rounded-full transition-all duration-75 ease-linear" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   Testimonial Card
   ═══════════════════════════════════════════ */
const TestimonialCard = ({ name, role, text, gradient, delay }) => {
  const [ref, isVisible] = useInView();
  return (
    <div ref={ref}
      className={`bg-base-100/70 backdrop-blur-sm rounded-2xl p-6 border border-base-200 transition-all duration-700
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => <Star key={i} className="size-4 text-amber-400 fill-amber-400" />)}
      </div>
      <p className="text-base-content/70 text-sm leading-relaxed mb-5">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold`}>
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-base-content">{name}</p>
          <p className="text-xs text-base-content/40">{role}</p>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   Main Landing Page
   ═══════════════════════════════════════════ */
const LandingPage = () => {
  const { theme, setTheme } = useThemeStore();
  const [scrollY, setScrollY] = useState(0);
  const [heroRef, heroVisible] = useInView();
  const [featuresHeaderRef, featuresHeaderVisible] = useInView();
  const [notifRef, notifVisible] = useInView();
  const [ctaRef, ctaVisible] = useInView();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const features = [
    { icon: <Zap className="size-6" />, title: "Instant Messaging", description: "Messages delivered in milliseconds with real-time sync across all your devices. Never miss a beat.", gradient: "from-amber-400 to-orange-500" },
    { icon: <Shield className="size-6" />, title: "End-to-End Encrypted", description: "Military-grade encryption ensures your private conversations stay truly private. No compromises.", gradient: "from-emerald-400 to-teal-500" },
    { icon: <Users className="size-6" />, title: "Group Chats", description: "Create groups with unlimited members, share media, assign admins, and collaborate effortlessly.", gradient: "from-violet-400 to-purple-500" },
    { icon: <Globe className="size-6" />, title: "Cross Platform", description: "Seamlessly switch between phone, tablet, and desktop. Your chats follow you everywhere.", gradient: "from-blue-400 to-cyan-500" },
    { icon: <MessageCircle className="size-6" />, title: "Rich Media", description: "Send voice notes, share images, react with emojis, reply to messages, and much more.", gradient: "from-pink-400 to-rose-500" },
    { icon: <Sparkles className="size-6" />, title: "Status Stories", description: "Share your moments with disappearing stories that auto-delete after 24 hours.", gradient: "from-indigo-400 to-blue-500" },
  ];

  const testimonials = [
    { name: "Priya Sharma", role: "Product Designer", text: "Ricky Chat has the most beautiful UI of any messaging app I've used. The animations are so smooth!", gradient: "from-pink-400 to-rose-500" },
    { name: "James Wilson", role: "Software Engineer", text: "The speed is incredible. Messages feel truly instant. And the group features are exactly what our team needed.", gradient: "from-blue-400 to-cyan-500" },
    { name: "Sarah Chen", role: "Startup Founder", text: "We moved our entire team communication to Ricky. The encryption and privacy features give us peace of mind.", gradient: "from-violet-400 to-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-base-100 overflow-x-hidden">

      {/* ═══ Sticky Navbar ═══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrollY > 30
          ? 'bg-base-100/70 backdrop-blur-2xl shadow-lg shadow-base-content/5 border-b border-base-200/50'
          : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-base-100 animate-pulse" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ricky
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-base-200/80 transition-all group"
              aria-label="Toggle theme"
            >
              {theme === 'dark'
                ? <Sun className="size-[18px] text-base-content/50 group-hover:text-amber-400 transition-colors" />
                : <Moon className="size-[18px] text-base-content/50 group-hover:text-indigo-500 transition-colors" />
              }
            </button>

            <Link to="/login"
              className="btn btn-ghost btn-sm sm:btn-md text-base-content/70 hover:text-base-content font-semibold rounded-xl">
              Sign In
            </Link>
            <Link to="/signup">
              <RippleButton className="btn btn-primary btn-sm sm:btn-md rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2 font-semibold border-0">
                Get Started <ArrowRight className="size-4" />
              </RippleButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ Hero Section ═══ */}
      <section className="relative min-h-[calc(100dvh-1rem)] sm:min-h-screen flex items-center pt-20 sm:pt-24 pb-8 sm:pb-12" ref={heroRef}>
        <GradientBlobs />
        <FloatingParticles />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-6 items-center">
            {/* Left Content */}
            <div className={`text-center lg:text-left space-y-7 pt-8 lg:pt-0 transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/8 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/15 backdrop-blur-sm group hover:bg-primary/12 hover:border-primary/25 transition-all cursor-default">
                <Sparkles className="size-4 animate-pulse" />
                <span>Now with Voice & Stories</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-black leading-[1.1] tracking-tight">
                <span className="text-base-content">Chat Without</span>
                <br />
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
                    Boundaries
                  </span>
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-base-content/50 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Experience next-gen messaging — lightning fast, beautifully designed, and encrypted end-to-end.
                Your conversations, your way.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <Link to="/signup">
                  <RippleButton className="btn btn-primary btn-lg rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2.5 text-base px-8 font-bold border-0 w-full sm:w-auto">
                    Start Chatting Free
                    <ArrowRight className="size-5" />
                  </RippleButton>
                </Link>
                <a href="#features"
                  className="btn btn-lg rounded-2xl border-2 border-base-300 hover:border-primary/30 hover:bg-base-200/50 gap-2 text-base font-semibold bg-transparent transition-all">
                  Explore Features
                  <ChevronDown className="size-5" />
                </a>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-5 justify-center lg:justify-start pt-4">
                <div className="flex -space-x-2.5">
                  {['from-violet-400 to-purple-500', 'from-blue-400 to-cyan-500', 'from-emerald-400 to-teal-500', 'from-amber-400 to-orange-500'].map((g, i) => (
                    <div key={i} className={`w-9 h-9 rounded-full bg-gradient-to-br ${g} border-[2.5px] border-base-100 flex items-center justify-center text-white text-[11px] font-bold shadow-sm`}>
                      {['A', 'R', 'M', 'K'][i]}
                    </div>
                  ))}
                  <div className="w-9 h-9 rounded-full bg-base-200 border-[2.5px] border-base-100 flex items-center justify-center text-[10px] font-bold text-base-content/50">
                    +50K
                  </div>
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="size-3.5 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-xs text-base-content/40 mt-0.5">Loved by 50K+ users</p>
                </div>
              </div>
            </div>

            {/* Right — Interactive Chat Demo */}
            <div className={`relative flex justify-center lg:justify-end transition-all duration-1000 delay-200 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transform: `translateY(${Math.max(-scrollY * 0.06, -50)}px)` }}>
              <InteractiveChatDemo />
            </div>
          </div>
        </div>

        {/* Scroll indicator — hidden on small mobile */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1">
          <div className="w-6 h-10 rounded-full border-2 border-base-content/15 flex justify-center pt-2">
            <div className="w-1 h-2.5 bg-base-content/30 rounded-full animate-scroll-indicator" />
          </div>
        </div>
      </section>

      {/* ═══ Stats Section ═══ */}
      <section className="relative py-14 sm:py-20 md:py-28 border-y border-base-200/50">
        <div className="absolute inset-0 bg-gradient-to-b from-base-200/30 via-transparent to-base-200/30" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
            <AnimatedCounter end={50000} suffix="+" label="Active Users" />
            <AnimatedCounter end={2} suffix="M+" label="Messages Sent" />
            <AnimatedCounter end={120} suffix="+" label="Countries" />
            <AnimatedCounter end={99} suffix=".9%" label="Uptime" />
          </div>
        </div>
      </section>

      {/* ═══ Features Section ═══ */}
      <section id="features" className="relative py-24 sm:py-32">
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-0 w-[350px] h-[350px] bg-secondary/5 rounded-full blur-[100px]" />

        <div className="container mx-auto px-4 sm:px-6 relative">
          <div ref={featuresHeaderRef}
            className={`text-center max-w-2xl mx-auto mb-16 sm:mb-20 transition-all duration-700
            ${featuresHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 bg-secondary/8 text-secondary px-4 py-2 rounded-full text-sm font-semibold border border-secondary/15 mb-6">
              <Sparkles className="size-4" />
              Powerful Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-base-content mb-5 leading-tight">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Stay Connected
              </span>
            </h2>
            <p className="text-base-content/45 text-lg leading-relaxed">
              Packed with features designed to make your conversations richer, safer, and more meaningful.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Notification Demo Section ═══ */}
      <section className="relative py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div ref={notifRef}
            className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${notifVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`space-y-6 transition-all duration-700 delay-100 ${notifVisible ? 'translate-x-0' : '-translate-x-12'}`}>
              <div className="inline-flex items-center gap-2 bg-emerald-500/8 text-emerald-500 px-4 py-2 rounded-full text-sm font-semibold border border-emerald-500/15">
                <Bell className="size-4" />
                Smart Notifications
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-base-content leading-tight">
                Beautiful Notifications
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                  That Don't Annoy
                </span>
              </h2>
              <p className="text-base-content/50 text-lg leading-relaxed max-w-md">
                Our custom notification system is designed to be informative yet non-intrusive.
                Smooth animations, auto-dismiss with progress, and beautiful styling.
              </p>
              <ul className="space-y-3 text-sm text-base-content/60">
                {['Smooth slide-in & fade-out animations', 'Auto-dismiss with visual progress bar', 'Contextual colors for success, error & info', 'Non-blocking — never disrupts your flow'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCheck className="size-3 text-emerald-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`flex justify-center lg:justify-end transition-all duration-700 delay-300 ${notifVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
              <div className="space-y-4">
                <NotificationDemo />
                {/* Static examples */}
                <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 backdrop-blur-xl bg-gradient-to-r from-blue-500/15 to-cyan-500/10 shadow-lg max-w-sm">
                  <div className="flex items-start gap-3 p-4">
                    <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                      <Heart className="size-3" />
                    </div>
                    <p className="text-sm font-medium text-base-content">Sarah reacted ❤️ to your message</p>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 backdrop-blur-xl bg-gradient-to-r from-violet-500/15 to-purple-500/10 shadow-lg max-w-sm">
                  <div className="flex items-start gap-3 p-4">
                    <div className="w-5 h-5 rounded-full bg-violet-400 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                      <Users className="size-3" />
                    </div>
                    <p className="text-sm font-medium text-base-content">You were added to "Design Team"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section className="relative py-20 sm:py-28 bg-base-200/20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-base-content mb-3">
              Loved by <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Thousands</span>
            </h2>
            <p className="text-base-content/45 text-lg">See what our users have to say</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => <TestimonialCard key={i} {...t} delay={i * 120} />)}
          </div>
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden" ref={ctaRef}>
        {/* Full-width background gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-base-100 via-base-100 to-base-200" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className={`relative transition-all duration-1000 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Main CTA Card */}
            <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem]">
              {/* Multi-layer gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary/90 to-accent/80" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,0,0,0.12),transparent_50%)]" />

              {/* Animated grid pattern overlay */}
              <div className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }} />

              {/* Floating decorative elements */}
              <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center rotate-12 animate-float border border-white/10">
                  <MessageSquare className="size-5 sm:size-7 text-white/60" />
                </div>
              </div>
              <div className="absolute top-6 right-16 sm:top-10 sm:right-24 hidden sm:block">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center -rotate-6 animate-float animation-delay-2000 border border-white/10">
                  <Shield className="size-4 sm:size-5 text-white/50" />
                </div>
              </div>
              <div className="absolute bottom-10 left-16 sm:bottom-14 sm:left-28 hidden sm:block">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-white/8 backdrop-blur-sm flex items-center justify-center rotate-6 animate-float animation-delay-4000 border border-white/10">
                  <Zap className="size-4 sm:size-6 text-white/50" />
                </div>
              </div>
              <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center -rotate-12 animate-float animation-delay-2000 border border-white/10">
                  <Heart className="size-5 sm:size-7 text-white/60" />
                </div>
              </div>

              {/* Floating mini chat bubbles */}
              <div className="absolute top-1/4 right-8 sm:right-16 hidden md:block animate-float">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl rounded-br-sm px-4 py-2 border border-white/10">
                  <p className="text-white/80 text-xs font-medium">Love this app! 🎉</p>
                </div>
              </div>
              <div className="absolute bottom-1/4 left-8 sm:left-16 hidden md:block animate-float animation-delay-4000">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-2 border border-white/10">
                  <p className="text-white/80 text-xs font-medium">So fast! ⚡</p>
                </div>
              </div>

              {/* Glowing orbs */}
              <div className="absolute -top-20 -left-20 w-40 h-40 sm:w-60 sm:h-60 bg-white/15 rounded-full blur-[80px]" />
              <div className="absolute -bottom-20 -right-20 w-48 h-48 sm:w-72 sm:h-72 bg-accent/20 rounded-full blur-[100px]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-secondary/20 rounded-full blur-[60px]" />

              {/* Content */}
              <div className="relative z-10 px-6 py-14 sm:px-12 sm:py-20 lg:px-20 lg:py-24">
                <div className="max-w-2xl mx-auto text-center">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-white/15 mb-6 sm:mb-8">
                    <Sparkles className="size-3.5 animate-pulse" />
                    Free forever · No credit card required
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black text-white mb-5 sm:mb-6 leading-[1.15] tracking-tight">
                    Ready to Experience
                    <br />
                    <span className="relative inline-block">
                      the Future of Chat?
                      <svg className="absolute -bottom-2 left-0 w-full h-3 text-white/20" viewBox="0 0 200 8" fill="none">
                        <path d="M1 5.5C47 2 153 2 199 5.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </span>
                  </h2>

                  <p className="text-white/70 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-lg mx-auto leading-relaxed px-2">
                    Join 50,000+ people already using Ricky for lightning-fast, encrypted messaging.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
                    <Link to="/signup" className="w-full sm:w-auto">
                      <RippleButton className="btn btn-lg bg-white text-primary hover:bg-white/95 rounded-2xl border-0 shadow-[0_8px_32px_rgba(0,0,0,0.15)] gap-2.5 text-base px-8 font-bold hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 w-full sm:w-auto hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
                        <span>Create Free Account</span>
                        <ArrowRight className="size-5" />
                      </RippleButton>
                    </Link>
                    <Link to="/login"
                      className="btn btn-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 rounded-2xl border border-white/20 text-base font-semibold transition-all duration-300 w-full sm:w-auto">
                      Sign In
                    </Link>
                  </div>

                  {/* Trust indicators */}
                  <div className="flex items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-10 flex-wrap">
                    <div className="flex items-center gap-1.5 text-white/50 text-xs sm:text-sm">
                      <Shield className="size-3.5 sm:size-4" />
                      <span>End-to-end encrypted</span>
                    </div>
                    <div className="w-1 h-1 bg-white/20 rounded-full hidden sm:block" />
                    <div className="flex items-center gap-1.5 text-white/50 text-xs sm:text-sm">
                      <Zap className="size-3.5 sm:size-4" />
                      <span>99.9% uptime</span>
                    </div>
                    <div className="w-1 h-1 bg-white/20 rounded-full hidden sm:block" />
                    <div className="flex items-center gap-1.5 text-white/50 text-xs sm:text-sm">
                      <Globe className="size-3.5 sm:size-4" />
                      <span>120+ countries</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-base-200/50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base-content text-lg">Ricky</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-base-content/40">
              <a href="#features" className="hover:text-base-content transition-colors">Features</a>
              <Link to="/login" className="hover:text-base-content transition-colors">Sign In</Link>
              <Link to="/signup" className="hover:text-base-content transition-colors">Sign Up</Link>
            </div>
            <p className="text-sm text-base-content/30">
              © {new Date().getFullYear()} Ricky Chat. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
