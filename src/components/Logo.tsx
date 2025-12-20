import React from 'react';

export default function Logo({ size = "normal" }: { size?: "small" | "normal" | "large" }) {
  const sizeClasses = {
    small: "text-xl",
    normal: "text-2xl",
    large: "text-4xl"
  };

  const iconSizes = {
    small: 24,
    normal: 32,
    large: 48
  };

  return (
    <div className={`font-black tracking-tighter flex items-center gap-2 text-indigo-600 ${sizeClasses[size]}`}>
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform -rotate-45">
          <path d="M2 12h20"/><path d="m13 2 9 10-9 10"/><path d="M2 12l5-5m-5 5l5 5"/>
        </svg>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
      </div>
      <span className="text-slate-900">Tripenzí</span>
    </div>
  );
}