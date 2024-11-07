"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function ProductsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("/api/products/template", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bling_token")}`,
        },
      });

      if (!response.ok) throw new Error("Falha ao baixar template");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template_produtos.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível baixar o template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Contas a Receber</h1>
          <p className="text-muted-foreground">
            Cadastre contas a receber manualmente ou via planilha
          </p>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <Button
          onClick={handleDownloadTemplate}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Baixar Template
        </Button>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="manual">Cadastro Manual</TabsTrigger>
          <TabsTrigger value="bulk">Cadastro em Massa</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <span>Cadastro manual</span>
        </TabsContent>

        <TabsContent value="bulk">
          <span>Cadastro em massa</span>
        </TabsContent>
      </Tabs>
    </div>
  );
}
