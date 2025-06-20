
import { useAuthenticationCheck } from "@/features/admin/hooks/useAuthenticationCheck";
import { WithdrawalsPage } from "@/features/withdrawals/components/WithdrawalsPage";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

const Withdrawals = () => {
  useAuthenticationCheck();
  
  return (
    <>
      <WithdrawalsPage />
      <ScrollToTop />
    </>
  );
};

export default Withdrawals;
