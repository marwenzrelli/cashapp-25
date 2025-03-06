
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../types";
import { ClientQRCode } from "./ClientQRCode";
import { RefObject } from "react";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { ClientIdBadge } from "./ClientIdBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientPublicPageInfo } from "./ClientPublicPageInfo";
import { LinkIcon, UserIcon } from "lucide-react";

interface ClientPersonalInfoProps {
  client: Client;
  clientId?: number;
  qrCodeRef?: RefObject<HTMLDivElement>;
  formatAmount?: (amount: number) => string;
}

export const ClientPersonalInfo = ({ 
  client, 
  clientId, 
  qrCodeRef,
  formatAmount = (amount) => `${amount.toLocaleString()} €`
}: ClientPersonalInfoProps) => {
  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Informations personnelles
          {clientId && <ClientIdBadge clientId={clientId} />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="personal" className="flex items-center gap-2 flex-1">
              <UserIcon className="h-4 w-4" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="public" className="flex items-center gap-2 flex-1">
              <LinkIcon className="h-4 w-4" />
              Page publique
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <PersonalInfoFields 
                  client={client} 
                  formatAmount={formatAmount} 
                  showBalance={true}
                />
              </div>
              {clientId && (
                <div className="flex justify-center md:justify-end" ref={qrCodeRef}>
                  <ClientQRCode
                    clientId={clientId}
                    clientName={`${client.prenom} ${client.nom}`}
                    size={256}
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="public">
            {clientId && (
              <ClientPublicPageInfo 
                clientId={clientId} 
                clientName={`${client.prenom} ${client.nom}`}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
