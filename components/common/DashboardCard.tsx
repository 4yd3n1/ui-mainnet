import React from 'react';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardCard({ children, className = "" }: DashboardCardProps) {
  return (
    <section className={`w-full md:w-[420px] h-auto md:h-[750px] p-6 md:p-8 bg-bg-card rounded-xl neon-border-cyan flex flex-col gap-4 md:gap-6 ${className}`}>
      {children}
    </section>
  );
} 