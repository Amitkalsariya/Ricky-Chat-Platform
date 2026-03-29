import React from 'react';
import { MessageSquare, Users, Sparkles, ArrowLeft, Zap, Shield, Send } from 'lucide-react';

const NoChatSelect = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-4 sm:p-16 bg-base-100/50 relative overflow-hidden">
      {/* Animated background decorations */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-[80px] animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-secondary/5 rounded-full blur-[80px] animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full blur-[100px] animate-pulse-slow" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

      <div className="max-w-md text-center space-y-8 relative z-10 animate-fade-in-up">
        {/* Animated icon with floating elements */}
        <div className="flex justify-center mb-2">
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-[2rem] blur-xl animate-pulse-slow" />
            
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border border-primary/10 backdrop-blur-sm">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>

            {/* Floating mini icons */}
            <div className="absolute -top-3 -right-4 w-10 h-10 rounded-xl bg-secondary/10 backdrop-blur-sm border border-secondary/10 flex items-center justify-center animate-float"
                 style={{ animationDelay: '0.5s' }}>
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <div className="absolute -bottom-2 -left-4 w-9 h-9 rounded-lg bg-accent/10 backdrop-blur-sm border border-accent/10 flex items-center justify-center animate-float"
                 style={{ animationDelay: '1.5s' }}>
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div className="absolute top-1/2 -right-8 w-7 h-7 rounded-lg bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/10 flex items-center justify-center animate-float animation-delay-4000">
              <Send className="w-3 h-3 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
              Ricky!
            </span>
          </h2>
          <p className="text-base-content/50 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
            Select a conversation from the sidebar to start chatting with your friends
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-medium">
            <Zap className="size-3" />
            Real-time
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 text-xs font-medium">
            <Shield className="size-3" />
            Encrypted
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/5 border border-secondary/10 text-secondary text-xs font-medium">
            <Users className="size-3" />
            Group Chats
          </div>
        </div>

        {/* Hint */}
        <div className="flex items-center gap-2 justify-center text-sm text-base-content/25 pt-2">
          <ArrowLeft className="size-4 md:block hidden" />
          <span className="hidden md:inline">Choose a chat from the sidebar</span>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelect;
