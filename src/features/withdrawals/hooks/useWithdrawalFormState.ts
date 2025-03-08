
import { useState, useEffect, useRef } from "react";
import { 
  UseWithdrawalFormStateProps, 
  WithdrawalFormState 
} from "./form/withdrawalFormTypes";
import { 
  initializeNewForm, 
  initializeFormFromWithdrawal 
} from "./form/withdrawalFormInitializer";

export const useWithdrawalFormState = ({
  isOpen,
  clients,
  selectedClient,
  setSelectedClient,
  isEditing,
  selectedWithdrawal
}: UseWithdrawalFormStateProps) => {
  const [formState, setFormState] = useState<WithdrawalFormState>(initializeNewForm());
  const [isLoading, setIsLoading] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  
  // Add a ref to track if form has been initialized for this session
  const initializedRef = useRef(false);

  // Initialize the form only when the modal opens
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setFormInitialized(false);
      initializedRef.current = false;
      return;
    }

    // Only initialize if not already done for this session
    if (!initializedRef.current) {
      initializedRef.current = true;
      initializeForm();
    }
    
  }, [isOpen]);

  const initializeForm = () => {
    try {
      console.log("Initializing withdrawal form with:", { 
        isEditing, 
        selectedWithdrawal, 
        selectedClient 
      });
      
      if (isEditing && selectedWithdrawal) {
        // Initialize form data from existing withdrawal
        const formData = initializeFormFromWithdrawal(selectedWithdrawal, clients);
        
        if (formData) {
          console.log("Setting withdrawal form data:", formData);
          setFormState(formData);
          
          // Update selected client in parent
          setSelectedClient(formData.clientId);
        } else {
          // Fallback to empty form if client not found
          resetForm();
        }
      } else if (selectedClient) {
        // Just update the client ID when not editing but client is preselected
        setFormState(prev => ({
          ...prev,
          clientId: selectedClient
        }));
      } else {
        // Fresh new withdrawal
        resetForm();
      }
      
    } catch (error) {
      console.error("Error initializing form:", error);
      resetForm(); // Fall back to empty form on error
    } finally {
      setFormInitialized(true);
    }
  };

  // Helper to reset form
  const resetForm = () => {
    setFormState(initializeNewForm());
  };

  const handleInputChange = (field: keyof WithdrawalFormState, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    formState,
    setFormState,
    isLoading,
    setIsLoading,
    formInitialized,
    handleInputChange
  };
};
