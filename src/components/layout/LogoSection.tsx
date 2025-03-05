
import { DollarSign } from "lucide-react";

export const LogoSection = () => {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5] to-[#8B5CF6] rounded-lg blur opacity-50"></div>
        <div className="relative bg-gradient-to-r from-[#9b87f5] to-[#8B5CF6] p-2 rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <DollarSign className="h-6 w-6 text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]" />
        </div>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#8B5CF6] text-transparent bg-clip-text">
        FinanceFlow Pro
      </span>
    </div>
  );
};
