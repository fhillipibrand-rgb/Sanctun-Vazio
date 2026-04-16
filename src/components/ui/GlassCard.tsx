import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  orb?: boolean;
}

const GlassCard = ({ children, className = "", orb = false, ...props }: GlassCardProps) => (
  <div className={`glass-stack rounded-[1.25rem] p-4 md:p-5 relative overflow-hidden ${className}`} {...props}>
    {orb && (
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
    )}
    {children}
  </div>
);

export default GlassCard;
