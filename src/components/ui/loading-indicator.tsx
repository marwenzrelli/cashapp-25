
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  textClassName?: string;
  fullscreen?: boolean;
  fadeIn?: boolean;
  showImmediately?: boolean;
}

export const LoadingIndicator = ({
  size = "md",
  className,
  text,
  textClassName,
  fullscreen = false,
  fadeIn = true,
  showImmediately = false
}: LoadingIndicatorProps) => {
  const [visible, setVisible] = useState(!fadeIn || showImmediately);

  // Effet de transition en fondu
  useEffect(() => {
    if (fadeIn && !showImmediately) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 150); // Réduit à 150ms pour une réponse plus rapide
      return () => clearTimeout(timer);
    }
  }, [fadeIn, showImmediately]);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const containerClasses = fullscreen 
    ? "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50" 
    : "flex flex-col items-center justify-center";

  // Applique une transition de fondu plus rapide
  const opacityClass = fadeIn 
    ? `transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}` 
    : '';

  return (
    <div className={cn(containerClasses, opacityClass, className)} style={{ pointerEvents: 'none' }}>
      <Loader2 className={cn("text-primary animate-spin", sizeClasses[size])} />
      {text && (
        <p className={cn("mt-2 text-sm text-muted-foreground", textClassName)}>
          {text}
        </p>
      )}
    </div>
  );
};
