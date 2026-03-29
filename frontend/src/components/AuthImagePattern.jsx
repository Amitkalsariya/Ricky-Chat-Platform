import React from "react";
import { MessageSquare, Shield, Zap, Heart, Star, Users } from "lucide-react";

const AuthImagePattern = ({ title, subtitle }) => {
  const icons = [MessageSquare, Shield, Zap, Heart, Star, Users, MessageSquare, Shield, Zap];

  return (
    <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary/5 via-base-200 to-secondary/5 p-12 relative overflow-hidden">
      {/* Background decorative orbs */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-60 h-60 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="max-w-md text-center relative z-10">
        {/* Animated grid */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {icons.map((Icon, i) => (
            <div
              key={i}
              className={`
                aspect-square rounded-2xl flex items-center justify-center
                transition-all duration-500 hover:scale-110
                ${i % 3 === 0
                  ? 'bg-primary/10 text-primary'
                  : i % 3 === 1
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-accent/10 text-accent'
                }
                ${i % 2 === 0 ? 'animate-pulse' : ''}
              `}
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '3s',
              }}
            >
              <Icon className="size-7" />
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-extrabold mb-4 text-base-content">{title}</h2>
        <p className="text-base-content/50 text-lg leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
