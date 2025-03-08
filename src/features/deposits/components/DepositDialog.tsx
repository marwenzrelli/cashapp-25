
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type DepositDialogProps } from "@/features/deposits/types";
import { MobileDepositDialog } from "./deposit-dialog/MobileDepositDialog";
import { DesktopDepositDialog } from "./deposit-dialog/DesktopDepositDialog";
import { useDepositForm } from "../hooks/useDepositForm";

export const DepositDialog = ({ open, onOpenChange, onConfirm }: DepositDialogProps) => {
  const {
    formState,
    setSelectedClient,
    setAmount,
    setDescription,
    handleDateChange,
    handleSubmit,
    isLoading,
    isValid,
    showSuccess,
    clients,
    fetchClients
  } = useDepositForm(onConfirm, onOpenChange);

  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open, fetchClients]);

  useEffect(() => {
    const channel = supabase
      .channel('public:clients')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        () => {
          console.log('Mise à jour des soldes détectée');
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchClients]);

  // Mobile version using Sheet
  if (window.innerWidth < 768) {
    return (
      <MobileDepositDialog
        open={open}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        clients={clients}
        formState={formState}
        setSelectedClient={setSelectedClient}
        setAmount={setAmount}
        setDescription={setDescription}
        handleDateChange={handleDateChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        isValid={isValid}
        showSuccess={showSuccess}
      />
    );
  }

  // Desktop version using Dialog
  return (
    <DesktopDepositDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      clients={clients}
      formState={formState}
      setSelectedClient={setSelectedClient}
      setAmount={setAmount}
      setDescription={setDescription}
      handleDateChange={handleDateChange}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      isValid={isValid}
      showSuccess={showSuccess}
    />
  );
};
