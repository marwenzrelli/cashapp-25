
import { Check } from "lucide-react";

export const SuccessMessage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
        <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="text-xl font-medium">Versement enregistré</h3>
      <p className="text-muted-foreground text-center mt-2">
        Le versement a été enregistré avec succès
      </p>
    </div>
  );
};
