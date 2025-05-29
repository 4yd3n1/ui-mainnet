import React from 'react';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardCard({ children, className = "" }: DashboardCardProps) {
  return (
    <section className={`w-[420px] h-[750px] p-8 bg-bg-card rounded-xl shadow-card flex flex-col gap-6 ${className}`}>
      {children}
    </section>
  );
} 