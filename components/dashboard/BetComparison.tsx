"use client"

import { useState } from "react"
import { useBetComparison } from "@/lib/hooks/use-bet-comparison"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, Award } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BetComparison() {
  const { data, loading, error, compareBets } = useBetComparison()
  const [betsInput, setBetsInput] = useState("")
  const [period, setPeriod] = useState("100")

  const handleCompare = async () => {
    try {
      const betsArray = betsInput
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const numbers = line
            .split(/[,\s]+/)
            .map((n) => parseInt(n.trim()))
            .filter((n) => !isNaN(n))
          return numbers
        })
        .filter((bet) => bet.length >= 15 && bet.length <= 18)

      if (betsArray.length === 0) {
        alert("Insira pelo menos uma aposta válida")
        return
      }

      const limit = period === "all" ? undefined : parseInt(period)
      await compareBets(betsArray, { limit })
    } catch (err) {
      console.error("Error comparing bets:", err)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comparador de Apostas</CardTitle>
          <CardDescription>
            Compare suas apostas com o histórico de sorteios e veja quantos acertos você teria tido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bets">
              Apostas (uma por linha, números separados por vírgula ou espaço)
            </Label>
            <textarea
              id="bets"
              className="w-full min-h-[120px] p-3 border rounded-md"
              placeholder="1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15&#10;3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 1, 2, 4, 6"
              value={betsInput}
              onChange={(e) => setBetsInput(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Período de Comparação</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Últimos 10 sorteios</SelectItem>
                <SelectItem value="30">Últimos 30 sorteios</SelectItem>
                <SelectItem value="50">Últimos 50 sorteios</SelectItem>
                <SelectItem value="100">Últimos 100 sorteios</SelectItem>
                <SelectItem value="200">Últimos 200 sorteios</SelectItem>
                <SelectItem value="all">Todos os sorteios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleCompare} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Comparando...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Comparar Apostas
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
          )}
        </CardContent>
      </Card>

      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Comparação</CardTitle>
            <CardDescription>
              Período analisado: Sorteios {data.period.startContest} até {data.period.endContest} (
              {data.period.totalDraws} sorteios)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.comparisons.map((comparison, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Aposta #{index + 1}</CardTitle>
                      <Badge variant="default" className="text-lg px-3 py-1">
                        <Award className="mr-1 h-4 w-4" />
                        Melhor: {comparison.bestHit} acertos
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {comparison.bet.map((num) => (
                        <Badge key={num} variant="outline" className="text-sm">
                          {num.toString().padStart(2, "0")}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Acertos</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Porcentagem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(comparison.hitDistribution)
                          .sort(([a], [b]) => parseInt(b) - parseInt(a))
                          .map(([hits, count]) => (
                            <TableRow key={hits}>
                              <TableCell className="font-medium">{hits} pontos</TableCell>
                              <TableCell>{count}</TableCell>
                              <TableCell>
                                {((count / comparison.totalDrawsAnalyzed) * 100).toFixed(2)}%
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
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
