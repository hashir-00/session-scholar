import { useState, useCallback } from 'react';
import { noteService } from '@/api/noteService';
import { MockAdditionalContent } from '@/mocks/mockAdditionalContent';
import { useToast } from '@/hooks/use-toast';

interface UseAdditionalContentReturn {
  additionalContent: MockAdditionalContent[];
  isLoading: boolean;
  isGenerating: boolean;
  fetchAdditionalContent: (filters?: {
    subject?: string;
    difficulty?: string;
    limit?: number;
  }) => Promise<void>;
  generateMoreContent: (noteSummaries: Array<{id: string, summary: string}>, filters?: {
    subject?: string;
    difficulty?: string;
    limit?: number;
  }) => Promise<void>;
  getAdditionalContentById: (id: string) => Promise<MockAdditionalContent | null>;
  clearAdditionalContent: () => void;
}

export const useAdditionalContent = (): UseAdditionalContentReturn => {
  const [additionalContent, setAdditionalContent] = useState<MockAdditionalContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const fetchAdditionalContent = useCallback(async (filters?: {
    subject?: string;
    difficulty?: string;
    limit?: number;
  }) => {
    try {
      setIsLoading(true);
      // Don't call the service for initial fetch - start with empty state
      // Content should only be generated when user explicitly requests it
      setAdditionalContent([]);
    } catch (error) {
      toast({
        title: "Error",
        description: window.innerWidth < 640 
          ? "Failed to fetch content. Try again."
          : "Failed to fetch additional content. Please try again.",
        variant: "destructive",
        duration: window.innerWidth < 640 ? 2000 : 4000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const generateMoreContent = useCallback(async (
    noteSummaries: Array<{id: string, summary: string}>, 
    filters?: {
      subject?: string;
      difficulty?: string;
      limit?: number;
    }
  ) => {
    try {
      setIsGenerating(true);
      
      toast({
        title: "Generating additional content",
        description: window.innerWidth < 640 
          ? "AI is creating study materials..."
          : "AI is analyzing your notes to create relevant study materials...",
        duration: window.innerWidth < 640 ? 2000 : 3000,
      });

      const newContent = await noteService.getAdditionalContent(filters, noteSummaries);
      
      // Append new content to existing content (infinite loading behavior)
      setAdditionalContent(prev => [...prev, ...newContent]);
      
      toast({
        title: "Content generated successfully",
        description: window.innerWidth < 640 
          ? `Generated ${newContent.length} new materials.`
          : `Generated ${newContent.length} new study materials based on your notes.`,
        duration: window.innerWidth < 640 ? 2000 : 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: window.innerWidth < 640 
          ? "Failed to generate content. Try again."
          : "Failed to generate additional content. Please try again.",
        variant: "destructive",
        duration: window.innerWidth < 640 ? 2000 : 4000,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const getAdditionalContentById = useCallback(async (id: string): Promise<MockAdditionalContent | null> => {
    try {
      const content = await noteService.getAdditionalContentById(id);
      return content;
    } catch (error) {
      toast({
        title: "Error",
        description: window.innerWidth < 640 
          ? "Failed to fetch content details."
          : "Failed to fetch additional content details.",
        variant: "destructive",
        duration: window.innerWidth < 640 ? 2000 : 4000,
      });
      return null;
    }
  }, [toast]);

  const clearAdditionalContent = useCallback(() => {
    setAdditionalContent([]);
  }, []);

  return {
    additionalContent,
    isLoading,
    isGenerating,
    fetchAdditionalContent,
    generateMoreContent,
    getAdditionalContentById,
    clearAdditionalContent,
  };
};
