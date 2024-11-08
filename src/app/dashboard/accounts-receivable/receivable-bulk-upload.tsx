"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ReceivableBulkUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (
      selectedFile &&
      selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setFile(selectedFile);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx)",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://localhost:8080/accounts/receivable/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("bling_token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Falha no upload");
      }

      const result = await response.json();

      toast({
        title: "Upload concluído",
        description: `${result.success.length} Contas cadastrados com sucesso.${
          result.errors.length
            ? ` ${result.errors.length} erros encontrados.`
            : ""
        }`,
      });

      setFile(null);
      // Resetar input file
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao processar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload em Massa</CardTitle>
          <CardDescription>
            Faça upload de uma planilha Excel com múltiplos clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Clique para selecionar</span>{" "}
                  ou arraste e solte
                </p>
                <p className="text-xs text-muted-foreground">
                  XLSX (max. 10MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".xlsx"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </label>
          </div>

          {file && (
            <div className="text-sm text-muted-foreground">
              Arquivo selecionado: {file.name}
            </div>
          )}

          {uploadProgress > 0 && (
            <Progress value={uploadProgress} className="w-full" />
          )}

          <Button
            onClick={handleUpload}
            className="w-full"
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Iniciar Upload"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
