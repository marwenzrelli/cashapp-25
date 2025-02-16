
import React from "react";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";
import { Operation } from "../types";

export const getTypeStyle = (type: Operation["type"]) => {
  switch (type) {
    case "deposit":
      return "bg-green-50 text-green-600 dark:bg-green-950/50";
    case "withdrawal":
      return "bg-red-50 text-red-600 dark:bg-red-950/50";
    case "transfer":
      return "bg-purple-50 text-purple-600 dark:bg-purple-950/50";
  }
};

export const getTypeIcon = (type: Operation["type"]): JSX.Element => {
  switch (type) {
    case "deposit":
      return React.createElement(ArrowUpCircle, { size: 16 });
    case "withdrawal":
      return React.createElement(ArrowDownCircle, { size: 16 });
    case "transfer":
      return React.createElement(RefreshCcw, { size: 16 });
  }
};

export const getTypeLabel = (type: Operation["type"]) => {
  switch (type) {
    case "deposit":
      return "Versement";
    case "withdrawal":
      return "Retrait";
    case "transfer":
      return "Virement";
  }
};
