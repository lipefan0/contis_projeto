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
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ENDPOINTS } from "@/config/api";
import { Textarea } from "@/components/ui/textarea";

const productSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
  preco: z.string().min(1, "Preço é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  situacao: z.string().min(1, "Situação é obrigatória"),
  formato: z.string().min(1, "Formato é obrigatório"),
  urlImagem: z.string().optional(),
  descricao: z.string().optional(),
  descricaoComplementar: z.string().optional(),
  unidade: z.string().min(1, "Unidade é obrigatória").optional(),
  marca: z.string().optional(),
  gtin: z.string().optional(),
  ncm: z.string().optional(),
  cest: z.string().optional(),
  pesoLiquido: z
    .number()
    .min(0, "Peso Líquido deve ser maior ou igual a 0")
    .optional(),
  pesoBruto: z
    .number()
    .min(0, "Peso Bruto deve ser maior ou igual a 0")
    .optional(),
  altura: z.number().min(0, "Altura deve ser maior ou igual a 0").optional(),
  largura: z.number().min(0, "Largura deve ser maior ou igual a 0").optional(),
  profundidade: z
    .number()
    .min(0, "Profundidade deve ser maior ou igual a 0")
    .optional(),
  categoriaId: z.number().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nome: "",
      codigo: "",
      preco: "",
      tipo: "P",
      situacao: "A",
      formato: "S",
      urlImagem: "",
      descricao: "",
      descricaoComplementar: "",
      unidade: "",
      marca: "",
      gtin: "",
      ncm: "",
      cest: "",
      pesoLiquido: 0,
      pesoBruto: 0,
      altura: 0,
      largura: 0,
      profundidade: 0,
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true);

      const response = await fetch(ENDPOINTS.products.base, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bling_token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Falha ao cadastrar produto");
      }

      toast({
        title: "Sucesso!",
        description: "Produto cadastrado com sucesso.",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o produto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do produto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="Código do produto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="P">Produto</SelectItem>
                    <SelectItem value="S">Serviço</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="situacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Situação</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a situação" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A">Ativo</SelectItem>
                    <SelectItem value="I">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="formato"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formato</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="S">Simples</SelectItem>
                    <SelectItem value="E">Kit</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="urlImagem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem</FormLabel>
              <FormControl>
                <Input placeholder="URL da imagem" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição do produto (opcional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="descricaoComplementar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição Complementar</FormLabel>
                <FormControl>
                  <Input placeholder="Descrição Complementar" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade</FormLabel>
                <FormControl>
                  <Input placeholder="Unidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marca"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Marca" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gtin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GTIN</FormLabel>
                <FormControl>
                  <Input placeholder="GTIN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ncm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NCM</FormLabel>
                <FormControl>
                  <Input placeholder="NCM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEST</FormLabel>
                <FormControl>
                  <Input placeholder="CEST" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pesoLiquido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso Líquido</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pesoBruto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso Bruto</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="altura"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Altura</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="largura"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Largura</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="profundidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profundidade</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoriaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
