// src/components/auth/auth-form.tsx
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
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

const BACKEND_URL = "http://localhost:8080";
const BLING_AUTH_URL = "https://www.bling.com.br/Api/v3/oauth/authorize";
const REDIRECT_URI = "http://localhost:8080/auth/callback";

const authSchema = z.object({
  clientId: z.string().min(1, "Client ID é obrigatório"),
  clientSecret: z.string().min(1, "Client Secret é obrigatório"),
});

type AuthFormValues = z.infer<typeof authSchema>;

export function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const exchangeAttempted = useRef(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    // Recuperar dados do sessionStorage
    const savedAuthData = sessionStorage.getItem("auth_data");

    if (code && state && savedAuthData && !exchangeAttempted.current) {
      try {
        const authData = JSON.parse(savedAuthData);
        exchangeAttempted.current = true;
        exchangeToken(code, authData);
      } catch (error) {
        console.error("Erro ao recuperar dados salvos:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao recuperar dados de autenticação.",
        });
      }
    }
  }, [searchParams, toast]);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      clientId: "",
      clientSecret: "",
    },
  });

  async function exchangeToken(code: string, data: AuthFormValues) {
    try {
      setIsLoading(true);

      const payload = {
        code,
        clientId: data.clientId,
        clientSecret: data.clientSecret,
        redirectUri: REDIRECT_URI,
      };

      console.log("Enviando requisição para troca de token...");

      const response = await fetch(`${BACKEND_URL}/auth/exchange-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const tokenData = await response.json();

      if (!response.ok) {
        throw new Error(tokenData.error || "Erro na troca do token");
      }

      if (!tokenData.access_token) {
        throw new Error("Token não recebido");
      }

      // Salvar dados do token
      localStorage.setItem("bling_token", tokenData.access_token);
      localStorage.setItem("bling_refresh_token", tokenData.refresh_token);
      localStorage.setItem(
        "bling_token_expires",
        (Date.now() + tokenData.expires_in * 1000).toString()
      );

      // Limpar dados temporários
      sessionStorage.removeItem("auth_data");

      toast({
        title: "Sucesso!",
        description: "Autenticação realizada com sucesso.",
      });

      router.replace("/dashboard");
    } catch (error) {
      console.error("Erro na autenticação:", error);
      // Limpar dados temporários em caso de erro também
      sessionStorage.removeItem("auth_data");

      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Falha na autenticação. Tente novamente.",
      });
      router.replace("/");
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(data: AuthFormValues) {
    try {
      setIsLoading(true);
      const state = Math.random().toString(36).substring(2);

      // Salvar dados para usar depois do callback
      sessionStorage.setItem("auth_data", JSON.stringify(data));

      const authUrl = new URL(BLING_AUTH_URL);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("client_id", data.clientId);
      authUrl.searchParams.append("state", state);
      authUrl.searchParams.append("redirect_uri", REDIRECT_URI);

      // Redirecionar para autorização do Bling
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error("Erro ao iniciar autenticação:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao iniciar processo de autenticação.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite seu Client ID"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clientSecret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Secret</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Digite seu Client Secret"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Conectando..." : "Conectar"}
        </Button>
      </form>
    </Form>
  );
}
