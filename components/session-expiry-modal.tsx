'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SessionExpiryDetail {
  code?: string;
  message: string;
}

export function SessionExpiryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('Your session has expired');

  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      const customEvent = event as CustomEvent<SessionExpiryDetail>;
      const detail = customEvent.detail;
      
      setMessage(detail.message || 'Your session has expired');
      setIsOpen(true);
    };

    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
            </div>
            <AlertDialogTitle className="text-xl">Session Expired</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base pt-2">
            {message}. You will be redirected to the login page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-center pt-4">
          <div className="flex gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-bounce"></div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
