import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <motion.div 
      className="flex items-center justify-center py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-amber-700 to-orange-600 flex items-center justify-center mx-auto animate-spin">
          <Loader2 className="h-8 w-8 text-white" />
        </div>
        <p className="text-lg font-medium">Loading your study materials...</p>
      </div>
    </motion.div>
  );
};
