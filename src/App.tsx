import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Deposits from "./pages/Deposits";
import Withdrawals from "./pages/Withdrawals";
import Transfers from "./pages/Transfers";
import Statistics from "./pages/Statistics";
import Operations from "./pages/Operations";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { CurrencyProvider } from "./contexts/CurrencyContext";

const queryClient = new QueryClient();

function App() {
  return (
    <CurrencyProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/deposits" element={<Deposits />} />
                <Route path="/withdrawals" element={<Withdrawals />} />
                <Route path="/transfers" element={<Transfers />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/operations" element={<Operations />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </CurrencyProvider>
  );
}

export default App;
