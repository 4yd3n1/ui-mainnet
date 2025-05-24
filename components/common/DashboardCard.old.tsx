import React from 'react';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardCard({ children, className = "" }: DashboardCardProps) {
  return (
    <section className={`w-96 h-[500px] p-6 bg-bg-card rounded-xl shadow-card flex flex-col gap-4 ${className}`}>
      {children}
    </section>
  );
} 