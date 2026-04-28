import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, TrendingUp, TrendingDown, ArrowRightLeft, Activity,
  CreditCard, LayoutDashboard, Settings, Sparkles, Search,
  Plus, User, Wallet,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { format } from "date-fns";

interface ClientResult {
  id: number;
  prenom: string;
  nom: string;
  telephone: string | null;
  solde: number;
}

interface OperationResult {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  label: string;
  amount: number;
  date: string;
  navigateTo: string;
}

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<ClientResult[]>([]);
  const [operations, setOperations] = useState<OperationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currency } = useCurrency();

  // Toggle with Cmd/Ctrl + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search clients & operations when query changes
  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setClients([]);
      setOperations([]);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        // Search clients
        const { data: clientData } = await supabase
          .from("clients")
          .select("id, prenom, nom, telephone, solde")
          .or(`prenom.ilike.%${trimmed}%,nom.ilike.%${trimmed}%,telephone.ilike.%${trimmed}%`)
          .limit(8);

        setClients(clientData || []);

        // Search operations (by amount or notes)
        const isNumeric = !isNaN(Number(trimmed));
        const opsResults: OperationResult[] = [];

        const [depRes, witRes, traRes] = await Promise.all([
          isNumeric
            ? supabase.from("deposits").select("id, client_name, amount, operation_date").eq("amount", Number(trimmed)).limit(5)
            : supabase.from("deposits").select("id, client_name, amount, operation_date, notes").or(`client_name.ilike.%${trimmed}%,notes.ilike.%${trimmed}%`).limit(5),
          isNumeric
            ? supabase.from("withdrawals").select("id, client_name, amount, operation_date").eq("amount", Number(trimmed)).limit(5)
            : supabase.from("withdrawals").select("id, client_name, amount, operation_date, notes").or(`client_name.ilike.%${trimmed}%,notes.ilike.%${trimmed}%`).limit(5),
          isNumeric
            ? supabase.from("transfers").select("id, from_client, to_client, amount, operation_date").eq("amount", Number(trimmed)).limit(5)
            : supabase.from("transfers").select("id, from_client, to_client, amount, operation_date, reason").or(`from_client.ilike.%${trimmed}%,to_client.ilike.%${trimmed}%,reason.ilike.%${trimmed}%`).limit(5),
        ]);

        (depRes.data || []).forEach((d: any) => opsResults.push({
          id: `dep-${d.id}`, type: "deposit",
          label: `Versement · ${d.client_name}`,
          amount: d.amount, date: d.operation_date,
          navigateTo: "/deposits",
        }));
        (witRes.data || []).forEach((w: any) => opsResults.push({
          id: `wit-${w.id}`, type: "withdrawal",
          label: `Retrait · ${w.client_name}`,
          amount: w.amount, date: w.operation_date,
          navigateTo: "/withdrawals",
        }));
        (traRes.data || []).forEach((t: any) => opsResults.push({
          id: `tra-${t.id}`, type: "transfer",
          label: `Virement · ${t.from_client} → ${t.to_client}`,
          amount: t.amount, date: t.operation_date,
          navigateTo: "/transfers",
        }));

        setOperations(opsResults);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [query, open]);

  const runCommand = (cmd: () => void) => {
    setOpen(false);
    setQuery("");
    cmd();
  };

  const pages = useMemo(() => [
    { label: "Tableau de Bord", icon: LayoutDashboard, path: "/" },
    { label: "Clients", icon: Users, path: "/clients" },
    { label: "Versements", icon: TrendingUp, path: "/deposits" },
    { label: "Retraits", icon: TrendingDown, path: "/withdrawals" },
    { label: "Virements", icon: ArrowRightLeft, path: "/transfers" },
    { label: "Historique des Opérations", icon: Activity, path: "/operations-history" },
    { label: "Opérations Directes", icon: ArrowRightLeft, path: "/direct-operations" },
    { label: "Statistiques", icon: CreditCard, path: "/statistics" },
    { label: "Insights IA", icon: Sparkles, path: "/insights" },
    { label: "Assistant IA", icon: Sparkles, path: "/ai-assistant" },
    { label: "Recherche", icon: Search, path: "/search" },
    { label: "Administration", icon: Settings, path: "/administration" },
  ], []);

  const quickActions = useMemo(() => [
    { label: "Nouveau versement", icon: TrendingUp, path: "/deposits" },
    { label: "Nouveau retrait", icon: TrendingDown, path: "/withdrawals" },
    { label: "Nouveau virement", icon: ArrowRightLeft, path: "/transfers" },
    { label: "Nouveau client", icon: Plus, path: "/clients" },
    { label: "Opération directe", icon: ArrowRightLeft, path: "/direct-operations" },
  ], []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Rechercher un client, une opération, une page..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? "Recherche..." : "Aucun résultat trouvé."}
        </CommandEmpty>

        {clients.length > 0 && (
          <>
            <CommandGroup heading="Clients">
              {clients.map((c) => (
                <CommandItem
                  key={`client-${c.id}`}
                  value={`client-${c.id}-${c.prenom}-${c.nom}`}
                  onSelect={() => runCommand(() => navigate(`/clients/${c.id}`))}
                >
                  <User className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="flex-1">{c.prenom} {c.nom}</span>
                  {c.telephone && <span className="text-xs text-muted-foreground mr-2">{c.telephone}</span>}
                  <span className={`text-xs font-medium ${c.solde >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {c.solde.toLocaleString()} {currency}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {operations.length > 0 && (
          <>
            <CommandGroup heading="Opérations">
              {operations.map((op) => {
                const Icon = op.type === "deposit" ? TrendingUp : op.type === "withdrawal" ? TrendingDown : ArrowRightLeft;
                const color = op.type === "deposit" ? "text-green-500" : op.type === "withdrawal" ? "text-red-500" : "text-purple-500";
                return (
                  <CommandItem
                    key={op.id}
                    value={`${op.id}-${op.label}`}
                    onSelect={() => runCommand(() => navigate(op.navigateTo))}
                  >
                    <Icon className={`mr-2 h-4 w-4 ${color}`} />
                    <span className="flex-1">{op.label}</span>
                    <span className="text-xs text-muted-foreground mr-2">
                      {op.date ? format(new Date(op.date), "dd/MM/yyyy HH:mm") : ""}
                    </span>
                    <span className="text-xs font-medium">{op.amount.toLocaleString()} {currency}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Actions rapides">
          {quickActions.map((a) => (
            <CommandItem
              key={a.label}
              value={a.label}
              onSelect={() => runCommand(() => navigate(a.path))}
            >
              <a.icon className="mr-2 h-4 w-4 text-primary" />
              {a.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Pages">
          {pages.map((p) => (
            <CommandItem
              key={p.path}
              value={`page-${p.label}`}
              onSelect={() => runCommand(() => navigate(p.path))}
            >
              <p.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
