
import { SearchBar } from "../SearchBar";
import { TransferPagination } from "@/features/transfers/components/TransferPagination";

interface DepositsSearchSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  itemsPerPage: string;
  setItemsPerPage: (value: string) => void;
  totalItems: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export const DepositsSearchSection = ({
  searchTerm,
  setSearchTerm,
  itemsPerPage,
  setItemsPerPage,
  totalItems,
  currentPage,
  setCurrentPage
}: DepositsSearchSectionProps) => {
  return (
    <>
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        totalDeposits={totalItems}
      />
      
      <TransferPagination
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalItems={totalItems}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        label="versements"
      />
    </>
  );
};
