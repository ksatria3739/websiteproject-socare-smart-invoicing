'use client';

import React from 'react';

interface SocareLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export function SocareLogo({
  variant = 'light',
  size = 'md',
  showSubtitle = true,
}: SocareLogoProps) {
  const imgHeight =
    size === 'sm' ? 'h-8' : size === 'lg' ? 'h-12' : 'h-10';

  return (
    <div className="inline-flex items-center gap-3 select-none group">
      {/* Official Socare Logo Container */}
      <div
        className={`relative flex items-center rounded-xl px-3 py-1.5 transition-all duration-300 group-hover:scale-[1.02] ${
          variant === 'light'
            ? 'bg-[#192730] shadow-md border border-slate-700/80'
            : 'bg-slate-900/90 border border-slate-700/80 shadow-inner'
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-socare.webp"
          alt="PT Socare Group International Logo"
          className={`${imgHeight} w-auto object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]`}
        />
      </div>

      {showSubtitle && (
        <div className="hidden sm:flex flex-col">
          <span
            className={`text-xs font-extrabold tracking-tight leading-tight ${
              variant === 'light' ? 'text-[#192730]' : 'text-white'
            }`}
          >
            PT Socare Group International
          </span>
          <span
            className={`text-[10px] font-medium ${
              variant === 'light' ? 'text-slate-500' : 'text-sky-300/90'
            }`}
          >
            So Safe and Easy Partner
          </span>
        </div>
      )}
    </div>
  );
}
