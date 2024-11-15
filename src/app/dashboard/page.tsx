"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Receipt,
  CreditCard,
  ShoppingBag,
  LogOut,
  Coins,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ProductsTable } from "@/components/chart/chart-products";

export default function DashboardPage() {
  const router = useRouter();
  const { clearToken } = useAuth();

  const handleLogout = () => {
    clearToken();
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
    {
      title: "Reembolso",
      description: "Solicitação de reembolso",
      icon: Coins,
      route: "/dashboard/refund",
    },
  ];

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">
            Bem-vindo ao Importix by Contis
          </h1>
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
      <Card className="p-6">
        <h2 className="mt-6 text-3xl font-bold">Cadastro</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-4">
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
      </Card>

      <Card className="p-6 mt-6">
        <h2 className="mt-6 text-3xl font-bold">Dashboard</h2>
        <div className="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
          <ProductsTable />
          <ProductsTable />
        </div>
      </Card>
    </div>
  );
}
