
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
  debounceMs?: number; // New prop to control debounce time
}

export const LoadingIndicator = ({
  size = "md",
  className,
  text,
  textClassName,
  fullscreen = false,
  fadeIn = true,
  showImmediately = false,
  debounceMs = 300 // Default debounce of 300ms
}: LoadingIndicatorProps) => {
  const [visible, setVisible] = useState(!fadeIn || showImmediately);
  const [shouldRender, setShouldRender] = useState(showImmediately);

  // Debounced transition effect
  useEffect(() => {
    let fadeTimer: NodeJS.Timeout;
    let renderTimer: NodeJS.Timeout;

    if (fadeIn && !showImmediately) {
      // Only render the component after the debounce period
      renderTimer = setTimeout(() => {
        setShouldRender(true);
        // Then start the fade-in
        fadeTimer = setTimeout(() => {
          setVisible(true);
        }, 50); // Short delay after rendering before starting fade-in
      }, debounceMs);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(renderTimer);
      };
    }
  }, [fadeIn, showImmediately, debounceMs]);

  // If not yet ready to render, return null
  if (!shouldRender && !showImmediately) {
    return null;
  }

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const containerClasses = fullscreen 
    ? "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50" 
    : "flex flex-col items-center justify-center";

  // Slower fade transition to avoid rapid flicker
  const opacityClass = fadeIn 
    ? `transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}` 
    : '';

  return (
    <div 
      className={cn(containerClasses, opacityClass, className)} 
      style={{ pointerEvents: 'none' }} // Ensure the indicator never intercepts clicks
    >
      <Loader2 className={cn("text-primary animate-spin", sizeClasses[size])} />
      {text && (
        <p className={cn("mt-2 text-sm text-muted-foreground", textClassName)}>
          {text}
        </p>
      )}
    </div>
  );
};
