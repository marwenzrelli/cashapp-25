
import React from 'react';

interface PublicClientErrorProps {
  error: string | null;
}

export const PublicClientError = ({ error }: PublicClientErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-destructive">
        {error || "Client non trouvé"}
      </h2>
    </div>
  );
};
