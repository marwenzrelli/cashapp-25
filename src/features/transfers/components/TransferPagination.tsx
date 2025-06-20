
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ListFilter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransferPaginationProps {
  itemsPerPage: string;
  setItemsPerPage: (value: string) => void;
  totalItems: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  label?: string;
}

export const TransferPagination: React.FC<TransferPaginationProps> = ({
  itemsPerPage,
  setItemsPerPage,
  totalItems,
  currentPage,
  setCurrentPage,
  label = "éléments"
}) => {
  // Calculate total pages - if showing all items, we only have 1 page
  const totalPages = itemsPerPage === "tous" ? 1 : Math.ceil(totalItems / parseInt(itemsPerPage));
  
  // Calculate displayed items range
  const getDisplayedRange = () => {
    if (itemsPerPage === "tous") {
      return { start: 1, end: totalItems };
    }
    
    const start = (currentPage - 1) * parseInt(itemsPerPage) + 1;
    const end = Math.min(currentPage * parseInt(itemsPerPage), totalItems);
    return { start, end };
  };

  const { start, end } = getDisplayedRange();

  // Reset to page 1 when changing items per page
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <Card className="bg-gradient-to-r from-purple-50/30 to-blue-50/30 dark:from-purple-900/10 dark:to-blue-900/10 border-purple-100/50 dark:border-purple-800/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4 mb-4 px-0 py-0 my-[6px]">
          <div className="flex items-center gap-3">
            <Select
              value={itemsPerPage}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-[130px] bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
                <ListFilter className="h-3.5 w-3.5 mr-1.5 text-primary" />
                <SelectValue placeholder="Items" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50">
                <SelectItem value="10">10 {label}</SelectItem>
                <SelectItem value="25">25 {label}</SelectItem>
                <SelectItem value="50">50 {label}</SelectItem>
                <SelectItem value="100">100 {label}</SelectItem>
                <SelectItem value="tous">Tous</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-sm text-muted-foreground">
              {itemsPerPage === "tous" 
                ? `Affichage de tous les ${totalItems} ${label}`
                : `Affichage de ${start}-${end} sur ${totalItems} ${label}`
              }
            </div>
          </div>

          {/* Pagination controls - only show if not displaying all items */}
          {itemsPerPage !== "tous" && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className="h-8 w-8 p-0 text-xs"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-1">
          <div 
            className="bg-primary h-1 rounded-full transition-all duration-300"
            style={{ 
              width: itemsPerPage === "tous" ? "100%" : `${(end / totalItems) * 100}%`
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
