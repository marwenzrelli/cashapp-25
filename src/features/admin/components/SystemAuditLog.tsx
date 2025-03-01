
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserActivityTab } from "./audit-log/UserActivityTab";
import { OperationsHistoryTab } from "./audit-log/OperationsHistoryTab";
import { DeletedOperationsTab } from "./audit-log/DeletedOperationsTab";

export const SystemAuditLog = () => {
  const [activeTab, setActiveTab] = useState("user-activity");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Journal d'audit du système</CardTitle>
        <CardDescription>
          Historique des connexions, des opérations réalisées et supprimées
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="user-activity">Connexions</TabsTrigger>
            <TabsTrigger value="operations-history">Opérations réalisées</TabsTrigger>
            <TabsTrigger value="deleted-operations">Opérations supprimées</TabsTrigger>
          </TabsList>
          
          <TabsContent value="user-activity">
            <UserActivityTab />
          </TabsContent>
          
          <TabsContent value="operations-history">
            <OperationsHistoryTab />
          </TabsContent>
          
          <TabsContent value="deleted-operations">
            <DeletedOperationsTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
