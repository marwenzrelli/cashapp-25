
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ChevronDown } from "lucide-react";
import { Client } from "@/features/clients/types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ClientSearchFieldProps {
  id: string;
  label: string;
  clients: Client[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabledValue?: string;
}

export const ClientSearchField = ({
  id,
  label,
  clients,
  value,
  onChange,
  placeholder,
  disabledValue,
}: ClientSearchFieldProps) => {
  const { currency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClientName, setSelectedClientName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find selected client name when value changes
  useEffect(() => {
    if (value) {
      const selectedClient = clients.find(c => c.id.toString() === value);
      if (selectedClient) {
        setSelectedClientName(`${selectedClient.prenom} ${selectedClient.nom}`);
        setSearchTerm(`${selectedClient.prenom} ${selectedClient.nom}`);
      }
    } else {
      setSelectedClientName("");
      setSearchTerm("");
    }
  }, [value, clients]);

  // Filter clients based on search term
  const filteredClients = clients.filter(client => {
    if (!searchTerm.trim()) return true;
    
    const fullName = `${client.prenom} ${client.nom}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || 
           client.telephone?.includes(search) ||
           client.id.toString().includes(search);
  }).filter(client => client.id.toString() !== disabledValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    
    // If input is cleared, clear selection
    if (!newValue.trim()) {
      onChange("");
      setSelectedClientName("");
    }
  };

  const handleClientSelect = (client: Client) => {
    const fullName = `${client.prenom} ${client.nom}`;
    setSelectedClientName(fullName);
    setSearchTerm(fullName);
    onChange(client.id.toString());
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Delay hiding to allow click on dropdown item
    setTimeout(() => {
      if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
        setIsOpen(false);
        // Reset search term to selected client name if no valid selection
        if (selectedClientName) {
          setSearchTerm(selectedClientName);
        }
      }
    }, 200);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (selectedClientName) {
          setSearchTerm(selectedClientName);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedClientName]);

  return (
    <div className="space-y-2 relative">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            id={id}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="pl-10 pr-10"
            autoComplete="off"
          />
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Dropdown suggestions */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {filteredClients.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                Aucun client trouvé
              </div>
            ) : (
              <div className="py-1">
                {filteredClients.slice(0, 10).map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none transition-colors"
                    onClick={() => handleClientSelect(client)}
                    onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {client.prenom} {client.nom}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          ID: {client.id} • {client.telephone}
                        </span>
                        <span className={`text-xs font-medium ${
                          client.solde >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {client.solde.toLocaleString('fr-FR', { 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2 
                          })} {currency}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
                {filteredClients.length > 10 && (
                  <div className="p-2 text-xs text-muted-foreground text-center border-t">
                    +{filteredClients.length - 10} autres clients...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {id === 'fromClient' ? 'Compte qui envoie les fonds' : 'Compte qui reçoit les fonds'}
      </p>
    </div>
  );
};
