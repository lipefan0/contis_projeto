// src/app/(auth)/page.tsx
import { AuthForm } from "@/components/auth/auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthPage() {
  return (
    <Card className="w-full max-w-md mx-4">
      <CardHeader>
        <CardTitle>Autenticação Bling</CardTitle>
        <CardDescription>
          Digite suas credenciais para conectar com a API do Bling.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm />
      </CardContent>
    </Card>
  );
}
