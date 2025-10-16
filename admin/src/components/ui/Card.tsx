import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
};

export const Card: React.FC<CardProps> = ({ children, className = '', padding = 'md' }) => {
  const pad = padding === 'lg' ? 'p-6' : padding === 'sm' ? 'p-3' : 'p-4';
  return <div className={`panel rounded-xl ${pad} ${className}`}>{children}</div>;
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`text-xl font-semibold glow-text ${className}`}>{children}</h2>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`${className}`}>{children}</div>
);


