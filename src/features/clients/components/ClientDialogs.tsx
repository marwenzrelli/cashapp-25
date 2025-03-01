
import { Client } from "../types";
import { CreateClientDialog } from "./dialogs/CreateClientDialog";
import { EditClientDialog } from "./dialogs/EditClientDialog";
import { DeleteClientDialog } from "./dialogs/DeleteClientDialog";

type NewClientForm = {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  solde: number;
};

type EditClientForm = {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
};

interface ClientDialogsProps {
  isCreateOpen: boolean;
  isEditOpen: boolean;
  isDeleteOpen: boolean;
  selectedClient: Client | null;
  newClient: NewClientForm;
  editForm: EditClientForm;
  onCreateClose: () => void;
  onEditClose: () => void;
  onDeleteClose: () => void;
  onCreateSubmit: () => void;
  onEditSubmit: () => void;
  onDeleteSubmit: () => void;
  onNewClientChange: (client: NewClientForm) => void;
  onEditFormChange: (form: EditClientForm) => void;
}

export const ClientDialogs = ({
  isCreateOpen,
  isEditOpen,
  isDeleteOpen,
  selectedClient,
  newClient,
  editForm,
  onCreateClose,
  onEditClose,
  onDeleteClose,
  onCreateSubmit,
  onEditSubmit,
  onDeleteSubmit,
  onNewClientChange,
  onEditFormChange,
}: ClientDialogsProps) => {
  return (
    <>
      <CreateClientDialog
        isOpen={isCreateOpen}
        newClient={newClient}
        onClose={onCreateClose}
        onSubmit={onCreateSubmit}
        onChange={onNewClientChange}
      />
      
      <EditClientDialog
        isOpen={isEditOpen}
        selectedClient={selectedClient}
        editForm={editForm}
        onClose={onEditClose}
        onSubmit={onEditSubmit}
        onChange={onEditFormChange}
      />
      
      <DeleteClientDialog
        isOpen={isDeleteOpen}
        selectedClient={selectedClient}
        onClose={onDeleteClose}
        onSubmit={onDeleteSubmit}
      />
    </>
  );
};
