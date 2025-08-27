import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { featureCards, statsData } from '@/data/dashboardData';
import { getFeatureIcon, getStatIcon } from '@/utils/iconUtils';
import { config } from '@/config';

interface EmptyStateProps {
  onUploadClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onUploadClick }) => {
  return (
    <motion.div 
      className="text-center py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto w-32 h-32 bg-gradient-to-r from-amber-200/30 via-orange-200/30 to-amber-300/30 rounded-full flex items-center justify-center mb-8 relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-100/20 to-orange-100/20 animate-pulse"></div>
        <FileText className="h-16 w-16 text-amber-700 z-10" />
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-900 to-orange-800 bg-clip-text text-transparent">
          Welcome to {config.app.title}
        </h2>
        <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
          {config.app.description}. Transform your handwritten notes into intelligent study materials. 
          Our AI creates summaries, extracts key concepts, and generates personalized quizzes.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
        {featureCards.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className={`p-8 text-center hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm shadow-warm`}>
              <div className="h-16 w-16 rounded-2xl bg-white/90 shadow-lg flex items-center justify-center mx-auto mb-6 border border-amber-200/30">
                {getFeatureIcon(feature.iconType, `h-8 w-8 ${feature.iconColor}`)}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Stats Row */}
      <motion.div 
        className="flex justify-center gap-8 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {statsData.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {getStatIcon(stat.iconType, "h-5 w-5")}
              <span className="text-2xl font-bold text-amber-700">{stat.value}</span>
            </div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <Button 
          size="lg"
          onClick={onUploadClick}
          className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-600 hover:from-amber-800 hover:via-orange-700 hover:to-amber-700 shadow-xl h-14 px-8 text-lg border-0"
        >
          <Sparkles className="h-6 w-6 mr-3" />
          Start Your AI Learning Journey
        </Button>
      </motion.div>
    </motion.div>
  );
};
