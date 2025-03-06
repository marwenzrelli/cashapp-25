
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createSupervisorAccount } from "../api/userApi";

export const CreateSupervisorForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createSupervisorAccount(userData);
      toast.success("Compte superviseur créé avec succès");
      setUserData({
        fullName: "",
        username: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création du compte");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Créer un compte superviseur</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Jean Dupont"
              value={userData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input
              id="username"
              name="username"
              placeholder="jean_dupont"
              value={userData.username}
              onChange={handleChange}
              required
            />
            <p className="text-sm text-muted-foreground">
              Lettres, chiffres, tirets et underscores uniquement (3-20 caractères)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="exemple@domaine.com"
              value={userData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Minimum 6 caractères"
              value={userData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Création en cours..." : "Créer le compte superviseur"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
