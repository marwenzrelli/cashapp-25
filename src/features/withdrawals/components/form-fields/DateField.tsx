
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export const DateField: React.FC<DateFieldProps> = ({ 
  value, 
  onChange, 
  id = "date" 
}) => {
  // Extract date and time components from the ISO string
  let dateValue = '';
  let timeValue = '';
  
  if (value) {
    try {
      const date = new Date(value);
      
      // Format date as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateValue = `${year}-${month}-${day}`;
      
      // Format time as HH:MM:SS
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      timeValue = `${hours}:${minutes}:${seconds}`;
      
      console.log("Parsed date/time values:", { original: value, dateValue, timeValue });
    } catch (error) {
      console.error("Error parsing date:", error);
    }
  }
  
  const handleDateChange = (newDate: string) => {
    try {
      if (!newDate) return; // Si la date est vide, ne rien faire
      
      // Préserver l'heure actuelle
      const currentDate = new Date(value || new Date());
      const hours = currentDate.getHours();
      const minutes = currentDate.getMinutes();
      const seconds = currentDate.getSeconds();
      
      // Créer une nouvelle date à partir de l'entrée utilisateur
      const [yearStr, monthStr, dayStr] = newDate.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr) - 1; // Mois est 0-indexé
      const day = parseInt(dayStr);
      
      // Créer un objet date avec les valeurs extraites
      const newDateObj = new Date();
      newDateObj.setFullYear(year);
      newDateObj.setMonth(month);
      newDateObj.setDate(day);
      
      // Préserver l'heure
      newDateObj.setHours(hours, minutes, seconds);
      
      console.log("Setting new date with preserved time:", {
        input: newDate,
        newDateObj: newDateObj.toISOString(),
        components: { year, month, day, hours, minutes, seconds }
      });
      
      onChange(newDateObj.toISOString());
    } catch (error) {
      console.error("Error handling date change:", error);
    }
  };

  const handleTimeChange = (newTime: string) => {
    try {
      if (!newTime) return; // Si l'heure est vide, ne rien faire
      
      // Préserver la date actuelle
      const currentDate = new Date(value || new Date());
      
      // Extraire les composants de la date
      const [timeParts, ...rest] = newTime.split('.');
      const [hoursStr, minutesStr, secondsStr] = timeParts.split(':');
      
      const hours = parseInt(hoursStr || '0');
      const minutes = parseInt(minutesStr || '0');
      const seconds = parseInt(secondsStr || '0');
      
      // Mettre à jour l'heure sur la date actuelle
      currentDate.setHours(hours, minutes, seconds);
      
      console.log("Setting new time with preserved date:", {
        input: newTime,
        result: currentDate.toISOString(),
        components: { hours, minutes, seconds }
      });
      
      onChange(currentDate.toISOString());
    } catch (error) {
      console.error("Error handling time change:", error);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Date et heure du retrait</Label>
      <div className="grid grid-cols-1 gap-2">
        <div>
          <Input
            id={id}
            type="date"
            value={dateValue}
            onChange={(e) => handleDateChange(e.target.value)}
            className="transition-all focus-visible:ring-primary/50"
          />
        </div>
        <div>
          <Input
            id={`${id}-time`}
            type="time" 
            step="1" // This allows seconds to be entered
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="transition-all focus-visible:ring-primary/50"
          />
        </div>
      </div>
    </div>
  );
};
