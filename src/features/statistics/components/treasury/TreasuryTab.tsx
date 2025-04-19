
import React from "react";
import { TreasuryTable } from "./TreasuryTable";
import { TreasuryTotals } from "./TreasuryTotals";
import { Card, CardContent } from "@/components/ui/card";
import { Operation } from "@/features/operations/types";

interface TreasuryTabProps {
  operations: Operation[];
  isLoading: boolean;
}

export const TreasuryTab = ({ operations, isLoading }: TreasuryTabProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-full bg-muted rounded" />
            <div className="h-8 w-3/4 bg-muted rounded" />
            <div className="h-8 w-5/6 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <TreasuryTable operations={operations} />
        </CardContent>
      </Card>
      <TreasuryTotals operations={operations} />
    </div>
  );
};
