
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollText } from "lucide-react";

interface DescriptionFieldProps {
  description: string;
  setDescription: (description: string) => void;
}

export const DescriptionField = ({ description, setDescription }: DescriptionFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <div className="relative">
        <ScrollText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id="description"
          placeholder="Description du versement..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="pl-14 md:pl-9 transition-all focus-visible:ring-primary/50"
        />
      </div>
    </div>
  );
};
