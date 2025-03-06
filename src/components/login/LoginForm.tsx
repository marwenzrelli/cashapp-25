
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConnectionStatus } from "@/hooks/useAuth";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
  connectionStatus: ConnectionStatus;
  handleAuth: (e: React.FormEvent) => Promise<void>;
  handleRetryConnection: () => Promise<void>;
}

export const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  connectionStatus,
  handleAuth,
  handleRetryConnection
}: LoginFormProps) => {
  return (
    <form onSubmit={handleAuth} className="space-y-4">
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
          onClick={handleRetryConnection}
        >
          Vérifier la connexion
        </Button>
      )}
    </form>
  );
};
