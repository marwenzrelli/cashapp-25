
import { useState, useEffect } from "react";
import { ArrowRight, User, Pencil, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useClients } from "@/features/clients/hooks/useClients";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/features/deposits/components/StatsCard";
import { SearchBar } from "@/features/deposits/components/SearchBar";
import { DeleteDepositDialog } from "@/features/deposits/components/DeleteDepositDialog";
import { type Deposit } from "@/features/deposits/types";
import { DepositDialog } from "@/features/deposits/components/DepositDialog";

const Deposits = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [deposits, setDeposits] = useState<Deposit[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté pour accéder à cette page");
        navigate("/login");
        return;
      }
    };

    checkAuth();
    fetchDeposits();
  }, [navigate]);

  const fetchDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des versements");
        console.error("Erreur:", error);
        return;
      }

      const formattedDeposits: Deposit[] = data.map(d => ({
        id: d.id,
        client: d.client_name,
        amount: Number(d.amount),
        date: new Date(d.operation_date).toLocaleDateString(),
        description: d.notes || ''
      }));

      setDeposits(formattedDeposits);
    } catch (error) {
      console.error("Erreur lors du chargement des versements:", error);
      toast.error("Erreur lors du chargement des versements");
    }
  };

  const handleDelete = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDeposit) return;

    try {
      const { error } = await supabase
        .from('deposits')
        .delete()
        .eq('id', selectedDeposit.id);

      if (error) {
        toast.error("Erreur lors de la suppression du versement");
        console.error("Erreur:", error);
        return;
      }

      setDeposits(prevDeposits =>
        prevDeposits.filter(deposit => deposit.id !== selectedDeposit.id)
      );

      setIsDeleteDialogOpen(false);
      toast.success("Versement supprimé", {
        description: `Le versement a été retiré de la base de données.`
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du versement");
    }
  };

  const handleEdit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setIsDialogOpen(true);
    toast.info("Mode édition", {
      description: `Modification du versement de ${deposit.amount} TND`
    });
  };

  const filteredDeposits = deposits.filter(deposit => 
    deposit.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDeposit = async (deposit: Deposit) => {
    try {
      const { error } = await supabase
        .from('deposits')
        .insert({
          client_name: deposit.client,
          amount: deposit.amount,
          operation_date: new Date(deposit.date).toISOString(),
          notes: deposit.description
        });

      if (error) {
        toast.error("Erreur lors de la création du versement");
        console.error("Erreur:", error);
        return;
      }

      await fetchDeposits();
      setIsDialogOpen(false);
      toast.success("Nouveau versement créé", {
        description: `Un nouveau versement de ${deposit.amount} TND a été ajouté.`
      });
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error("Erreur lors de la création du versement");
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Gestion des versements</h1>
        <p className="text-muted-foreground">
          Gérez les versements de vos clients
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StatsCard deposits={deposits} />
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          onNewDeposit={() => setIsDialogOpen(true)}
          totalDeposits={filteredDeposits.length}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-6 w-6 text-primary" />
              Liste des versements
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Affichage de {Math.min(parseInt(itemsPerPage), filteredDeposits.length)} sur {filteredDeposits.length} versements
              </span>
            </div>
          </div>
          <CardDescription>
            Gérez les versements et accédez à leurs informations détaillées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3 font-medium">Client</th>
                  <th className="p-3 font-medium">Montant</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Description</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeposits.slice(0, parseInt(itemsPerPage)).map((deposit) => (
                  <tr key={deposit.id} className="group border-b transition-colors hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <User className="h-10 w-10 text-primary/20 transition-colors group-hover:text-primary/40" />
                          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {deposit.client}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ID: {deposit.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium tabular-nums">
                        {deposit.amount.toLocaleString()} TND
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {deposit.date}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {deposit.description}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600 transition-all duration-300"
                          onClick={() => handleEdit(deposit)}
                        >
                          <Pencil className="h-4 w-4 transition-all duration-300 ease-in-out transform hover:scale-125 hover:rotate-[360deg]" />
                          <span className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600 transition-all duration-300"
                          onClick={() => handleDelete(deposit)}
                        >
                          <Trash2 className="h-4 w-4 transition-all duration-300 ease-in-out transform hover:scale-125 hover:-translate-y-1" />
                          <span className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <DeleteDepositDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedDeposit={selectedDeposit}
        onConfirm={confirmDelete}
      />

      <DepositDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleCreateDeposit}
      />
    </div>
  );
};

export default Deposits;
