
import React from "react";
import { DirectOperationsList } from "@/features/direct-operations/components/DirectOperationsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DirectOperations = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Opérations Directes</h1>
        <p className="text-muted-foreground">
          Gérez les transferts directs entre clients
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Opérations Directes</CardTitle>
        </CardHeader>
        <CardContent>
          <DirectOperationsList />
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectOperations;
