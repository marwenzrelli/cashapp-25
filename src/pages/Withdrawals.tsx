
import { useAuthenticationCheck } from "@/features/admin/hooks/useAuthenticationCheck";
import { WithdrawalsPage } from "@/features/withdrawals/components/WithdrawalsPage";

const Withdrawals = () => {
  useAuthenticationCheck();
  
  return <WithdrawalsPage />;
};

export default Withdrawals;
