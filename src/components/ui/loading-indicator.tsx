
import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  textClassName?: string;
  fullscreen?: boolean;
}

export const LoadingIndicator = ({
  size = "md",
  className,
  text,
  textClassName,
  fullscreen = false
}: LoadingIndicatorProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const containerClasses = fullscreen 
    ? "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50" 
    : "flex flex-col items-center justify-center";

  return (
    <div className={cn(containerClasses, className)}>
      <Loader2 className={cn("text-primary animate-spin", sizeClasses[size])} />
      {text && (
        <p className={cn("mt-2 text-sm text-muted-foreground", textClassName)}>
          {text}
        </p>
      )}
    </div>
  );
};
