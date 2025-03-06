
import { Card } from "@/components/ui/card";
import { AppLogo } from "@/components/login/AppLogo";
import { ConnectionStatusIndicator } from "@/components/login/ConnectionStatus";
import { ErrorAlert } from "@/components/login/ErrorAlert";
import { LoginForm } from "@/components/login/LoginForm";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    connectionStatus,
    errorMessage,
    handleAuth,
    handleRetryConnection
  } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <AppLogo />
          <h1 className="text-2xl font-bold">FinanceFlow Pro</h1>
          <p className="text-gray-500">Connectez-vous à votre compte</p>
          
          <ConnectionStatusIndicator status={connectionStatus} />
        </div>

        {errorMessage && (
          <ErrorAlert 
            errorMessage={errorMessage}
            connectionStatus={connectionStatus}
            onRetryConnection={handleRetryConnection}
          />
        )}

        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isLoading={isLoading}
          connectionStatus={connectionStatus}
          handleAuth={handleAuth}
          handleRetryConnection={handleRetryConnection}
        />
      </Card>
    </div>
  );
};

export default Login;
