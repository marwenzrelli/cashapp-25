
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicClientOperationsHistory } from "./PublicClientOperationsHistory";
import { PublicClientPersonalInfo } from "./PublicClientPersonalInfo";
import { Client } from "@/features/clients/types";
import { Operation } from "@/features/operations/types";

interface ClientPublicPreviewProps {
  client: Client;
  operations: Operation[];
}

export const ClientPublicPreview: React.FC<ClientPublicPreviewProps> = ({ client, operations }) => {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            Aperçu du profil public client
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-primary/10 p-6 rounded-lg">
            <div className="container mx-auto max-w-6xl space-y-6">
              <PublicClientPersonalInfo client={client} />
              <PublicClientOperationsHistory 
                operations={operations} 
                clientId={typeof client.id === 'string' ? parseInt(client.id) : client.id}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
