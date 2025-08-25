import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileImage, X } from 'lucide-react';
import { useNotes } from '@/context/NoteContext';

interface NoteUploaderProps {
  onClose?: () => void;
}

export const NoteUploader: React.FC<NoteUploaderProps> = ({ onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { uploadNotes, isLoading } = useNotes();

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
    
    await uploadNotes(selectedFiles);
    setSelectedFiles([]);
    onClose?.();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Upload Your Notes</h2>
        <p className="text-muted-foreground">
          Upload images of your handwritten or printed notes to get AI-generated summaries and quizzes.
        </p>
      </div>

      <Card 
        {...getRootProps()} 
        className={`p-8 border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          {isDragActive ? (
            <p className="text-lg text-primary">Drop your note images here...</p>
          ) : (
            <div>
              <p className="text-lg mb-2">Drag & drop note images here, or click to browse</p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, and WebP files
              </p>
            </div>
          )}
        </div>
      </Card>

      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Selected Files ({selectedFiles.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileImage className="h-5 w-5 text-primary" />
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleUpload}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};