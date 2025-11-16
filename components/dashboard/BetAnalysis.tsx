"use client"

import { useState } from "react"
import { useBetAnalysis } from "@/lib/hooks/use-bet-comparison"
import { useLocalBets } from "@/lib/hooks/use-local-bets"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Loader2,
  Search,
  DollarSign,
  TrendingUp,
  Hash,
  Percent,
  Flame,
  Snowflake,
  AlertCircle,
  Save,
  CheckCircle2,
} from "lucide-react"

export default function BetAnalysis() {
  const { data, loading, error, analyzeBet } = useBetAnalysis()
  const { saveBet } = useLocalBets()
  const [betInput, setBetInput] = useState("")
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const handleAnalyze = async () => {
    try {
      const numbers = betInput
        .split(/[,\s]+/)
        .map((n) => parseInt(n.trim()))
        .filter((n) => !isNaN(n))

      if (numbers.length < 15 || numbers.length > 18) {
        alert("A aposta deve conter entre 15 e 18 números")
        return
      }

      await analyzeBet(numbers)
    } catch (err) {
      console.error("Error analyzing bet:", err)
    }
  }

  const handleSaveCurrentBet = () => {
    if (data) {
      saveBet(data.bet)
      setSaveMessage("Aposta salva localmente!")
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const getProbabilityColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-green-500"
      case 2:
        return "bg-blue-500"
      case 3:
        return "bg-yellow-500"
      case 4:
        return "bg-orange-500"
      case 5:
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análise Detalhada de Aposta</CardTitle>
          <CardDescription>
            Analise uma aposta e veja probabilidades, padrões e características matemáticas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bet">Números da Aposta (15-18 números)</Label>
            <Input
              id="bet"
              placeholder="1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15"
              value={betInput}
              onChange={(e) => setBetInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separe os números por vírgula ou espaço
            </p>
          </div>

          <Button onClick={handleAnalyze} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Analisar Aposta
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {data && (
        <div className="space-y-6">
          {saveMessage && (
            <div className="p-3 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-md flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">{saveMessage}</span>
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Números Selecionados</CardTitle>
                <Button variant="outline" size="sm" onClick={handleSaveCurrentBet}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Aposta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.bet.map((num: number) => {
                  const detail = data.numberStatus.details.find((d) => d.number === num)
                  return (
                    <Badge
                      key={num}
                      variant={
                        detail?.status === "hot"
                          ? "default"
                          : detail?.status === "cold"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-base px-3 py-1"
                    >
                      {num.toString().padStart(2, "0")}
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Quantidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.quantity.totalNumbers} números</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.quantity.numberOfCombinations.toLocaleString("pt-BR")} combinações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Custo Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {data.cost.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  R$ {data.cost.pricePerBet.toFixed(2)} por aposta
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Probabilidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{data.probability.winChance}</div>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProbabilityColor(data.probability.probabilityLevel)}`}
                        style={{ width: `${data.probability.probabilityLevel * 20}%` }}
                      />
                    </div>
                    <Badge variant="outline">Nível {data.probability.probabilityLevel}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Padrões Matemáticos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Soma</Label>
                  <div className="text-xl font-semibold">{data.patterns.sum}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Média</Label>
                  <div className="text-xl font-semibold">{data.patterns.mean}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Pares</Label>
                  <div className="text-xl font-semibold">{data.patterns.pairs}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Ímpares</Label>
                  <div className="text-xl font-semibold">{data.patterns.odds}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Primos</Label>
                  <div className="text-xl font-semibold">{data.patterns.primes}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Sequências</Label>
                  <div className="text-xl font-semibold">{data.patterns.sequences}</div>
                </div>
              </div>

              {data.patterns.sequenceDetails && data.patterns.sequenceDetails.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">Sequências Encontradas</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {data.patterns.sequenceDetails.map((seq: number[], idx: number) => (
                        <Badge key={idx} variant="outline">
                          {seq.join("-")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Faixas</CardTitle>
              <CardDescription>
                Distribuição dos números em faixas de 5 (
                {data.distribution.balance === "balanced" ? "Balanceada" : "Desbalanceada"})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(data.distribution.ranges).map(([range, count]) => {
                const rangeLabel = range.replace("range", "").replace("_", "-")
                const percentage = (count / data.quantity.totalNumbers) * 100
                return (
                  <div key={range}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Faixa {rangeLabel}</span>
                      <Badge variant="outline">
                        {count} números ({percentage.toFixed(0)}%)
                      </Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status dos Números</CardTitle>
              <CardDescription>Classificação quente/frio baseada em frequência</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold">{data.numberStatus.hot}</div>
                    <div className="text-xs text-muted-foreground">Números quentes</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{data.numberStatus.neutral}</div>
                    <div className="text-xs text-muted-foreground">Números neutros</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Snowflake className="h-5 w-5 text-cyan-500" />
                  <div>
                    <div className="text-2xl font-bold">{data.numberStatus.cold}</div>
                    <div className="text-xs text-muted-foreground">Números frios</div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Detalhes por Número</Label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {data.numberStatus.details.map((detail) => (
                    <div
                      key={detail.number}
                      className="p-2 border rounded-lg text-center hover:bg-accent transition-colors"
                    >
                      <div className="font-bold text-lg">{detail.number}</div>
                      <Badge
                        variant={
                          detail.status === "hot"
                            ? "default"
                            : detail.status === "cold"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs mt-1"
                      >
                        {detail.status === "hot" ? "🔥" : detail.status === "cold" ? "❄️" : "➖"}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {detail.frequency}x
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
