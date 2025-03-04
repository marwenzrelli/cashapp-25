
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollText } from "lucide-react";

interface NotesFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export const NotesField: React.FC<NotesFieldProps> = ({
  value,
  onChange,
  id = "notes"
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-normal">Notes</Label>
      <div className="relative">
        <ScrollText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          id={id}
          placeholder="Motif du retrait..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 h-12 text-base transition-all focus-visible:ring-primary/50"
        />
      </div>
    </div>
  );
};
