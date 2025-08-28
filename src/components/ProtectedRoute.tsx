import React, { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useNotes } from '@/context/NoteContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { notes } = useNotes();
  const [searchParams] = useSearchParams();
  
  // Check if user is coming from upload
  const fromUpload = searchParams.get('from') === 'upload';
  
  // Set session access if coming from upload
  useEffect(() => {
    if (fromUpload) {
      sessionStorage.setItem('dashboardUploadAccess', 'true');
    }
  }, [fromUpload]);
  
  // Clear session access if no notes exist (user deleted all notes)
  useEffect(() => {
    if (notes.length === 0 && !fromUpload) {
      sessionStorage.removeItem('dashboardUploadAccess');
    }
  }, [notes.length, fromUpload]);
  
  // Check if user has uploaded notes or has session storage access
  const hasUploadedNotes = notes.length > 0;
  const hasSessionAccess = sessionStorage.getItem('dashboardUploadAccess') === 'true';
  
  // Allow access if user has notes, came from upload, or has session access
  if (hasUploadedNotes || fromUpload || hasSessionAccess) {
    return <>{children}</>;
  }
  
  // Redirect to homepage if no access
  return <Navigate to="/" replace />;
};
