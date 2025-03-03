
interface EmptyClientListProps {
  message?: string;
}

export const EmptyClientList = ({ message = "Aucun client trouvé" }: EmptyClientListProps) => {
  return (
    <div className="p-4 text-center text-muted-foreground">
      {message}
    </div>
  );
};
