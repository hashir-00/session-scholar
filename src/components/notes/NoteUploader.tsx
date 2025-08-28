import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Stepper from '@/components/ui/stepper';
import { Upload, FileImage, X, Brain, CheckCircle2, Sparkles, FileText, Wand2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { config } from '@/config';
import { useNotes } from '@/context/NoteContext';

interface NoteUploaderProps {
  onClose?: () => void;
  autoNavigateOnUpload?: boolean;
}

export const NoteUploader: React.FC<NoteUploaderProps> = ({ onClose, autoNavigateOnUpload = false }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedNoteIds, setUploadedNoteIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadNotes, isLoading, fetchNotes, processingNotes } = useNotes();
  const { toast } = useToast();

  // Validate file type
  const validateFileType = useCallback((file: File): boolean => {
    const allowedMimeTypes = config.upload.allowedFileTypes;
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    // Check MIME type
    if (!allowedMimeTypes.includes(file.type)) {
      return false;
    }
    
    // Check file extension matches MIME type
    const allowedExtensions = config.upload.allowedTypesMap[file.type];
    if (!allowedExtensions?.includes(fileExtension)) {
      return false;
    }
    
    return true;
  }, []);

  // Check if GIF is animated (basic check)
  const isAnimatedGif = useCallback(async (file: File): Promise<boolean> => {
    if (file.type !== 'image/gif') return false;
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const arr = new Uint8Array(e.target?.result as ArrayBuffer);
        // Basic check for multiple frames in GIF
        // Look for multiple image descriptors (0x2C)
        let imageDescriptorCount = 0;
        for (let i = 0; i < arr.length - 1; i++) {
          if (arr[i] === 0x2C) {
            imageDescriptorCount++;
            if (imageDescriptorCount > 1) {
              resolve(true);
              return;
            }
          }
        }
        resolve(false);
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file);
    });
  }, []);

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
    } else if (selectedFiles.length === 0 && currentStep === 1) {
      setCurrentStep(0);
    }
  }, [selectedFiles.length, currentStep]);

  // Monitor processing status for notes uploaded in this session
  useEffect(() => {
    if (uploadedNoteIds.length === 0) return;

    // Filter processing notes to only those uploaded in this session
    const relevantProcessingNotes = processingNotes.filter(note => 
      uploadedNoteIds.includes(note.id)
    );

    if (relevantProcessingNotes.length === 0) return;

    const allCompleted = relevantProcessingNotes.every(note => note.status === 'completed');
    const hasFailures = relevantProcessingNotes.some(note => note.status === 'failed');
    const completedCount = relevantProcessingNotes.filter(note => note.status === 'completed').length;
    
    // Update progress
    const progress = (completedCount / relevantProcessingNotes.length) * 100;
    setUploadProgress(progress);

    if (allCompleted) {
      setCurrentStep(3); // Move to complete step
      setUploadProgress(100);
      
      toast({
        title: "Processing complete!",
        description: `All ${relevantProcessingNotes.length} note(s) have been processed successfully.`,
      });
      
      // Auto-close after showing success for a shorter time, or allow manual close
      setTimeout(() => {
        setSelectedFiles([]);
        setUploadedNoteIds([]);
        setCurrentStep(0);
        setUploadProgress(0);
        setIsUploading(false);
      }, 2000);
      
      return;
    }

    if (hasFailures) {
      toast({
        title: "Processing failed",
        description: "Some notes failed to process. Please try again.",
        variant: "destructive",
      });
      return;
    }
  }, [processingNotes, uploadedNoteIds, toast]);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: Array<{file: File, errors: Array<{code: string, message: string}>}>) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejectedNames = rejectedFiles.map(f => f.file.name).join(', ');
      toast({
        title: "Invalid file types",
        description: window.innerWidth < 640 
          ? `${rejectedFiles.length} file(s) rejected. Only PNG, JPEG, WEBP, GIF allowed.`
          : `The following files were rejected: ${rejectedNames}. Only PNG, JPEG, WEBP, and non-animated GIF files are allowed.`,
        variant: "destructive",
        duration: window.innerWidth < 640 ? 2000 : 5000,
      });
    }

    // Validate accepted files
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    for (const file of acceptedFiles) {
      // Check basic file type validation
      if (!validateFileType(file)) {
        invalidFiles.push(file.name);
        continue;
      }

      // Special check for GIF files to ensure they're not animated
      if (file.type === 'image/gif') {
        const isAnimated = await isAnimatedGif(file);
        if (isAnimated) {
          invalidFiles.push(`${file.name} (animated GIF not allowed)`);
          continue;
        }
      }

      validFiles.push(file);
    }

    // Show error for invalid files
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid files detected",
        description: window.innerWidth < 640 
          ? `${invalidFiles.length} file(s) rejected. Check file types.`
          : `The following files were rejected: ${invalidFiles.join(', ')}. Only PNG, JPEG, WEBP, and non-animated GIF files are allowed.`,
        variant: "destructive",
        duration: window.innerWidth < 640 ? 2000 : 5000,
      });
    }

    // Add valid files
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      toast({
        title: "Files added",
        description: window.innerWidth < 640 
          ? `${validFiles.length} file(s) ready`
          : `${validFiles.length} file(s) ready for upload.`,
        duration: window.innerWidth < 640 ? 1500 : 3000,
      });
    }
  }, [toast, validateFileType, isAnimatedGif]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: config.upload.allowedTypesMap,
    multiple: true,
    maxSize: config.upload.maxFileSize,
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      // Reset to step 0 if no files remain
      if (newFiles.length === 0) {
        setCurrentStep(0);
      }
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    // Auto-navigate immediately when user clicks Process (before upload starts)
    if (autoNavigateOnUpload) {
      onClose?.();
      // Continue with upload in background, but user is redirected immediately
    }
    
    try {
      setCurrentStep(2); // Move to processing step
      setUploadProgress(0);
      setIsUploading(true);
      
      // Upload files and get response with note IDs
      const uploadedNotes = await uploadNotes(selectedFiles);
      
      // Track the IDs of notes uploaded in this session
      setUploadedNoteIds(uploadedNotes.map(note => note.id));
      
      toast({
        title: "Upload successful",
        description: `${selectedFiles.length} file(s) uploaded successfully. AI processing started.`,
      });
      
      // Auto-close dialog after successful upload to show processing in dashboard
      if (!autoNavigateOnUpload) {
        setTimeout(() => {
          onClose?.();
        }, 1000); // Give user time to see the success message
      }
      
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
      
      // Reset on failure
      setCurrentStep(1);
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  const resetUploader = () => {
    setSelectedFiles([]);
    setCurrentStep(0);
    setUploadProgress(0);
    setUploadedNoteIds([]);
    setIsUploading(false);
  };

  const handleClose = () => {
    // Allow closing during processing - background processing will continue
    if (isUploading && currentStep === 2) {
      toast({
        title: "Processing continues in background",
        description: "Your files are still being processed. Check the dashboard for updates.",
      });
    }
    onClose?.();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-4 space-y-3 sm:space-y-6">
      {/* Mobile Header with Step Carousel */}
      <div className="sm:hidden text-center space-y-3">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Transform Your Notes
            </h2>
            <p className="text-xs text-muted-foreground">
              Upload your notes and let AI create summaries and quizzes
            </p>
          </div>
        </div>

        {/* Mobile Step Carousel - Single Step */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full"
            >
              <div className="mx-auto max-w-[200px] text-center">
                <div className="flex flex-col items-center space-y-2">
                  <motion.div 
                    className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      currentStep === steps.length - 1
                        ? 'bg-green-500 text-white' 
                        : 'bg-primary text-white'
                    }`}
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: currentStep === steps.length - 1 ? [0, 360] : 0
                    }}
                    transition={{ 
                      scale: { repeat: currentStep < steps.length - 1 ? Infinity : 0, duration: 2 },
                      rotate: { duration: 0.6 }
                    }}
                  >
                    {currentStep === steps.length - 1 ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <div className="h-6 w-6 flex items-center justify-center">
                        {React.cloneElement(steps[currentStep].icon, { className: "h-6 w-6" })}
                      </div>
                    )}
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h4 className={`font-semibold text-sm ${
                      currentStep === steps.length - 1
                        ? 'text-green-600'
                        : 'text-primary'
                    }`}>
                      {steps[currentStep]?.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {steps[currentStep]?.description}
                    </p>
                  </motion.div>
                  
                  {/* Step counter */}
                  <motion.div 
                    className="text-xs text-muted-foreground/70 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentStep + 1} of {steps.length}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center items-center gap-1.5">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                index <= currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Header with Full Stepper */}
      <div className="hidden sm:block text-center space-y-3">
        <div className="flex flex-col items-center justify-center gap-2 mb-3">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Transform Your Notes
            </h2>
            <p className="text-sm text-muted-foreground">
              Upload your notes and let AI create summaries and quizzes
            </p>
          </div>
        </div>

        {/* Desktop Stepper */}
        <Card className="p-4 bg-gradient-to-r from-background to-secondary/30">
          <Stepper 
            steps={steps} 
            currentStep={currentStep}
            className="w-full"
          />
        </Card>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Step 0: File Selection */}
          {currentStep === 0 && (
            <motion.div
              key="file-selection"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full"
            >
              <Card 
                {...getRootProps()} 
                className={`p-4 sm:p-8 border-2 border-dashed cursor-pointer transition-all duration-300 ${
                  isDragActive 
                    ? 'border-primary bg-primary/5 scale-[1.01]' 
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-center space-y-3">
                  <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  {isDragActive ? (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-base sm:text-lg font-medium text-primary">Drop your notes here!</p>
                      <p className="text-sm text-muted-foreground">Release to upload your files</p>
                    </motion.div>
                  ) : (
                    <div>
                      <p className="text-base sm:text-lg font-medium mb-1">
                        Drag & drop your note images here
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        or <span className="text-primary font-medium">click to browse</span> your files
                      </p>
                      <div className="flex justify-center flex-wrap gap-1.5 mb-2">
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">PNG</Badge>
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">JPEG</Badge>
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">WebP</Badge>
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">GIF</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground px-2">
                        Max {Math.round(config.upload.maxFileSize / 1024 / 1024)}MB per file
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 1: File Review */}
          {currentStep === 1 && selectedFiles.length > 0 && (
            <motion.div
              key="file-review"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full space-y-3 sm:space-y-4"
            >
              {/* Selected Files Review */}
              <Card className="p-3 sm:p-4">
                <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center justify-between mb-3">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Selected Files ({selectedFiles.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetUploader}
                    className="gap-2 w-full sm:w-auto text-xs"
                  >
                    <X className="h-3 w-3" />
                    Start Over
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg border"
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileImage className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 ">
                <Button 
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="md:flex-1 sm:w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 h-10 text-sm font-medium "
                  size="sm"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {isLoading ? 'Processing...' : `Process ${selectedFiles.length} File(s)`}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClose} 
                  size="sm" 
                  className="h-10 text-sm sm:w-auto w-full"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2 & 3: Processing & Complete */}
          {currentStep >= 2 && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full"
            >
              <Card className="p-4 sm:p-6 text-center space-y-4">
                <motion.div 
                  className="mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center"
                  animate={currentStep === 2 ? { scale: [1, 1.05, 1] } : {}}
                  transition={currentStep === 2 ? { repeat: Infinity, duration: 2 } : {}}
                >
                  {currentStep === 3 ? (
                    <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  ) : (
                    <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  )}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-base sm:text-lg font-semibold mb-1">
                    {currentStep === 2 ? 'AI is Processing Your Notes' : 'Processing Complete!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground px-2">
                    {currentStep === 2 
                      ? 'Extracting text, generating summaries, and creating quizzes.'
                      : 'Your notes are ready for studying!'}
                  </p>
                </motion.div>

                {currentStep === 2 && (
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="space-y-1">
                      <Progress value={uploadProgress} className="w-full h-1.5" />
                      <p className="text-xs text-muted-foreground">
                        {Math.round(uploadProgress)}% complete ({(() => {
                          const relevantProcessingNotes = processingNotes.filter(note => 
                            uploadedNoteIds.includes(note.id)
                          );
                          const completed = relevantProcessingNotes.filter(n => n.status === 'completed').length;
                          return `${completed}/${relevantProcessingNotes.length}`;
                        })()} files)
                      </p>
                    </div>
                    
                    {/* Individual file progress */}
                    {uploadedNoteIds.length > 0 && (() => {
                      const relevantProcessingNotes = processingNotes.filter(note => 
                        uploadedNoteIds.includes(note.id)
                      );
                      return relevantProcessingNotes.length > 0 && (
                        <div className="max-w-xs mx-auto space-y-1">
                          {relevantProcessingNotes.slice(0, 3).map((note, index) => (
                            <motion.div 
                              key={note.id} 
                              className="flex items-center gap-2 p-1.5 bg-secondary/30 rounded text-left"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="h-4 w-4 flex items-center justify-center">
                                {note.status === 'completed' ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                ) : note.status === 'failed' ? (
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                ) : (
                                  <div className="h-2 w-2 bg-primary/60 rounded-full animate-pulse" />
                                )}
                              </div>
                              <span className="text-xs flex-1 truncate">{note.filename}</span>
                              <Badge 
                                variant={note.status === 'completed' ? 'default' : note.status === 'failed' ? 'destructive' : 'secondary'}
                                className="text-xs px-1 py-0"
                              >
                                {note.status === 'completed' ? 'Done' : note.status === 'failed' ? 'Failed' : 'Processing'}
                              </Badge>
                            </motion.div>
                          ))}
                          {relevantProcessingNotes.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{relevantProcessingNotes.length - 3} more files
                            </p>
                          )}
                        </div>
                      );
                    })()}
                    
                    {/* Close button during processing */}
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        onClick={handleClose}
                        className="w-full h-9 text-xs"
                      >
                        Close (Processing continues)
                      </Button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", bounce: 0.3 }}
                  >
                    <div className="flex justify-center">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: 2, duration: 0.4 }}
                      >
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                      </motion.div>
                    </div>
                    <Button 
                      onClick={handleClose}
                      className="w-full h-9 text-sm bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    >
                      Done
                    </Button>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};