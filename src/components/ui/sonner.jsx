"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={{
        '--normal-bg': '#fff',
        '--normal-text': '#18181b',
        '--normal-border': '#a78bfa', // violet-400
        '--success-bg': '#f0fdf4',
        '--success-text': '#166534',
        '--success-border': '#4ade80',
        '--error-bg': '#fef2f2',
        '--error-text': '#991b1b',
        '--error-border': '#f87171',
        '--warning-bg': '#fefce8',
        '--warning-text': '#92400e',
        '--warning-border': '#facc15',
        '--info-bg': '#eff6ff',
        '--info-text': '#1e40af',
        '--info-border': '#60a5fa',
        '--opacity': '1',
      }}
      {...props}
    />
  );
};

export { Toaster };