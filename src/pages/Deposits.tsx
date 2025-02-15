
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Deposits = () => {
  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Versements</h1>
        <p className="text-muted-foreground">
          Gérez les versements des clients
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des versements</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Implement deposits list */}
          <p className="text-muted-foreground">Aucun versement pour le moment</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deposits;
