import React from 'react';

interface EmptyTabStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
}

export const EmptyTabState: React.FC<EmptyTabStateProps> = ({ icon, title, description, bgColor }) => (
  <div className="text-center py-12 sm:py-16 px-4">
    <div className={`h-16 w-16 sm:h-24 sm:w-24 rounded-full ${bgColor} flex items-center justify-center mx-auto mb-4 sm:mb-6`}>
      {icon}
    </div>
    <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
    <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
  </div>
);
