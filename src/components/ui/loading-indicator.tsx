
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  textClassName?: string;
  fullscreen?: boolean;
  fadeIn?: boolean; // Ajout d'une option de transition en fondu
}

export const LoadingIndicator = ({
  size = "md",
  className,
  text,
  textClassName,
  fullscreen = false,
  fadeIn = true
}: LoadingIndicatorProps) => {
  const [visible, setVisible] = useState(!fadeIn);

  // Effet de transition en fondu
  useEffect(() => {
    if (fadeIn) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 200); // Délai de 200ms avant d'afficher le loader
      return () => clearTimeout(timer);
    }
  }, [fadeIn]);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const containerClasses = fullscreen 
    ? "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50" 
    : "flex flex-col items-center justify-center";

  // Applique une transition de fondu
  const opacityClass = fadeIn 
    ? `transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}` 
    : '';

  return (
    <div className={cn(containerClasses, opacityClass, className)}>
      <Loader2 className={cn("text-primary animate-spin", sizeClasses[size])} />
      {text && (
        <p className={cn("mt-2 text-sm text-muted-foreground", textClassName)}>
          {text}
        </p>
      )}
    </div>
  );
};
