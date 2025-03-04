
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Calendar, Clock, User, DollarSign, ScrollText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EditFormData } from "@/components/deposits/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Client } from "@/features/clients/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime, formatISODateTime } from "@/features/deposits/hooks/utils/dateUtils";

export interface EditDepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: EditFormData;
  onEditFormChange: (field: keyof EditFormData, value: string) => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
  selectedDeposit?: any;
  clients?: Client[];
}

export const EditDepositDialog: React.FC<EditDepositDialogProps> = ({
  isOpen,
  onOpenChange,
  editForm,
  onEditFormChange,
  onConfirm,
  isLoading = false,
  selectedDeposit,
  clients = []
}) => {
  const { currency } = useCurrency();

  // Effect to format date from created_at which is what's displayed in the deposit list
  useEffect(() => {
    if (selectedDeposit?.created_at) {
      const formattedDateTime = formatISODateTime(selectedDeposit.created_at);
      
      if (!editForm.date) {
        onEditFormChange('date', formattedDateTime.date);
      }
      
      if (!editForm.time) {
        onEditFormChange('time', formattedDateTime.time);
      }
    }
  }, [selectedDeposit, editForm.date, editForm.time, onEditFormChange]);

  // Use created_at for display date, matching the deposit list display
  const displayDate = selectedDeposit ? formatDateTime(selectedDeposit.created_at) : '';
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="rounded-xl bg-blue-100 dark:bg-blue-900/20 p-2">
              <Pencil className="h-6 w-6 text-blue-600" />
            </div>
            Modifier le versement
          </DialogTitle>
          <DialogDescription className="text-base text-gray-500">
            Modifiez les informations du versement du {displayDate}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Date and Time */}
          <div className="space-y-2">
            <Label htmlFor="depositDate" className="text-base font-medium">Date et heure du versement</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  id="depositDate"
                  type="date"
                  className="pl-10 border rounded-lg bg-gray-50"
                  value={editForm.date || ""}
                  onChange={(e) => onEditFormChange('date', e.target.value)}
                />
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              </div>
              <div className="relative">
                <Input
                  id="depositTime"
                  type="time"
                  step="1"
                  className="pl-10 border rounded-lg bg-gray-50"
                  value={editForm.time || ""}
                  onChange={(e) => onEditFormChange('time', e.target.value)}
                />
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
          
          {/* Client Select Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="clientSelect" className="text-base font-medium">Client</Label>
            <Select 
              value={editForm.clientName} 
              onValueChange={(value) => onEditFormChange('clientName', value)}
            >
              <SelectTrigger id="clientSelect" className="relative pl-10 border rounded-lg bg-gray-50">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {clients.map((client) => (
                  <SelectItem 
                    key={client.id} 
                    value={`${client.prenom} ${client.nom}`}
                  >
                    {client.prenom} {client.nom}
                    {client.solde < 0 && (
                      <span className="ml-2 text-red-500">
                        {client.solde.toLocaleString()} {currency}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {editForm.clientBalance && (
              <p className="text-sm text-red-500">{editForm.clientBalance} {currency}</p>
            )}
          </div>
          
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount" className="text-base font-medium">Montant</Label>
            <div className="relative">
              <Input
                id="edit-amount"
                type="number"
                placeholder="0.00"
                value={editForm.amount}
                onChange={(e) => onEditFormChange('amount', e.target.value)}
                className="pl-10 border rounded-lg bg-gray-50"
              />
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <div className="absolute right-3 top-3 text-gray-500">{currency}</div>
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes" className="text-base font-medium">Description</Label>
            <div className="relative">
              <textarea
                id="edit-notes"
                placeholder="Description du versement..."
                value={editForm.notes || ""}
                onChange={(e) => onEditFormChange('notes', e.target.value)}
                className="w-full min-h-[100px] pl-10 pt-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ScrollText className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>

        <hr className="mt-6" />

        <DialogFooter className="mt-4 sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-base">
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6 py-2 rounded-full text-base"
            disabled={isLoading}
          >
            <Pencil className="h-4 w-4" />
            {isLoading ? "En cours..." : "Modifier le versement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
