
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientProfile from "./pages/ClientProfile";
import Deposits from "./pages/Deposits";
import Withdrawals from "./pages/Withdrawals";
import Transfers from "./pages/Transfers";
import Operations from "./pages/Operations";
import Statistics from "./pages/Statistics";
import Administration from "./pages/Administration";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import PublicClientProfile from "./pages/PublicClientProfile";
import SupervisorCreation from "./pages/SupervisorCreation";
import AdminUtility from "./pages/AdminUtility";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";

function App() {
  useEffect(() => {
    document.title = "Gestion de Transactions | Smart Talib";
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/clients/:clientId/public" element={<PublicClientProfile />} />
        <Route path="/admin-utility" element={<AdminUtility />} />
        <Route path="/create-supervisor" element={<SupervisorCreation />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:clientId" element={<ClientProfile />} />
          <Route path="deposits" element={<Deposits />} />
          <Route path="withdrawals" element={<Withdrawals />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="operations" element={<Operations />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="administration" element={<Administration />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </Router>
  );
}

export default App;
