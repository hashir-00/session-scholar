import React from 'react';

interface EmptyTabStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
}

export const EmptyTabState: React.FC<EmptyTabStateProps> = ({ icon, title, description, bgColor }) => (
  <div className="text-center py-16">
    <div className={`h-24 w-24 rounded-full ${bgColor} flex items-center justify-center mx-auto mb-6`}>
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);
