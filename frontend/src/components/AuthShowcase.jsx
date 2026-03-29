import React, { useState, useEffect } from 'react';
import { MessageSquare, Shield, Zap, Globe, Heart, Star, Send, CheckCheck } from 'lucide-react';

const AuthShowcase = ({ title, subtitle }) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const demoConversation = [
    { text: "Hey! Just joined Ricky Chat 👋", sender: 'me', delay: 800 },
    { text: "Awesome! The interface is so smooth ✨", sender: 'other', delay: 2000 },
    { text: "I know right? And it's fully encrypted 🔒", sender: 'me', delay: 3500 },
  ];

  useEffect(() => {
    let timeoutIds = [];
    let currentDelay = 0;

    demoConversation.forEach((msg, i) => {
      currentDelay += msg.delay;
      
      const typingTimeout = setTimeout(() => {
        if (msg.sender === 'other') setIsTyping(true);
      }, currentDelay - 1000);
      timeoutIds.push(typingTimeout);

      const msgTimeout = setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { ...msg, id: `demo-auth-${i}` }]);
      }, currentDelay);
      timeoutIds.push(msgTimeout);
    });

    return () => timeoutIds.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="hidden lg:flex flex-col justify-center items-center p-12 relative overflow-hidden bg-base-200/50">
      {/* Background Gradients & Blobs */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-secondary/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

      <div className="w-full max-w-lg relative z-10">
        {/* Animated Chat Preview UI */}
        <div className="relative w-full max-w-sm mx-auto mb-12">
          {/* Glow effect behind */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-[2.5rem] blur opacity-20 animate-pulse-slow" />
          
          <div className="relative rounded-[2rem] bg-base-100/80 backdrop-blur-xl border border-base-200 shadow-2xl overflow-hidden p-1">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-base-200 bg-base-100/50">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shadow-md">
                  R
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-base-100 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-base-content">Ricky Chat</p>
                <p className="text-[10px] text-emerald-500 font-medium">Online now</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="px-4 py-4 space-y-3 h-[220px] bg-gradient-to-b from-base-100/50 to-base-200/30 overflow-hidden flex flex-col justify-end">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-message-in`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 shadow-sm
                    ${msg.sender === 'me'
                      ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-content rounded-br-sm'
                      : 'bg-base-200/80 backdrop-blur-sm text-base-content rounded-bl-sm border border-base-300'
                    }`}>
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-0.5 
                      ${msg.sender === 'me' ? 'text-primary-content/50' : 'text-base-content/30'}`}>
                      <span className="text-[9px]">now</span>
                      {msg.sender === 'me' && <CheckCheck className="size-3" />}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start animate-message-in">
                  <div className="bg-base-200/80 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-2 border border-base-300">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-base-content/30 rounded-full animate-typing-dot" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-base-content/30 rounded-full animate-typing-dot" style={{ animationDelay: '200ms' }} />
                      <span className="w-1.5 h-1.5 bg-base-content/30 rounded-full animate-typing-dot" style={{ animationDelay: '400ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input Mockup */}
            <div className="px-3 py-2 border-t border-base-200 bg-base-100/50 flex gap-2">
               <div className="h-8 flex-1 bg-base-200 rounded-full" />
               <div className="w-8 h-8 rounded-full bg-primary flex flex-shrink-0" />
            </div>
          </div>

          {/* Floating decorative cards */}
          <div className="absolute top-10 -left-12 bg-base-100/80 backdrop-blur-md px-3 py-2 rounded-xl border border-base-200 shadow-xl animate-float animation-delay-2000 flex items-center gap-2">
            <Shield className="size-4 text-emerald-500" />
            <span className="text-xs font-semibold text-base-content">Secure</span>
          </div>
          <div className="absolute bottom-16 -right-10 bg-base-100/80 backdrop-blur-md px-3 py-2 rounded-xl border border-base-200 shadow-xl animate-float animation-delay-4000 flex items-center gap-2">
            <Zap className="size-4 text-amber-500" />
            <span className="text-xs font-semibold text-base-content">Fast</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-base-content mb-3">{title}</h2>
          <p className="text-base-content/60 text-sm leading-relaxed max-w-sm mx-auto mb-8">
            {subtitle}
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-col items-center gap-3 border-t border-base-200/60 pt-6 mt-6">
            <div className="flex -space-x-2">
              {['from-violet-400 to-purple-500', 'from-blue-400 to-cyan-500', 'from-emerald-400 to-teal-500'].map((g, i) => (
                <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-base-200 flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                  {['JD', 'AM', 'SK'][i]}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-base-300 border-2 border-base-200 flex items-center justify-center text-[9px] font-bold text-base-content/60">
                +50k
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-base-content/50 font-medium">
              <span className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="size-3 text-amber-400 fill-amber-400" />)}
              </span>
              Trusted by users worldwide
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthShowcase;
