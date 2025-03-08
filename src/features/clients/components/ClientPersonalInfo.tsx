import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Edit, Copy, User, Mail, Phone, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Client } from "@/features/clients/types";
import { useClipboard } from '@mantine/hooks';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { DepositDialog } from './dialogs/DepositDialog';
import { useClientDeposit } from '../hooks/operations/useClientDeposit';
import { WithdrawalDialog } from './dialogs/WithdrawalDialog';
import { useClientWithdrawal } from '../hooks/operations/useClientWithdrawal';
import { TransferDialog } from './dialogs/TransferDialog';
import { useClientTransfer } from '../hooks/operations/useClientTransfer';
import { formatCurrency } from '@/lib/utils';

interface ClientPersonalInfoProps {
  client: Client;
  refreshClientBalance: () => Promise<boolean>;
}

export const ClientPersonalInfo: React.FC<ClientPersonalInfoProps> = ({ client, refreshClientBalance }) => {
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const clipboard = useClipboard();
  const navigate = useNavigate();
  
  const { handleDeposit, isProcessing: isDepositProcessing } = useClientDeposit(client.id, refreshClientBalance);
  const { handleWithdrawal, isProcessing: isWithdrawalProcessing } = useClientWithdrawal(client.id, refreshClientBalance);
  const { handleTransfer, isProcessing: isTransferProcessing } = useClientTransfer(client.id, refreshClientBalance);

  const handleCopy = (text: string, label: string) => {
    clipboard.copy(text);
    toast.success(`${label} copié dans le presse-papier!`);
  };

  const handleEditClient = useCallback(() => {
    navigate(`/clients/edit/${client.id}`);
  }, [client.id, navigate]);

  const handleDeposit = async (deposit: any) => {
    const success = await handleDeposit(deposit);
    if (success) {
      setIsDepositOpen(false);
    }
  };

  const handleWithdrawal = async (withdrawal: any) => {
    const success = await handleWithdrawal(withdrawal);
    if (success) {
      setIsWithdrawalOpen(false);
    }
  };

  const handleTransfer = async (transfer: any) => {
    const success = await handleTransfer(transfer);
    if (success) {
      setIsTransferOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Informations personnelles
        </CardTitle>
        <CardDescription>
          Détails du client et options de gestion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={`https://avatar.vercel.sh/${client.prenom} ${client.nom}.png`} />
            <AvatarFallback>{client.prenom[0]}{client.nom[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{client.prenom} {client.nom}</h2>
            <p className="text-sm text-muted-foreground">
              Client depuis {new Date(client.date_creation).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <div className="text-sm font-medium">Solde actuel</div>
            <div className="text-2xl font-bold">{formatCurrency(client.balance)}</div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Email</div>
            <div className="flex items-center">
              <Mail className="mr-2 h-4 w-4 opacity-70" />
              <a href={`mailto:${client.email}`} className="hover:underline">
                {client.email}
              </a>
              <Button variant="ghost" size="icon" onClick={() => handleCopy(client.email, 'Email')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Téléphone</div>
            <div className="flex items-center">
              <Phone className="mr-2 h-4 w-4 opacity-70" />
              <a href={`tel:${client.telephone}`} className="hover:underline">
                {client.telephone}
              </a>
              <Button variant="ghost" size="icon" onClick={() => handleCopy(client.telephone, 'Téléphone')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Badge variant="secondary">ID: {client.id}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleEditClient}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDepositOpen(true)} disabled={isDepositProcessing}>
                Nouveau versement
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsWithdrawalOpen(true)} disabled={isWithdrawalProcessing}>
                Nouveau retrait
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsTransferOpen(true)} disabled={isTransferProcessing}>
                Nouveau virement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <DepositDialog 
          client={client}
          isOpen={isDepositOpen} 
          onOpenChange={setIsDepositOpen}
          onConfirm={handleDeposit}
          refreshClientBalance={refreshClientBalance}
        />

        <WithdrawalDialog
          client={client}
          isOpen={isWithdrawalOpen}
          onOpenChange={setIsWithdrawalOpen}
          onConfirm={handleWithdrawal}
          refreshClientBalance={refreshClientBalance}
        />

        <TransferDialog
          client={client}
          isOpen={isTransferOpen}
          onOpenChange={setIsTransferOpen}
          onConfirm={handleTransfer}
          refreshClientBalance={refreshClientBalance}
        />
      </CardContent>
    </Card>
  );
};
