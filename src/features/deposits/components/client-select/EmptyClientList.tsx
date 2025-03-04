
interface EmptyClientListProps {
  message?: string;
  searchTerm?: string;
}

export const EmptyClientList = ({ message = "Aucun client trouvé", searchTerm }: EmptyClientListProps) => {
  return (
    <div className="p-4 text-center text-muted-foreground">
      {searchTerm ? `Aucun résultat pour "${searchTerm}"` : message}
    </div>
  );
};
