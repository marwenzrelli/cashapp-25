
import { CreateSupervisorForm } from "@/features/admin/components/CreateSupervisorForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SupervisorCreation = () => {
  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link to="/login">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Création de compte superviseur</h1>
      </div>
      
      <div className="mt-8">
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Utilisez ce formulaire pour créer un compte superviseur. Ce compte aura tous les droits d'administration système.
        </p>
        <CreateSupervisorForm />
      </div>
    </div>
  );
};

export default SupervisorCreation;
