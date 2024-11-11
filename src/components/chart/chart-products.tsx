"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENDPOINTS } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Product {
  id: number;
  nome: string;
  preco: number;
  estoque: {
    saldoVirtualTotal: number;
  };
  imagemURL: string;
}

export const ProductsTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [itemsPerPage, setItemsPerPage] = useState(5); // Itens por página

  useEffect(() => {
    const controller = new AbortController(); // Cria um novo controller para cada requisição
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("bling_token");
        if (!token) {
          throw new Error("Token não encontrado");
        }

        const response = await fetch(`${ENDPOINTS.products.base}`, {
          signal: controller.signal, // Vincula a requisição ao AbortController
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar produtos");
        }

        const data = await response.json();
        setProducts(data.data || []);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          // Se o erro não for de cancelamento, exibe o erro
          console.error("Erro ao buscar produtos:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os produtos.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    return () => {
      controller.abort(); // Cancela a requisição anterior se houver uma nova chamada
    };
  }, [toast]); // Sempre que o toast mudar, a requisição será feita

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Produtos</CardTitle>
          <CardDescription>
            Lista de produtos cadastrados no Bling
          </CardDescription>
        </div>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => setItemsPerPage(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Itens por página" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 por página</SelectItem>
            <SelectItem value="10">10 por página</SelectItem>
            <SelectItem value="20">20 por página</SelectItem>
            <SelectItem value="50">50 por página</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-12">Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.slice(0, itemsPerPage).map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={product.imagemURL}
                          alt={product.nome}
                        />
                        <AvatarFallback>
                          {product.nome.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.nome}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(product.preco)}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.estoque.saldoVirtualTotal.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Mostrando {Math.min(itemsPerPage, products.length)} de{" "}
          {products.length} produtos
        </div>
      </CardContent>
    </Card>
  );
};
