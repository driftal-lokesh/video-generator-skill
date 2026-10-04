// Third-party app marks drawn as SVG (never download logo files). Add others the same way: simple
// geometry in official colours, the app name written next to the mark.
import React from 'react';

type P = { size: number };

export const TeamsLogo: React.FC<P> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs>
      <linearGradient id="teams-tile" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5A62C3" />
        <stop offset="1" stopColor="#3940AB" />
      </linearGradient>
    </defs>
    <circle cx={83} cy={25} r={10} fill="#5059C9" />
    <path d="M68 40h27a3 3 0 0 1 3 3v22a15 15 0 0 1-15 15 15 15 0 0 1-15-15z" fill="#5059C9" />
    <circle cx={57} cy={21} r={14} fill="#7B83EB" />
    <path d="M34 40h43a3 3 0 0 1 3 3v26a23 23 0 0 1-23 23 23 23 0 0 1-23-23z" fill="#7B83EB" />
    <rect x={4} y={26} width={54} height={54} rx={7} fill="url(#teams-tile)" />
    <path d="M17 40h28v7.5H35V70h-8V47.5H17z" fill="#FFFFFF" />
  </svg>
);

export const SlackLogo: React.FC<P> = ({ size }) => (
  <svg width={size} height={size} viewBox="-1 -1 26 26">
    <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" />
    <path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" />
    <path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" />
    <path fill="#ECB22E" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
  </svg>
);

export const NotionLogo: React.FC<P> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M14 12l58-5 16 11v66l-62 6-14-13z" fill="#FFFFFF" stroke="#000000" strokeWidth={6} strokeLinejoin="round" />
    <path d="M14 12l14 11 60-5M28 23v67" fill="none" stroke="#000000" strokeWidth={6} strokeLinejoin="round" />
    <path d="M38 34l8-1 22 31V36l-5-1v-4l16-1v4l-4 1v42l-7 1-24-35v29l6 1v4l-17 1v-4l4-1V38l-5-1z" fill="#000000" />
  </svg>
);

/** The SAP mark: the blue wedge with its slanted right edge, the name in white. */
export const SapLogo: React.FC<{ height: number }> = ({ height }) => (
  <svg width={height * 2} height={height} viewBox="0 0 100 50">
    <defs>
      <linearGradient id="sap-blue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#00B9F2" />
        <stop offset="1" stopColor="#0057D2" />
      </linearGradient>
    </defs>
    <polygon points="0,0 100,0 50,50 0,50" fill="url(#sap-blue)" />
    <text x={7} y={35} fontFamily="Arial, Helvetica, sans-serif" fontWeight={700} fontSize={27} letterSpacing={0.5} fill="#FFFFFF">
      SAP
    </text>
  </svg>
);
