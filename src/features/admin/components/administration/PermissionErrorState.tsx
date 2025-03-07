
import { ErrorState } from "@/features/admin/components/administration/ErrorState";
import { PermissionErrorControls } from "./PermissionErrorControls";
import { SupervisorPromotionForm } from "./SupervisorPromotionForm";

interface PermissionErrorStateProps {
  errorMessage?: string;
  isRetrying: boolean;
  showPromotionForm: boolean;
  email: string;
  setEmail: (email: string) => void;
  isMakingSupervisor: boolean;
  onRetry: () => void;
  onShowPromotionForm: () => void;
  onHidePromotionForm: () => void;
  onPromote: (email: string) => void;
}

export const PermissionErrorState = ({
  errorMessage,
  isRetrying,
  showPromotionForm,
  email,
  setEmail,
  isMakingSupervisor,
  onRetry,
  onShowPromotionForm,
  onHidePromotionForm,
  onPromote
}: PermissionErrorStateProps) => {
  return (
    <ErrorState 
      permissionError={true} 
      errorMessage={errorMessage}
      onRetry={onRetry}
    >
      <div className="mt-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Vous n'avez pas les permissions nécessaires pour accéder ou modifier les profils utilisateurs.
          Cette fonctionnalité est réservée aux superviseurs de la plateforme.
        </p>
        
        {!showPromotionForm ? (
          <PermissionErrorControls 
            isRetrying={isRetrying}
            onRetry={onRetry}
            onShowPromotionForm={onShowPromotionForm}
          />
        ) : (
          <SupervisorPromotionForm
            email={email}
            setEmail={setEmail}
            isMakingSupervisor={isMakingSupervisor}
            onPromote={onPromote}
            onCancel={onHidePromotionForm}
          />
        )}
      </div>
    </ErrorState>
  );
};
