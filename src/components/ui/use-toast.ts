
import { useToast as useShadcnToast } from "@/hooks/use-toast";

// Export the hook for component usage
export const useToast = () => {
  return useShadcnToast();
};

// Export a pre-configured toast function for direct use
export const toast = useShadcnToast().toast;
