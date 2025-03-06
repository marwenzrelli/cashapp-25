
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientProfile from "./pages/ClientProfile";
import PublicClientProfile from "./pages/PublicClientProfile";
import Deposits from "./pages/Deposits";
import Withdrawals from "./pages/Withdrawals";
import Transfers from "./pages/Transfers";
import Statistics from "./pages/Statistics";
import Operations from "./pages/Operations";
import Administration from "./pages/Administration";
import NotFound from "./pages/NotFound";
import SupervisorCreation from "./pages/SupervisorCreation";
import AdminUtility from "./pages/AdminUtility";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-supervisor" element={<SupervisorCreation />} />
        <Route path="/admin-utility" element={<AdminUtility />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientProfile />} />
          <Route path="/public/client/:token" element={<PublicClientProfile />} />
          <Route path="/deposits" element={<Deposits />} />
          <Route path="/withdrawals" element={<Withdrawals />} />
          <Route path="/transfers" element={<Transfers />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/administration" element={<Administration />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
