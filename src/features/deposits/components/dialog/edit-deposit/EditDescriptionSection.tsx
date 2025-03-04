
import React from "react";
import { Label } from "@/components/ui/label";
import { ScrollText } from "lucide-react";
import { EditFormData } from "@/components/deposits/types";

interface EditDescriptionSectionProps {
  editForm: EditFormData;
  onEditFormChange: (field: keyof EditFormData, value: string) => void;
}

export const EditDescriptionSection: React.FC<EditDescriptionSectionProps> = ({
  editForm,
  onEditFormChange
}) => {
  return (
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
  );
};
