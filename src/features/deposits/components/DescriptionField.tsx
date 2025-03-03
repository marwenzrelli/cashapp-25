
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DescriptionFieldProps {
  description: string;
  onDescriptionChange: (value: string) => void;
}

export const DescriptionField = ({ description, onDescriptionChange }: DescriptionFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Input
        id="description"
        placeholder="Ajouter une description"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
      />
    </div>
  );
};
