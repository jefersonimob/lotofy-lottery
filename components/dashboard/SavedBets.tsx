"use client"

import { useState, useRef } from "react"
import { useLocalBets } from "@/lib/hooks/use-local-bets"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Download,
  Upload,
  Save,
  Trash2,
  Copy,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export default function SavedBets() {
  const {
    bets,
    saveBet,
    deleteBet,
    duplicateBet,
    clearBets,
    importBets,
    downloadBets,
  } = useLocalBets()

  const [newBetInput, setNewBetInput] = useState("")
  const [newBetName, setNewBetName] = useState("")
  const [importData, setImportData] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSaveBet = () => {
    try {
      const numbers = newBetInput
        .split(/[,\s]+/)
        .map((n) => parseInt(n.trim()))
        .filter((n) => !isNaN(n))

      if (numbers.length < 15 || numbers.length > 18) {
        showMessage("error", "A aposta deve conter entre 15 e 18 números")
        return
      }

      const uniqueNumbers = new Set(numbers)
      if (uniqueNumbers.size !== numbers.length) {
        showMessage("error", "A aposta contém números duplicados")
        return
      }

      saveBet(numbers, newBetName || undefined)
      setNewBetInput("")
      setNewBetName("")
      showMessage("success", "Aposta salva com sucesso!")
    } catch {
      showMessage("error", "Erro ao salvar aposta")
    }
  }

  const handleImportFromText = () => {
    try {
      const count = importBets(importData, false)
      if (count > 0) {
        setImportData("")
        showMessage("success", `${count} aposta(s) importada(s) com sucesso!`)
      } else {
        showMessage("error", "Nenhuma aposta válida encontrada")
      }
    } catch {
      showMessage("error", "Erro ao importar apostas")
    }
  }

  const handleImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const count = importBets(content, false)
        if (count > 0) {
          showMessage("success", `${count} aposta(s) importada(s) com sucesso!`)
        } else {
          showMessage("error", "Nenhuma aposta válida encontrada no arquivo")
        }
      } catch {
        showMessage("error", "Erro ao ler arquivo")
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Apostas Salvas Localmente</CardTitle>
          <CardDescription>
            Suas apostas são salvas automaticamente no navegador (localStorage)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {bets.length} {bets.length === 1 ? "aposta salva" : "apostas salvas"}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadBets} disabled={bets.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                className="hidden"
                onChange={handleImportFromFile}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Arquivo
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={bets.length === 0}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Tudo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá deletar todas as {bets.length} apostas salvas. Esta ação não
                      pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        clearBets()
                        showMessage("success", "Todas as apostas foram removidas")
                      }}
                    >
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Salvar Nova Aposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="betName">Nome da Aposta (opcional)</Label>
            <Input
              id="betName"
              placeholder="Minha aposta especial"
              value={newBetName}
              onChange={(e) => setNewBetName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="betNumbers">Números (15-18 números)</Label>
            <Input
              id="betNumbers"
              placeholder="1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15"
              value={newBetInput}
              onChange={(e) => setNewBetInput(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveBet} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Salvar Aposta
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Importar de Texto JSON</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="importText">Cole o JSON aqui</Label>
            <Textarea
              id="importText"
              placeholder='[{"numbers": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], "name": "Aposta 1"}]'
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="min-h-[100px] font-mono text-xs"
            />
          </div>
          <Button onClick={handleImportFromText} disabled={!importData.trim()} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Importar de Texto
          </Button>
        </CardContent>
      </Card>

      {bets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Apostas Salvas ({bets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bets.map((bet) => (
                <Card key={bet.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold">{bet.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(bet.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            duplicateBet(bet.id)
                            showMessage("success", "Aposta duplicada!")
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deletar aposta?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja deletar &quot;{bet.name}&quot;?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  deleteBet(bet.id)
                                  showMessage("success", "Aposta deletada")
                                }}
                              >
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {bet.numbers.map((num) => (
                        <Badge key={num} variant="outline" className="text-xs">
                          {num.toString().padStart(2, "0")}
                        </Badge>
                      ))}
                    </div>
                    {bet.notes && (
                      <>
                        <Separator className="my-3" />
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4 mt-0.5" />
                          <span>{bet.notes}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
