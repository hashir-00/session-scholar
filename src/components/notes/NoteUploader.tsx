import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Stepper from '@/components/ui/stepper';
import { Upload, FileImage, X, Brain, CheckCircle2, Sparkles, FileText, Wand2 } from 'lucide-react';
import { useNotes } from '@/context/NoteContext';
import { motion, AnimatePresence } from 'framer-motion';

interface NoteUploaderProps {
  onClose?: () => void;
}

export const NoteUploader: React.FC<NoteUploaderProps> = ({ onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { uploadNotes, isLoading } = useNotes();

  const steps = [
    {
      id: 'select',
      title: 'Select Files',
      description: 'Choose your note images',
      icon: <FileImage className="h-4 w-4" />
    },
    {
      id: 'upload',
      title: 'Upload',
      description: 'Upload to cloud',
      icon: <Upload className="h-4 w-4" />
    },
    {
      id: 'process',
      title: 'AI Processing',
      description: 'Extract text & analyze',
      icon: <Brain className="h-4 w-4" />
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'Ready to study',
      icon: <CheckCircle2 className="h-4 w-4" />
    }
  ];

  useEffect(() => {
    if (selectedFiles.length > 0 && currentStep === 0) {
      setCurrentStep(1);
    }
  }, [selectedFiles.length, currentStep]);

  useEffect(() => {
    if (isLoading) {
      setCurrentStep(2);
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setCurrentStep(3);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploadProgress(0);
    await uploadNotes(selectedFiles);
    
    // Auto-close after a delay on completion
    setTimeout(() => {
      setSelectedFiles([]);
      onClose?.();
    }, 2000);
  };

  const resetUploader = () => {
    setSelectedFiles([]);
    setCurrentStep(0);
    setUploadProgress(0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Transform Your Notes
            </h2>
            <p className="text-muted-foreground">
              Upload your notes and let AI create summaries and quizzes
            </p>
          </div>
        </div>

        {/* Stepper */}
        <Card className="p-6 bg-gradient-to-r from-background to-secondary/30">
          <Stepper 
            steps={steps} 
            currentStep={currentStep}
            className="w-full"
          />
        </Card>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div
            key="file-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* File Selection Step */}
            <Card 
              {...getRootProps()} 
              className={`p-12 border-2 border-dashed cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? 'border-primary bg-primary/5 scale-105' 
                  : 'border-border hover:border-primary/50 hover:bg-secondary/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-center space-y-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-center">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                {isDragActive ? (
                  <div>
                    <p className="text-xl font-medium text-primary">Drop your notes here!</p>
                    <p className="text-muted-foreground">Release to upload your files</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xl font-medium mb-2">
                      Drag & drop your note images here
                    </p>
                    <p className="text-muted-foreground mb-4">
                      or click to browse your files
                    </p>
                    <div className="flex justify-center gap-2">
                      <Badge variant="secondary">JPG</Badge>
                      <Badge variant="secondary">PNG</Badge>
                      <Badge variant="secondary">WebP</Badge>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {currentStep === 1 && selectedFiles.length > 0 && (
          <motion.div
            key="file-review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Selected Files Review */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Selected Files ({selectedFiles.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetUploader}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Start Over
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileImage className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={handleUpload}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 h-12"
                size="lg"
              >
                <Wand2 className="h-5 w-5 mr-2" />
                {isLoading ? 'Processing...' : `Process ${selectedFiles.length} File(s)`}
              </Button>
              <Button variant="outline" onClick={onClose} size="lg" className="h-12">
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep >= 2 && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Processing Step */}
            <Card className="p-8 text-center space-y-6">
              <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center animate-pulse">
                <Brain className="h-10 w-10 text-white" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {currentStep === 2 ? 'AI is Processing Your Notes' : 'Processing Complete!'}
                </h3>
                <p className="text-muted-foreground">
                  {currentStep === 2 
                    ? 'Extracting text, generating summaries, and creating quizzes...'
                    : 'Your notes are ready for studying!'}
                </p>
              </div>

              {currentStep === 2 && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full h-2" />
                  <p className="text-sm text-muted-foreground">
                    {Math.round(uploadProgress)}% complete
                  </p>
                </div>
              )}

              {currentStep === 3 && (
                <div className="flex justify-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};