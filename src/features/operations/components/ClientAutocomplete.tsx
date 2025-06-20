
import { useState, useEffect, useRef } from "react";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useClients } from "@/features/clients/hooks/useClients";

interface ClientAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const ClientAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Nom du client, description...",
  className = ""
}: ClientAutocompleteProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const { clients } = useClients();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      const filtered = clients.filter(client => {
        const fullName = `${client.prenom} ${client.nom}`.toLowerCase();
        const searchTerm = value.toLowerCase();
        return fullName.includes(searchTerm) || 
               client.email?.toLowerCase().includes(searchTerm) ||
               client.telephone?.includes(searchTerm);
      }).slice(0, 5); // Limiter à 5 suggestions
      
      setFilteredClients(filtered);
      setShowSuggestions(filtered.length > 0 && value.length >= 2);
    } else {
      setShowSuggestions(false);
      setFilteredClients([]);
    }
  }, [value, clients]);

  const handleSuggestionClick = (client: any) => {
    const fullName = `${client.prenom} ${client.nom}`;
    onChange(fullName);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleInputFocus = () => {
    if (value.length >= 2 && filteredClients.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      if (!suggestionRef.current?.contains(e.relatedTarget as Node)) {
        setShowSuggestions(false);
      }
    }, 150);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className={`pl-9 ${className}`}
        />
      </div>
      
      {showSuggestions && (
        <div 
          ref={suggestionRef}
          className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto"
        >
          {filteredClients.map((client) => (
            <div
              key={client.id}
              onClick={() => handleSuggestionClick(client)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
            >
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {client.prenom} {client.nom}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {client.email && (
                    <span className="mr-2">📧 {client.email}</span>
                  )}
                  {client.telephone && (
                    <span>📞 {client.telephone}</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-primary font-medium flex-shrink-0">
                {Number(client.solde).toLocaleString('fr-FR')} TND
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
