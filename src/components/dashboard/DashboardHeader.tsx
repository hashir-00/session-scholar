import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Clock, Home, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { config } from '@/config';

interface DashboardHeaderProps {
  onUploadClick: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
  processingNotes?: Array<{id: string, filename: string, status: string}>;
  completedNotes?: Array<{id: string, filename: string, status: string}>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  onUploadClick, 
  isUploading = false,
  uploadProgress = 0,
  processingNotes = [], 
  completedNotes = [] 
}) => {
  const navigate = useNavigate();
  const hasProcessingNotes = processingNotes.length > 0;
  const hasCompletedNotes = completedNotes.length > 0;
  
  return (
    <header className="border-b bg-card/95 backdrop-blur-xl sticky top-0 z-50 border-amber-200/50">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between relative">
          {/* Left Side - StudyAI Brand */}
          <motion.div 
            className="flex items-center gap-2 sm:gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-700 via-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-200/50">
                <Brain className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                StudyAI
              </h1>
            </button>
            
            {/* Status badges - hide some on mobile */}
            <Badge variant="secondary" className="hidden sm:inline-flex ml-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-300/30">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
            
            {/* Status chips - show only one at a time with priority */}
            {isUploading ? (
              <Badge variant="outline" className="ml-1 sm:ml-2 bg-orange-50 text-orange-700 border-orange-200 animate-pulse text-xs sm:text-sm">
                <Upload className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline px-2">Uploading </span>{uploadProgress}%
              </Badge>
            ) : hasProcessingNotes ? (
              <Badge variant="outline" className="ml-1 sm:ml-2 bg-blue-50 text-blue-700 border-blue-200 animate-pulse text-xs sm:text-sm">
                <Clock className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline px-2">AI Processing </span>{processingNotes.length}
              </Badge>
            ) : hasCompletedNotes ? (
              <Badge variant="outline" className="ml-1 sm:ml-2 bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {completedNotes.length} <span className="hidden sm:inline px-2"> Ready</span>
              </Badge>
            ) : null}
          </motion.div>

          {/* Center - Dashboard Title - Hide on mobile */}
          <motion.div 
            className="hidden sm:block mx-auto text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-yellow-500">
              DASHBOARD
            </h2>
          </motion.div>
          
          {/* Right Side - Home and Upload Buttons */}
          <motion.div
            className="flex items-center gap-2 sm:gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base px-2 sm:px-4 py-1 sm:py-2"
              size="sm"
            >
              <Home className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <Button 
              onClick={onUploadClick}
              className="bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border-0"
              size="sm"
            >
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Upload Notes</span>
              <span className="sm:hidden">Upload</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};
