
import { useState } from "react";
import { useUsers } from "@/features/admin/hooks/useUsers";
import { useAuthenticationCheck } from "@/features/admin/hooks/useAuthenticationCheck";
import { LoadingState } from "@/features/admin/components/administration/LoadingState";
import { AccessDenied } from "@/features/admin/components/administration/AccessDenied";
import { AdminDashboard } from "@/features/admin/components/administration/AdminDashboard";
import { PermissionErrorState } from "@/features/admin/components/administration/PermissionErrorState";
import { GeneralErrorState } from "@/features/admin/components/administration/GeneralErrorState";
import { NoUserProfileState } from "@/features/admin/components/administration/NoUserProfileState";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

const Administration = () => {
  useAuthenticationCheck();
  
  const { 
    users, 
    currentUser, 
    isLoading, 
    error: usersError,
    isRetrying,
    retryLoading,
    isMakingSupervisor,
    toggleUserStatus,
    addUser,
    updateUser,
    updatePermissions,
    deleteUser,
    retryInitialization,
    makeSelfSupervisor
  } = useUsers();
  
  const [email, setEmail] = useState("");
  const [showPromotionForm, setShowPromotionForm] = useState(false);

  if (isLoading) {
    return <LoadingState />;
  }

  const hasPermissionError = usersError && (
    usersError.message?.includes("violates row-level security policy") ||
    usersError.message?.includes("not_admin") ||
    usersError.message?.includes("User not allowed")
  );

  if (hasPermissionError) {
    return (
      <>
        <PermissionErrorState
          errorMessage={usersError?.message}
          isRetrying={isRetrying}
          showPromotionForm={showPromotionForm}
          email={email}
          setEmail={setEmail}
          isMakingSupervisor={isMakingSupervisor}
          onRetry={retryInitialization}
          onShowPromotionForm={() => setShowPromotionForm(true)}
          onHidePromotionForm={() => setShowPromotionForm(false)}
          onPromote={makeSelfSupervisor}
        />
        <ScrollToTop />
      </>
    );
  }

  if (usersError) {
    return (
      <>
        <GeneralErrorState 
          errorMessage={usersError.message || ""}
          isRetrying={isRetrying}
          onRetry={retryInitialization}
        />
        <ScrollToTop />
      </>
    );
  }

  if (!currentUser) {
    return (
      <>
        <NoUserProfileState
          isRetrying={isRetrying}
          onRetry={retryInitialization}
        />
        <ScrollToTop />
      </>
    );
  }

  if (currentUser.role !== 'supervisor') {
    return (
      <>
        <AccessDenied message="Cette section est réservée aux superviseurs." />
        <ScrollToTop />
      </>
    );
  }

  return (
    <>
      <AdminDashboard
        users={users}
        currentUser={currentUser}
        toggleUserStatus={toggleUserStatus}
        updateUser={updateUser}
        updatePermissions={updatePermissions}
        deleteUser={deleteUser}
        addUser={addUser}
      />
      <ScrollToTop />
    </>
  );
};

export default Administration;
