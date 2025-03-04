import { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ClientSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isOpen?: boolean;
  count?: number;
  isScrolling?: boolean;
}

export const ClientSearchInput = ({ value, onChange, isOpen, count, isScrolling }: ClientSearchInputProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !searchInputRef.current) return;
    
    const timerRef = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    
    return () => clearTimeout(timerRef);
  }, [isOpen]);

  const clearSearch = () => {
    onChange("");
    searchInputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onChange(e.target.value);
  };

  return (
    <div className="bg-popover z-10 mb-0.5">
      <div className="relative">
        <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input 
          ref={searchInputRef} 
          placeholder="Rechercher un client..." 
          value={value} 
          onChange={handleInputChange} 
          onClick={e => e.stopPropagation()} 
          onTouchStart={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()} 
          autoComplete="off" 
          className="pl-7 pr-7 py-1 h-7 text-sm rounded-md" 
          disabled={isScrolling}
        />
        {value && (
          <button 
            type="button"
            className="absolute right-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" 
            onClick={(e) => {
              e.stopPropagation();
              clearSearch();
            }}
            onTouchStart={e => e.stopPropagation()}
          >
            ✕
          </button>
        )}
      </div>
      {count !== undefined && (
        <div className="text-xs text-muted-foreground mt-0.5 ml-1">
          {count} {count === 1 ? 'client trouvé' : 'clients trouvés'}
        </div>
      )}
    </div>
  );
};
