"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface FormaPagamento {
  id: string;
  descricao: string;
}

interface Portador {
  id: string;
  descricao: string;
}

interface Categoria {
  id: string;
  descricao: string;
}

const productSchema = z.object({
  vencimento: z.string().min(1, "Vencimento é obrigatório"),
  competencia: z.string().min(1, "Competência é obrigatória"),
  dataEmissao: z.string().min(1, "Data de emissão é obrigatória"),
  valor: z
    .string()
    .transform((val) => parseFloat(val.replace(",", ".")))
    .pipe(z.number().min(0.01, "Valor é obrigatório")),
  contato: z.object({
    id: z.number(),
  }),
  formaPagamento: z
    .object({
      id: z.number(),
    })
    .optional(),
  portador: z
    .object({
      id: z.number(),
    })
    .optional(),
  categoria: z
    .object({
      id: z.number(),
    })
    .optional(),
  historico: z.string().optional(),
  numeroDocumento: z.string().optional(),
  ocorrencia: z
    .object({
      tipo: z.number(),
    })
    .default({ tipo: 1 }),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ReceivableForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [portadores, setPortadores] = useState<Portador[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Função para buscar dados das APIs
  const fetchApiData = async () => {
    try {
      const token = localStorage.getItem("bling_token");
      if (!token) {
        console.log("Token não encontrado");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      // Função para aguardar um tempo específico
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      // Buscar formas de pagamento
      try {
        console.log("Iniciando chamada - Formas de Pagamento");
        const pagamentosResponse = await fetch(
          "http://localhost:8080/reference/formas-pagamento",
          { headers }
        );

        if (pagamentosResponse.ok) {
          const pagamentosData = await pagamentosResponse.json();
          console.log("Formas de Pagamento carregadas");
          setFormasPagamento(pagamentosData.data || []);
        }
      } catch (error) {
        console.error("Erro ao carregar formas de pagamento:", error);
      }

      // Aguarda 500ms antes da próxima chamada
      await delay(500);

      // Buscar portadores
      try {
        console.log("Iniciando chamada - Portadores");
        const portadoresResponse = await fetch(
          "http://localhost:8080/reference/portadores",
          { headers }
        );

        if (portadoresResponse.ok) {
          const portadoresData = await portadoresResponse.json();
          console.log("Portadores carregados");
          setPortadores(portadoresData.data || []);
        }
      } catch (error) {
        console.error("Erro ao carregar portadores:", error);
      }

      // Aguarda mais 500ms antes da última chamada
      await delay(500);

      // Buscar categorias
      try {
        console.log("Iniciando chamada - Categorias");
        const categoriasResponse = await fetch(
          "http://localhost:8080/reference/categorias",
          { headers }
        );

        if (categoriasResponse.ok) {
          const categoriasData = await categoriasResponse.json();
          console.log("Categorias carregadas");
          setCategorias(categoriasData.data || []);
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    } catch (error) {
      console.error("Erro geral:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar alguns dados do formulário.",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    console.log("Componente montado - Iniciando fetchApiData");
    fetchApiData();
  }, []); // Executado quando o componente monta

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      vencimento: "",
      competencia: "",
      dataEmissao: "",
      valor: 0,
      historico: "",
      contato: {
        id: 0,
      },
      formaPagamento: {
        id: 0,
      },
      portador: {
        id: 0,
      },
      categoria: {
        id: 0,
      },
      ocorrencia: {
        tipo: 1,
      },
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      console.log("Dados a serem enviados:", data);
      setIsLoading(true);

      const response = await fetch(
        "http://localhost:8080/accounts/receivable",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("bling_token")}`,
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();
      console.log("Resposta da API:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Falha ao cadastrar conta");
      }

      toast({
        title: "Sucesso!",
        description: "Conta cadastrada com sucesso.",
      });

      form.reset();
    } catch (error) {
      console.error("Erro completo:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível cadastrar a conta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="mt-6">
            <FormField
              control={form.control}
              name="contato.id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contato *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardContent className="grid grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="vencimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vencimento da conta *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="competencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Competência *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataEmissao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Emissão *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid grid-cols-2 gap-6 mt-6">
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d,]/g, "");
                        field.onChange(value);
                      }}
                      placeholder="0,00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="formaPagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        const selectedForma = formasPagamento.find(
                          (f) => Number(f.id) === Number(value)
                        );
                        field.onChange(
                          selectedForma ? { id: Number(value) } : undefined
                        );
                      }}
                      value={field.value?.id ? field.value.id.toString() : ""} // Aqui, convertendo para string
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma forma de pagamento">
                          {field.value?.id
                            ? formasPagamento.find(
                                (f) =>
                                  field.value && Number(f.id) === field.value.id
                              )?.descricao
                            : ""}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {formasPagamento?.length > 0 ? (
                          formasPagamento.map((forma) => (
                            <SelectItem
                              key={forma.id}
                              value={forma.id.toString()}
                            >
                              {forma.descricao}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-options">
                            Nenhuma opção disponível
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardContent>
            <FormField
              control={form.control}
              name="historico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Histórico</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardContent className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="portador"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portador</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        const selectedPortador = portadores.find(
                          (f) => Number(f.id) === Number(value)
                        );
                        field.onChange(
                          selectedPortador ? { id: Number(value) } : undefined
                        );
                      }}
                      value={field.value?.id ? field.value.id.toString() : ""} // Aqui, convertendo para string
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o banco">
                          {field.value?.id
                            ? portadores.find(
                                (f) =>
                                  field.value && Number(f.id) === field.value.id
                              )?.descricao
                            : ""}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {portadores?.length > 0 ? (
                          portadores.map((portador) => (
                            <SelectItem
                              key={portador.id}
                              value={portador.id.toString()}
                            >
                              {portador.descricao}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-options">
                            Nenhuma opção disponível
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        const selectedCategoria = categorias.find(
                          (f) => Number(f.id) === Number(value)
                        );
                        field.onChange(
                          selectedCategoria ? { id: Number(value) } : undefined
                        );
                      }}
                      value={field.value?.id ? field.value.id.toString() : ""} // Aqui, convertendo para string
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria">
                          {field.value?.id
                            ? categorias.find(
                                (f) =>
                                  field.value && Number(f.id) === field.value.id
                              )?.descricao
                            : ""}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {categorias?.length > 0 ? (
                          categorias.map((categoria) => (
                            <SelectItem
                              key={categoria.id}
                              value={categoria.id.toString()}
                            >
                              {categoria.descricao}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-options">
                            Nenhuma opção disponível
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cadastrando...
            </>
          ) : (
            "Cadastrar Produto"
          )}
        </Button>
      </form>
    </Form>
  );
}