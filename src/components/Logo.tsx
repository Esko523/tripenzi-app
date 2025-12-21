import React from 'react';

type LogoProps = {
  size?: 'small' | 'normal' | 'large' | 'xl';
  variant?: 'icon' | 'badge' | 'full';
  className?: string;
};

export default function Logo({ size = 'normal', variant = 'icon', className = '' }: LogoProps) {
  // Určení velikosti (pixelů)
  const sizeMap = {
    small: 24,
    normal: 40,
    large: 64,
    xl: 120,
  };

  const pxSize = sizeMap[size];

  // Definice gradientu (použijeme ho uvnitř SVG)
  const GradientDef = () => (
    <defs>
      <linearGradient id="logo_gradient" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4F46E5" /> {/* Indigo */}
        <stop offset="1" stopColor="#10B981" /> {/* Emerald */}
      </linearGradient>
    </defs>
  );

  // Cesta vlaštovky (Path data)
  const SwallowPath = ({ strokeColor, strokeWidth = 32 }: { strokeColor: string, strokeWidth?: number }) => (
    <>
      <path 
        d="M116.5 268.5L234.5 388L414.5 118M414.5 118L256.5 248M414.5 118L116.5 268.5Z" 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M234.5 388V285" 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </>
  );

  // --- VARIANTA 2: BADGE (Jako App Icon - bílá vlaštovka na gradientu) ---
  if (variant === 'badge') {
    return (
      <svg 
        width={pxSize} 
        height={pxSize} 
        viewBox="0 0 512 512" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`shadow-xl shadow-indigo-500/20 rounded-2xl ${className}`}
      >
        <GradientDef />
        <rect width="512" height="512" rx="120" fill="url(#logo_gradient)" />
        {/* Jemný glow efekt pod linkou */}
        <g filter="url(#glow_filter)">
           <SwallowPath strokeColor="white" strokeWidth={32} />
        </g>
        {/* Filtr pro glow */}
        <defs>
            <filter id="glow_filter" x="0" y="0" width="512" height="512" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="8"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
            </filter>
            <linearGradient id="logo_gradient" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4F46E5" />
                <stop offset="1" stopColor="#10B981" />
            </linearGradient>
        </defs>
      </svg>
    );
  }

  // --- VARIANTA 1 & 3: ICON (Gradientní vlaštovka na průhledném pozadí) ---
  const IconSvg = (
    <svg 
      width={pxSize} 
      height={pxSize} 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <GradientDef />
      {/* Zde použijeme gradient přímo na linku (stroke) */}
      <SwallowPath strokeColor="url(#logo_gradient)" strokeWidth={40} />
    </svg>
  );

  if (variant === 'full') {
    // Varianta s textem
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {IconSvg}
        <span 
            className="font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-emerald-500"
            style={{ fontSize: size === 'small' ? '1.2rem' : (size === 'large' ? '2.5rem' : '1.5rem') }}
        >
            Tripenzi
        </span>
      </div>
    );
  }

  // Default: jen ikona (Variant 1)
  return IconSvg;
}