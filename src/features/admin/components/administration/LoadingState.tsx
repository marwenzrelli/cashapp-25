
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  variant?: 'default' | 'minimal';
  retrying?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Chargement en cours...",
  variant = 'default',
  retrying = false
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[300px] text-center space-y-4 animate-in fade-in duration-300">
      <div className="relative">
        {retrying ? (
          <div className="relative">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
          </div>
        ) : (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        )}
      </div>
      
      <p className="text-muted-foreground font-medium">{message}</p>
      
      {variant === 'default' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mt-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg hidden md:block" />
          <Skeleton className="h-12 w-full rounded-lg hidden md:block" />
        </div>
      )}
    </div>
  );
};
