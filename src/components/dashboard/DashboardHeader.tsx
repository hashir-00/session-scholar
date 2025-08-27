import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { config } from '@/config';

interface DashboardHeaderProps {
  onUploadClick: () => void;
  processingNotes?: Array<{id: string, filename: string, status: string}>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onUploadClick, processingNotes = [] }) => {
  const navigate = useNavigate();
  const hasProcessingNotes = processingNotes.length > 0;
  
  return (
    <header className="border-b bg-card/95 backdrop-blur-xl sticky top-0 z-50 border-amber-200/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-4 hover:opacity-80 transition-opacity"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-amber-700 via-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-200/50">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
                  {config.app.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {config.app.description}
                </p>
              </div>
            </button>
            <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-300/30">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
            
            {hasProcessingNotes && (
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200 animate-pulse">
                <Clock className="h-3 w-3 mr-1" />
                Processing {processingNotes.length} file{processingNotes.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button 
              onClick={onUploadClick}
              className="bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 h-11 px-6 border-0"
              size="lg"
            >
              <Brain className="h-5 w-5 mr-2" />
              Upload Notes
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};
