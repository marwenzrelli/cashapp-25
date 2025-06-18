
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import Layout from "./components/Layout";

// Pages
import Index from "./pages/Index";
import Clients from "./pages/Clients";
import ClientProfile from "./pages/ClientProfile";
import PublicClientProfile from "./pages/PublicClientProfile";
import Deposits from "./pages/Deposits";
import Withdrawals from "./pages/Withdrawals";
import Transfers from "./pages/Transfers";
import Operations from "./pages/Operations";
import DirectOperations from "./pages/DirectOperations";
import Statistics from "./pages/Statistics";
import Administration from "./pages/Administration";
import Login from "./pages/Login";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/public/client/:token" element={<PublicClientProfile />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="dashboard" element={<Index />} />
                  <Route path="clients" element={<Clients />} />
                  <Route path="clients/:id" element={<ClientProfile />} />
                  <Route path="deposits" element={<Deposits />} />
                  <Route path="withdrawals" element={<Withdrawals />} />
                  <Route path="transfers" element={<Transfers />} />
                  <Route path="operations-history" element={<Operations />} />
                  <Route path="direct-operations" element={<DirectOperations />} />
                  <Route path="statistics" element={<Statistics />} />
                  <Route path="administration" element={<Administration />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
