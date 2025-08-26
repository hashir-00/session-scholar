import { FileText, Brain, BookOpen, TrendingUp, Users, Star } from 'lucide-react';

export const getFeatureIcon = (iconType: string, className: string) => {
  switch (iconType) {
    case 'fileText':
      return <FileText className={className} />;
    case 'brain':
      return <Brain className={className} />;
    case 'bookOpen':
      return <BookOpen className={className} />;
    default:
      return <FileText className={className} />;
  }
};

export const getStatIcon = (iconType: string, className: string) => {
  switch (iconType) {
    case 'trendingUp':
      return <TrendingUp className={className} />;
    case 'users':
      return <Users className={className} />;
    case 'star':
      return <Star className={className} />;
    default:
      return <TrendingUp className={className} />;
  }
};
