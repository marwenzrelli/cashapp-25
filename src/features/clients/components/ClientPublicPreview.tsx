
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicClientOperationsHistory } from "./PublicClientOperationsHistory";
import { PublicClientPersonalInfo } from "./PublicClientPersonalInfo";
import { Client } from "@/features/clients/types";
import { Operation } from "@/features/operations/types";

interface ClientPublicPreviewProps {
  client: Client;
  operations: Operation[];
  isMobilePreview?: boolean;
}

export const ClientPublicPreview: React.FC<ClientPublicPreviewProps> = ({ 
  client, 
  operations,
  isMobilePreview = false
}) => {
  console.log("ClientPublicPreview - Client:", client.prenom, client.nom);
  console.log("ClientPublicPreview - Operations received:", operations?.length || 0);
  console.log("ClientPublicPreview - Operations details:", operations);

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            Aperçu du profil public client
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="bg-primary/10 p-6 rounded-lg">
            {isMobilePreview ? (
              // Mobile preview with a fixed width and smartphone frame
              <div className="mx-auto" style={{ maxWidth: "380px" }}>
                <div className="border-[8px] border-gray-800 rounded-[40px] shadow-xl overflow-hidden bg-white">
                  {/* Smartphone top notch */}
                  <div className="h-6 bg-gray-800 flex justify-center items-center">
                    <div className="w-20 h-4 bg-black rounded-b-xl"></div>
                  </div>
                  {/* Content with scrollable area */}
                  <div className="h-[600px] overflow-y-auto p-2 bg-gray-50">
                    <div className="space-y-4">
                      <PublicClientPersonalInfo client={client} operations={operations} />
                      <PublicClientOperationsHistory 
                        operations={operations} 
                        client={client}
                      />
                    </div>
                  </div>
                  {/* Smartphone bottom bar */}
                  <div className="h-4 bg-gray-800 flex justify-center items-center">
                    <div className="w-16 h-1 bg-gray-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            ) : (
              // Standard desktop view
              <div className="container mx-auto max-w-6xl space-y-6">
                <PublicClientPersonalInfo client={client} operations={operations} />
                <PublicClientOperationsHistory 
                  operations={operations} 
                  client={client}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
