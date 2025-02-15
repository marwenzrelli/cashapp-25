
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Transfers = () => {
  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Virements</h1>
        <p className="text-muted-foreground">
          Gérez les virements entre comptes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des virements</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Implement transfers list */}
          <p className="text-muted-foreground">Aucun virement pour le moment</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transfers;
