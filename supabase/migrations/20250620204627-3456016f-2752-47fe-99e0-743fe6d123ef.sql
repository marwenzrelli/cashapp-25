
-- Vérifier les totaux des opérations
SELECT 
  'Versements' as type,
  COUNT(*) as nombre,
  SUM(amount) as total
FROM deposits 
WHERE status = 'completed'

UNION ALL

SELECT 
  'Retraits' as type,
  COUNT(*) as nombre,
  SUM(amount) as total
FROM withdrawals 
WHERE status = 'completed'

UNION ALL

SELECT 
  'Virements' as type,
  COUNT(*) as nombre,
  SUM(amount) as total
FROM transfers 
WHERE status = 'completed'

UNION ALL

SELECT 
  'Opérations directes' as type,
  COUNT(*) as nombre,
  SUM(amount) as total
FROM direct_operations 
WHERE status = 'completed';

-- Vérifier le solde total des clients
SELECT 
  'Solde clients' as type,
  COUNT(*) as nombre_clients,
  SUM(solde) as solde_total
FROM clients 
WHERE status = 'active';

-- Vérifier s'il y a des opérations avec des statuts différents
SELECT 
  'Versements en attente' as type,
  COUNT(*) as nombre,
  SUM(amount) as total
FROM deposits 
WHERE status != 'completed'

UNION ALL

SELECT 
  'Retraits en attente' as type,
  COUNT(*) as nombre,
  SUM(amount) as total
FROM withdrawals 
WHERE status != 'completed'

UNION ALL

SELECT 
  'Virements en attente' as type,
  COUNT(*) as nombre,
  SUM(amount) as total
FROM transfers 
WHERE status != 'completed';

-- Vérifier les opérations supprimées qui pourraient affecter les calculs
SELECT 
  'Versements supprimés' as type,
  COUNT(*) as nombre,
  SUM(amount) as total
FROM deleted_deposits

UNION ALL

SELECT 
  'Retraits supprimés' as type,
  COUNT(*) as nombre,
  SUM(amount) as total
FROM deleted_withdrawals

UNION ALL

SELECT 
  'Virements supprimés' as type,
  COUNT(*) as nombre,
  SUM(amount) as total
FROM deleted_transfers;
