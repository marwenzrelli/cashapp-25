
import { useState, useEffect } from "react";
import { Operation } from "@/features/operations/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditOperationFormProps {
  operation: Operation;
  amount: number;
  setAmount: (amount: number) => void;
  notes: string;
  setNotes: (notes: string) => void;
  loading: boolean;
}

export const EditOperationForm = ({
  operation,
  amount,
  setAmount,
  notes,
  setNotes,
  loading
}: EditOperationFormProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="amount">Montant</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          disabled={loading}
          min={0}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Description</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={loading}
          rows={3}
        />
      </div>
    </>
  );
};
