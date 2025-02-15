
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Withdrawals = () => {
  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Retraits</h1>
        <p className="text-muted-foreground">
          Gérez les retraits des clients
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des retraits</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Implement withdrawals list */}
          <p className="text-muted-foreground">Aucun retrait pour le moment</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Withdrawals;
