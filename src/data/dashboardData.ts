export interface FeatureCard {
  iconType: 'fileText' | 'brain' | 'bookOpen';
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}

export interface StatItem {
  iconType: 'trendingUp' | 'users' | 'star';
  value: string;
  label: string;
}

export const featureCards: FeatureCard[] = [
  {
    iconType: 'fileText',
    title: "Smart Upload",
    description: "Drag & drop your notes and watch AI extract every detail",
    gradient: "from-amber-100/50 to-orange-100/50",
    iconColor: "text-amber-600"
  },
  {
    iconType: 'brain',
    title: "AI Processing",
    description: "Advanced OCR and NLP to understand your content",
    gradient: "from-orange-100/50 to-red-100/50",
    iconColor: "text-orange-600"
  },
  {
    iconType: 'bookOpen',
    title: "Interactive Learning",
    description: "Get summaries, flashcards, and adaptive quizzes",
    gradient: "from-amber-50/50 to-yellow-100/50",
    iconColor: "text-amber-700"
  }
];

export const statsData: StatItem[] = [
  { 
    iconType: 'trendingUp',
    value: "98%", 
    label: "Accuracy" 
  },
  { 
    iconType: 'users',
    value: "10K+", 
    label: "Students" 
  },
  { 
    iconType: 'star',
    value: "4.9", 
    label: "Rating" 
  }
];
