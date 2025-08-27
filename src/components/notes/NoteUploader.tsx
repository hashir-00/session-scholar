import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Stepper from '@/components/ui/stepper';
import { Upload, FileImage, X, Brain, CheckCircle2, Sparkles, FileText, Wand2, AlertCircle } from 'lucide-react';
import { useNotes } from '@/context/NoteContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { config } from '@/config';

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
        description: `The following files were rejected: ${rejectedNames}. Only PNG, JPEG, WEBP, and non-animated GIF files are allowed.`,
        variant: "destructive",
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
        description: `The following files were rejected: ${invalidFiles.join(', ')}. Only PNG, JPEG, WEBP, and non-animated GIF files are allowed.`,
        variant: "destructive",
      });
    }

    // Add valid files
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      toast({
        title: "Files added successfully",
        description: `${validFiles.length} file(s) ready for upload.`,
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
                    <div className="flex justify-center gap-2 mb-2">
                      <Badge variant="secondary">PNG</Badge>
                      <Badge variant="secondary">JPEG</Badge>
                      <Badge variant="secondary">WebP</Badge>
                      <Badge variant="secondary">GIF</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supported: PNG, JPEG, WebP, and non-animated GIF • Max {Math.round(config.upload.maxFileSize / 1024 / 1024)}MB per file
                    </p>
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
              <Button variant="outline" onClick={handleClose} size="lg" className="h-12">
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
                    ? 'Extracting text, generating summaries, and creating quizzes. You can close this modal and processing will continue in the background.'
                    : 'Your notes are ready for studying!'}
                </p>
              </div>

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full h-2" />
                    <p className="text-sm text-muted-foreground">
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
                      <div className="max-w-md mx-auto space-y-2">
                        {relevantProcessingNotes.map((note, index) => (
                          <div key={note.id} className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg">
                            <div className="h-6 w-6 flex items-center justify-center">
                              {note.status === 'completed' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : note.status === 'failed' ? (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <div className="h-3 w-3 bg-primary/60 rounded-full animate-pulse" />
                              )}
                            </div>
                            <span className="text-sm flex-1 truncate">{note.filename}</span>
                            <Badge 
                              variant={note.status === 'completed' ? 'default' : note.status === 'failed' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {note.status === 'completed' ? 'Done' : note.status === 'failed' ? 'Failed' : 'Processing'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  
                  {/* Close button during processing */}
                  <div className="mt-6">
                    <Button 
                      variant="outline" 
                      onClick={handleClose}
                      className="w-full"
                    >
                      Close (Processing continues in background)
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
                  </div>
                  <Button 
                    onClick={handleClose}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    Done
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};