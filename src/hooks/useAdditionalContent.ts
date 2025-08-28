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
        description: "Failed to fetch additional content. Please try again.",
        variant: "destructive",
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
        description: "AI is analyzing your notes to create relevant study materials...",
      });

      const newContent = await noteService.getAdditionalContent(filters, noteSummaries);
      
      // Append new content to existing content (infinite loading behavior)
      setAdditionalContent(prev => [...prev, ...newContent]);
      
      toast({
        title: "Content generated successfully",
        description: `Generated ${newContent.length} new study materials based on your notes.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate additional content. Please try again.",
        variant: "destructive",
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
        description: "Failed to fetch additional content details.",
        variant: "destructive",
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
