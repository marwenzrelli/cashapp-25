
import { LoginCard } from "@/components/login/LoginCard";
import { LoginForm } from "@/components/login/LoginForm";
import { LoginError } from "@/components/login/LoginError";
import { useLoginPage } from "@/hooks/useLoginPage";

const Login = () => {
  const {
    isLoading,
    connectionStatus,
    errorMessage,
    handleRetryConnection,
    handleAuth
  } = useLoginPage();

  return (
    <LoginCard connectionStatus={connectionStatus}>
      {errorMessage && (
        <LoginError 
          errorMessage={errorMessage} 
          connectionStatus={connectionStatus} 
          onRetryConnection={handleRetryConnection} 
        />
      )}

      <LoginForm 
        onSubmit={handleAuth}
        isLoading={isLoading}
        connectionStatus={connectionStatus}
        onRetryConnection={handleRetryConnection}
      />
    </LoginCard>
  );
};

export default Login;
