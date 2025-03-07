
import React from "react";
import { DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export const WithdrawalFormLoading: React.FC = () => {
  return (
    <DialogContent className="sm:max-w-md">
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Chargement du formulaire...</p>
      </div>
    </DialogContent>
  );
};
