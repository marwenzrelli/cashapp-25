
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface SuccessMessageProps {
  amount: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ amount }) => {
  const { currency } = useCurrency();
  const isMobile = useIsMobile();
  const numericAmount = parseFloat(amount);
  
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className={`${isMobile ? 'h-24 w-24' : 'h-20 w-20'} rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-6`}>
        <CheckCircle className={`${isMobile ? 'h-14 w-14' : 'h-12 w-12'} text-green-600 dark:text-green-400`} />
      </div>
      
      <h2 className={`${isMobile ? 'text-2xl' : 'text-xl'} font-bold mb-4`}>Versement réussi!</h2>
      
      <p className={`${isMobile ? 'text-lg' : 'text-base'} mb-2`}>
        Le versement de 
        <span className="font-bold text-green-600 dark:text-green-400 mx-1">
          {numericAmount.toLocaleString()} {currency}
        </span> 
        a été effectué avec succès.
      </p>
      
      <p className="text-muted-foreground mt-4">
        Le solde du client a été mis à jour.
      </p>
    </div>
  );
};
