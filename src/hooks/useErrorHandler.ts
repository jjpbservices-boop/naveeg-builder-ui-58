import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ErrorOptions {
  title?: string;
  description?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback((error: Error | string, options: ErrorOptions = {}) => {
    const {
      title = "Something went wrong",
      description,
      showRetry = false,
      onRetry
    } = options;

    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Log error for debugging
    console.error('Error handled:', error);

    // Determine user-friendly message
    let userMessage = description || errorMessage;
    
    // Map common errors to user-friendly messages
    if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      userMessage = "You're not authorized to perform this action. Please sign in again.";
    } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      userMessage = "The requested resource was not found.";
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      userMessage = "Network error. Please check your connection and try again.";
    } else if (errorMessage.includes('timeout')) {
      userMessage = "Request timed out. Please try again.";
    } else if (errorMessage.includes('validation')) {
      userMessage = "Please check your input and try again.";
    }

    toast({
      title,
      description: userMessage,
      variant: "destructive",
      action: showRetry && onRetry ? undefined : undefined,
    });
  }, [toast]);

  return { handleError };
};