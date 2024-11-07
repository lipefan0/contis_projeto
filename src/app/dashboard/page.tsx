"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Receipt, CreditCard, ShoppingBag, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("bling_token");
    router.replace("/");
  };

  const modules = [
    {
      title: "Produtos",
      description: "Cadastro e gestão de produtos",
      icon: ShoppingBag,
      route: "/dashboard/products",
    },
    {
      title: "Clientes",
      description: "Cadastro e gestão de clientes",
      icon: Users,
      route: "/dashboard/customers",
    },
    {
      title: "Contas a Pagar",
      description: "Gestão de contas a pagar",
      icon: CreditCard,
      route: "/dashboard/accounts-payable",
    },
    {
      title: "Contas a Receber",
      description: "Gestão de contas a receber",
      icon: Receipt,
      route: "/dashboard/accounts-receivable",
    },
  ];

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Bem-vindo ao Sistema</h1>
          <p className="text-muted-foreground mt-2">
            Selecione um módulo para começar
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {modules.map((module) => (
          <Card
            key={module.title}
            className="hover:bg-accent cursor-pointer transition-colors"
            onClick={() => router.push(module.route)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">
                {module.title}
              </CardTitle>
              <module.icon className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>{module.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
