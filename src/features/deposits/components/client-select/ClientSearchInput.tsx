
import { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ClientSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
}

export const ClientSearchInput = ({ value, onChange, isOpen }: ClientSearchInputProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus on search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Clear search function
  const clearSearch = () => {
    onChange("");
    searchInputRef.current?.focus();
  };

  return (
    <div className="p-2 sticky top-0 bg-popover z-10 border-b mb-1">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          ref={searchInputRef} 
          placeholder="Rechercher un client..." 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          onClick={e => e.stopPropagation()} 
          onTouchStart={e => e.stopPropagation()}
          autoComplete="off" 
          className="pl-8 pr-8 rounded-md" 
        />
        {value && (
          <button className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" onClick={clearSearch}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
