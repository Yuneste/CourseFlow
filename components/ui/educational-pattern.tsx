'use client';

import React from 'react';

export const EducationalPattern = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />
      
      {/* Academic pattern - graduation caps and books */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.03]" 
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern 
            id="academic-pattern" 
            x="0" 
            y="0" 
            width="200" 
            height="200" 
            patternUnits="userSpaceOnUse"
          >
            {/* Graduation cap */}
            <g transform="translate(50, 50)">
              <path 
                d="M 0 20 L 50 0 L 100 20 L 50 40 Z" 
                fill="currentColor"
                className="text-gray-900"
              />
              <path 
                d="M 25 20 L 25 35 L 30 40 L 35 35 L 35 20" 
                fill="currentColor"
                className="text-gray-900"
              />
              <circle cx="30" cy="42" r="3" fill="currentColor" className="text-gray-900" />
            </g>
            
            {/* Book */}
            <g transform="translate(150, 150)">
              <rect 
                x="0" 
                y="0" 
                width="40" 
                height="30" 
                rx="2" 
                fill="currentColor"
                className="text-gray-900"
              />
              <line 
                x1="5" 
                y1="5" 
                x2="35" 
                y2="5" 
                stroke="white" 
                strokeWidth="2"
              />
              <line 
                x1="5" 
                y1="10" 
                x2="35" 
                y2="10" 
                stroke="white" 
                strokeWidth="2"
              />
            </g>
            
            {/* Pencil */}
            <g transform="translate(100, 100) rotate(45 15 15)">
              <rect 
                x="0" 
                y="0" 
                width="8" 
                height="30" 
                fill="currentColor"
                className="text-gray-900"
              />
              <polygon 
                points="0,30 4,35 8,30" 
                fill="currentColor"
                className="text-gray-900"
              />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#academic-pattern)" />
      </svg>
      
      {/* Animated floating elements */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${20 + i * 2}s`
            }}
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/5 to-primary/10 blur-3xl" />
          </div>
        ))}
      </div>
    </div>
  );
};