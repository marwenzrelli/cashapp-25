
-- Créer une table pour les opérations directes entre clients
CREATE TABLE public.direct_operations (
  id SERIAL PRIMARY KEY,
  from_client_id INTEGER REFERENCES public.clients(id),
  to_client_id INTEGER REFERENCES public.clients(id),
  from_client_name TEXT NOT NULL,
  to_client_name TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  operation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  status TEXT DEFAULT 'completed',
  operation_type TEXT DEFAULT 'direct_transfer' -- Pour distinguer des autres types
);

-- Ajouter des index pour améliorer les performances
CREATE INDEX idx_direct_operations_from_client ON public.direct_operations(from_client_id);
CREATE INDEX idx_direct_operations_to_client ON public.direct_operations(to_client_id);
CREATE INDEX idx_direct_operations_date ON public.direct_operations(operation_date);
CREATE INDEX idx_direct_operations_status ON public.direct_operations(status);

-- Ajouter une table pour les opérations directes supprimées (pour traçabilité)
CREATE TABLE public.deleted_direct_operations (
  id SERIAL PRIMARY KEY,
  original_id INTEGER NOT NULL,
  from_client_id INTEGER,
  to_client_id INTEGER,
  from_client_name TEXT NOT NULL,
  to_client_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  operation_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  status TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_by UUID REFERENCES auth.users(id)
);

-- Créer un trigger pour mettre à jour les soldes des clients automatiquement
CREATE OR REPLACE FUNCTION update_client_balances_direct_operation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Débiter le client expéditeur
    UPDATE public.clients 
    SET solde = solde - NEW.amount 
    WHERE id = NEW.from_client_id;
    
    -- Créditer le client destinataire
    UPDATE public.clients 
    SET solde = solde + NEW.amount 
    WHERE id = NEW.to_client_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Annuler l'opération: recréditer l'expéditeur et débiter le destinataire
    UPDATE public.clients 
    SET solde = solde + OLD.amount 
    WHERE id = OLD.from_client_id;
    
    UPDATE public.clients 
    SET solde = solde - OLD.amount 
    WHERE id = OLD.to_client_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
CREATE TRIGGER trigger_update_balances_direct_operations
  AFTER INSERT OR DELETE ON public.direct_operations
  FOR EACH ROW
  EXECUTE FUNCTION update_client_balances_direct_operation();

-- Activer RLS si nécessaire
ALTER TABLE public.direct_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deleted_direct_operations ENABLE ROW LEVEL SECURITY;

-- Politique RLS basique (à ajuster selon vos besoins d'authentification)
CREATE POLICY "Allow all operations on direct_operations" ON public.direct_operations
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on deleted_direct_operations" ON public.deleted_direct_operations
  FOR ALL USING (true);
