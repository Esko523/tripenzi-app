import React from 'react';

// Varianta A: Společná cesta (Pin + Přátelé) - S většími mezerami v textu
export default function Logo({ size = 'normal', className = '' }: { size?: 'small' | 'normal' | 'large', className?: string }) {
  const sizes = {
    small: { wrap: 'gap-1', icon: 20, text: 'text-lg' },
    normal: { wrap: 'gap-2', icon: 28, text: 'text-2xl' },
    large: { wrap: 'gap-3', icon: 40, text: 'text-4xl' },
  };
  const s = sizes[size];

  return (
    <div className={`flex items-center ${s.wrap} ${className}`}>
      <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-1.5 rounded-xl shadow-sm text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="currentColor">
          {/* Stylizovaná skupina přátel tvořící pin/lokaci */}
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.21 7.15-5 10.64C9.21 16.15 7 11.88 7 9z"/>
          <circle cx="12" cy="9" r="2.5"/>
          <circle cx="8.5" cy="14" r="1.5" opacity="0.7"/>
          <circle cx="15.5" cy="14" r="1.5" opacity="0.7"/>
        </svg>
      </div>
      {/* ZMĚNA ZDE: tracking-wide (větší mezery) místo tracking-tighter */}
      <h1 className={`${s.text} font-black tracking-wide text-slate-900`}>
        Trip<span className="text-indigo-600">enzi</span>
      </h1>
    </div>
  );
}