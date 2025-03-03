
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

  // Handle input changes without triggering selection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent the event from bubbling up to parent components
    onChange(e.target.value);
  };

  return (
    <div className="p-2 sticky top-0 bg-popover z-10 border-b mb-1">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          ref={searchInputRef} 
          placeholder="Rechercher un client..." 
          value={value} 
          onChange={handleInputChange} 
          onClick={e => e.stopPropagation()} 
          onTouchStart={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()} // Prevent keyboard events from bubbling up
          autoComplete="off" 
          className="pl-8 pr-8 rounded-md" 
        />
        {value && (
          <button 
            type="button"
            className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" 
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
    </div>
  );
};
