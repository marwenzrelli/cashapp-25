
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectSeparator
} from "@/components/ui/select";
import { ActivitySortOption } from '../types';
import { 
  ClockIcon, 
  ArrowUpWideNarrow, 
  ArrowDownWideNarrow, 
  CreditCard, 
  Users 
} from 'lucide-react';

interface ActivitySortSelectProps {
  value: ActivitySortOption;
  onChange: (value: ActivitySortOption) => void;
}

export const ActivitySortSelect = ({ value, onChange }: ActivitySortSelectProps) => {
  return (
    <Select
      value={value}
      onValueChange={(newValue) => onChange(newValue as ActivitySortOption)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Trier par" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Période</SelectLabel>
          <SelectItem value="newest">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              <span>Plus récents</span>
            </div>
          </SelectItem>
          <SelectItem value="oldest">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              <span>Plus anciens</span>
            </div>
          </SelectItem>
        </SelectGroup>

        <SelectSeparator />

        <SelectGroup>
          <SelectLabel>Montant</SelectLabel>
          <SelectItem value="amount-desc">
            <div className="flex items-center gap-2">
              <ArrowDownWideNarrow className="h-4 w-4" />
              <span>Montant décroissant</span>
            </div>
          </SelectItem>
          <SelectItem value="amount-asc">
            <div className="flex items-center gap-2">
              <ArrowUpWideNarrow className="h-4 w-4" />
              <span>Montant croissant</span>
            </div>
          </SelectItem>
        </SelectGroup>

        <SelectSeparator />

        <SelectGroup>
          <SelectLabel>Type d'opération</SelectLabel>
          <SelectItem value="type">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Par type</span>
            </div>
          </SelectItem>
        </SelectGroup>

        <SelectSeparator />

        <SelectGroup>
          <SelectLabel>Client</SelectLabel>
          <SelectItem value="client">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Par client</span>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
