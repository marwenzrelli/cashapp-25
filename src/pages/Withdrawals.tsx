
import { useAuthenticationCheck } from "@/features/admin/hooks/useAuthenticationCheck";
import { WithdrawalsPage } from "@/features/withdrawals/components/WithdrawalsPage";

const Withdrawals = () => {
  useAuthenticationCheck(); // Ensure we're authenticated
  
  return <WithdrawalsPage />;
};

export default Withdrawals;
