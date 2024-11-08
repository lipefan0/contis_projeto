"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search } from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const formatDocument = (value: string) => {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "$1.$2.$3-$4");
  }
  return numbers.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,
    "$1.$2.$3/$4-$5"
  );
};

const isValidDocument = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  // Se estiver vazio, é válido
  if (numbers.length === 0) return true;
  // Se não estiver vazio, deve ter 11 ou 14 dígitos
  return numbers.length === 11 || numbers.length === 14;
};

const getDocumentErrorMessage = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  // Não mostra erro se estiver vazio
  if (numbers.length === 0) return "";
  if (numbers.length < 11) return "Documento incompleto";
  if (numbers.length > 11 && numbers.length < 14) return "Complete o CNPJ";
  if (numbers.length > 14) return "Documento inválido";
  return "";
};

const customerSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  numeroDocumento: z
    .string()
    .optional() // Torna o campo opcional
    .refine((value) => {
      if (!value) return true; // Retorna true se estiver vazio
      const numbers = value.replace(/\D/g, "");
      return numbers.length === 11 || numbers.length === 14;
    }, "Documento inválido. Use 11 dígitos para CPF ou 14 para CNPJ"),
  codigo: z.string().optional(),
  fantasia: z.string().optional(),
  telefone: z.string().optional(),
  celular: z.string().optional(),
  email: z.string().email("Email inválido"),
  rg: z.string().optional(),
  orgaoEmissor: z.string().optional(),
  ie: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cep: z.string().optional(),
  municipio: z.string().optional(),
  uf: z.string().optional(),
  dataNascimento: z.string().optional(),
  sexo: z.string().optional(),
  naturalidade: z.string().optional(),
  limiteCredito: z.number().nonnegative().optional(),
  condicaoPagamento: z.string().optional(),
  categoriaId: z.number().optional(),
  vendedorId: z.number().optional(),
  pais: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export function CustomerForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      nome: "",
      tipo: "F",
      numeroDocumento: "",
      codigo: "",
      fantasia: "",
      telefone: "",
      celular: "",
      email: "",
      rg: "",
      orgaoEmissor: "",
      ie: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cep: "",
      municipio: "",
      uf: "",
      dataNascimento: "",
      sexo: "M",
      naturalidade: "",
      limiteCredito: 0,
      condicaoPagamento: "",
      categoriaId: 0,
      vendedorId: 0,
      pais: "BRASIL",
    },
  });

  const fetchAddressByCep = async (cep: string) => {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      return;
    }

    setIsCepLoading(true);

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );
      const data = await response.json();

      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP informado",
          variant: "destructive",
        });
        return;
      }

      // Preenche os campos do formulário
      form.setValue("endereco", data.logradouro);
      form.setValue("bairro", data.bairro);
      form.setValue("municipio", data.localidade);
      form.setValue("uf", data.uf);

      toast({
        title: "Endereço encontrado",
        description: "Os campos foram preenchidos automaticamente",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível buscar o endereço",
        variant: "destructive",
      });
    } finally {
      setIsCepLoading(false);
    }
  };

  const formatCep = (value: string) => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, "");

    // Formata como CEP (00000-000)
    return numbers.replace(/(\d{5})(\d{3})/, "$1-$2");
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      console.log("Iniciando submissão do formulário");
      console.log("Dados a serem enviados:", data);
      setIsLoading(true);

      // Verifica se o token existe
      const token = localStorage.getItem("bling_token");
      console.log("Token existe?", !!token);

      const response = await fetch("http://localhost:8080/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      console.log("Status da resposta:", response.status);

      const responseData = await response.json();
      console.log("Dados da resposta:", responseData);

      if (!response.ok) {
        console.error("Erro na resposta:", responseData);
        throw new Error(responseData.message || "Falha ao cadastrar cliente");
      }

      toast({
        title: "Sucesso!",
        description: "Cliente cadastrado com sucesso.",
      });

      form.reset();
    } catch (error) {
      console.error("Erro completo:", error);

      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível cadastrar o cliente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  console.log("Form state:", {
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          console.log("Form submit iniciado");
          form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-6"
      >
        {/* Informações Básicas - Sempre visível */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Pessoa</FormLabel>
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
                        <SelectItem value="F">Física</SelectItem>
                        <SelectItem value="J">Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
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
                      <Input placeholder="COD001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contato - Sempre visível */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 0000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="celular"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Celular</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* minimizado a parti daqui */}

        {/* Seções Minimizáveis */}
        <Accordion type="single" collapsible className="space-y-4">
          {/* Documentos */}
          <AccordionItem value="documentos">
            <AccordionTrigger className="text-lg font-semibold">
              Documentos
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="numeroDocumento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF/CNPJ</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="000.000.000-00 ou 00.000.000/0000-00"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value;
                                const numbers = value.replace(/\D/g, "");

                                // Limita a 14 dígitos
                                if (numbers.length > 14) return;

                                const formattedValue = formatDocument(numbers);
                                field.onChange(formattedValue);

                                // Validação em tempo real
                                const error = getDocumentErrorMessage(numbers);
                                if (error) {
                                  form.setError("numeroDocumento", {
                                    message: error,
                                  });
                                } else {
                                  form.clearErrors("numeroDocumento");
                                }
                              }}
                              className={
                                !isValidDocument(field.value || "")
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <Input placeholder="RG" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="orgaoEmissor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Órgão Emissor</FormLabel>
                          <FormControl>
                            <Input placeholder="Órgão emissor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ie"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inscrição Estadual</FormLabel>
                          <FormControl>
                            <Input placeholder="IE" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Endereço */}
          <AccordionItem value="endereco">
            <AccordionTrigger className="text-lg font-semibold">
              Endereço
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative">
                      <FormField
                        control={form.control}
                        name="cep"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input
                                  placeholder="00000-000"
                                  {...field}
                                  onChange={(e) => {
                                    const formatted = formatCep(e.target.value);
                                    field.onChange(formatted);
                                  }}
                                  maxLength={9}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  fetchAddressByCep(field.value || "")
                                }
                                disabled={isCepLoading}
                              >
                                {isCepLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Search className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="endereco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Endereço" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input placeholder="Número" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="complemento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input placeholder="Complemento" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Bairro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="municipio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Município</FormLabel>
                          <FormControl>
                            <Input placeholder="Município" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="uf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UF</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="UF" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[
                                "AC",
                                "AL",
                                "AP",
                                "AM",
                                "BA",
                                "CE",
                                "DF",
                                "ES",
                                "GO",
                                "MA",
                                "MT",
                                "MS",
                                "MG",
                                "PA",
                                "PB",
                                "PR",
                                "PE",
                                "PI",
                                "RJ",
                                "RN",
                                "RS",
                                "RO",
                                "RR",
                                "SC",
                                "SP",
                                "SE",
                                "TO",
                              ].map((uf) => (
                                <SelectItem key={uf} value={uf}>
                                  {uf}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Informações Adicionais */}
          <AccordionItem value="informacoes-adicionais">
            <AccordionTrigger className="text-lg font-semibold">
              Informações Adicionais
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="dataNascimento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sexo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sexo</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="M">Masculino</SelectItem>
                              <SelectItem value="F">Feminino</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="naturalidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Naturalidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Naturalidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Informações Financeiras */}
          <AccordionItem value="informacoes-financeiras">
            <AccordionTrigger className="text-lg font-semibold">
              Informações Financeiras
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="limiteCredito"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limite de Crédito</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="condicaoPagamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condição de Pagamento</FormLabel>
                          <FormControl>
                            <Input placeholder="Dias" {...field} />
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
                          <FormLabel>Categoria ID</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendedorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendedor ID</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cadastrando...
            </>
          ) : (
            "Cadastrar Cliente"
          )}
        </Button>
      </form>
    </Form>
  );
}
