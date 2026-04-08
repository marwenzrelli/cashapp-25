

# Analyse generale et plan d'amelioration

## Problemes identifies

### 1. Code duplique -- Types Deposit definis deux fois
- `src/components/deposits/types.ts` et `src/features/deposits/types.ts` contiennent le meme type `Deposit`
- Certains fichiers importent depuis `@/components/deposits/types`, d'autres depuis `@/features/deposits/types`
- Risque d'incoherence si un fichier est modifie mais pas l'autre

### 2. Hook useFetchDeposits duplique
- `src/features/deposits/hooks/useFetchDeposits.ts` (utilise `fetchAllRows`)
- `src/features/deposits/hooks/deposit-hooks/useFetchDeposits.ts` (utilise une requete classique limitee a 1000 lignes)
- Le second est obsolete et pourrait causer des bugs si utilise quelque part

### 3. Hooks useOperations et useOperationsFetcher redondants
- `useOperations.ts` et `useOperationsFetcher.ts` font essentiellement la meme chose (fetch deposits + withdrawals + transfers avec `fetchAllRows`)
- Double logique de transformation et de tri

### 4. Realtime completement desactive (dead code)
- 8 fichiers dans `src/features/clients/hooks/operations/realtime/` sont du code mort
- Le hook principal desactive tout (`"Realtime subscriptions are completely disabled"`)
- Tout ce code devrait etre supprime ou remplace par une solution fonctionnelle

### 5. Trop de console.log en production
- 2034 occurrences de `console.log` dans 99 fichiers
- Degrade les performances et pollue la console
- Devrait utiliser un logger conditionnel (actif en dev seulement)

### 6. Performance -- fetchAllRows charge TOUT en memoire
- Chaque page (deposits, withdrawals, operations, treasury) charge l'integralite des donnees
- Plusieurs pages font des fetch identiques en parallele (deposits fetches 4 fois si on visite operations + deposits + treasury + dashboard)
- Pas de cache partage entre les hooks (React Query est installe mais pas utilise pour ces donnees)

### 7. Dashboard stats mensuelles approximatives
- Le RPC `get_dashboard_stats` retourne les totaux globaux
- Les stats mensuelles sont calculees en divisant simplement par 6, ce qui donne des valeurs incorrectes
- Devrait calculer les vrais totaux par mois via SQL

### 8. Error checking inutile apres fetchAllRows
- Dans `useOperations.ts` et `useOperationsFetcher.ts`, apres `fetchAllRows`, le code wrappe les resultats dans `{ data, error: null }` puis verifie `.error` -- ce qui est toujours null
- `fetchAllRows` lance une exception en cas d'erreur, donc ces checks sont du code mort

---

## Plan d'implementation (par priorite)

### Etape 1 -- Supprimer les doublons de types et hooks
- Supprimer `src/components/deposits/types.ts`, garder `src/features/deposits/types.ts` comme source unique
- Mettre a jour les 10+ imports qui referent a `@/components/deposits/types`
- Supprimer `src/features/deposits/hooks/deposit-hooks/useFetchDeposits.ts` (version obsolete)

### Etape 2 -- Consolider les hooks d'operations
- Fusionner `useOperationsFetcher.ts` dans `useOperations.ts`
- Supprimer le wrapper `{ data, error: null }` inutile
- Nettoyer la logique de transformation

### Etape 3 -- Supprimer le code mort realtime
- Supprimer les 8 fichiers dans `src/features/clients/hooks/operations/realtime/`
- Supprimer les imports/references a `useRealtimeSubscription`

### Etape 4 -- Ajouter un logger conditionnel
- Creer `src/utils/logger.ts` qui log uniquement en `import.meta.env.DEV`
- Remplacer les `console.log` critiques par ce logger dans les hooks de donnees

### Etape 5 -- Utiliser React Query pour le cache partage
- Remplacer les `useState` + `useEffect` + `fetchAllRows` par des `useQuery` de React Query
- Cle de cache partagee pour eviter les fetches redondants entre pages
- Invalidation automatique apres mutations (create/update/delete)

### Etape 6 -- Corriger les stats mensuelles du dashboard
- Creer un nouveau RPC `get_monthly_stats` qui retourne les vrais totaux par mois
- Mettre a jour `useDashboardData` pour utiliser les vraies donnees mensuelles

---

## Impact attendu
- Moins de code a maintenir (~15 fichiers supprimes ou simplifies)
- Donnees coherentes entre toutes les pages grace au cache React Query
- Performances ameliorees (moins de fetches redondants)
- Console propre en production
- Stats mensuelles correctes dans le dashboard

