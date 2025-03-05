
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConnectionStatus } from "./types";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
  connectionStatus: ConnectionStatus;
  onRetryConnection: () => void;
}

export const LoginForm = ({ 
  onSubmit, 
  isLoading, 
  connectionStatus, 
  onRetryConnection 
}: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={connectionStatus === 'checking' || isLoading}
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={connectionStatus === 'checking' || isLoading}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || connectionStatus === 'checking' || connectionStatus === 'disconnected'}
      >
        {isLoading ? "Chargement..." : "Se connecter"}
      </Button>
      
      {connectionStatus === 'disconnected' && (
        <Button 
          type="button" 
          variant="outline" 
          className="w-full mt-2"
          onClick={onRetryConnection}
        >
          Vérifier la connexion
        </Button>
      )}
    </form>
  );
};
