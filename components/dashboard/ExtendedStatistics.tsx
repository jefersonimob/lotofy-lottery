"use client"

import { useEffect } from "react"
import { useExtendedStatistics } from "@/lib/hooks/use-bet-comparison"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Loader2, RefreshCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ExtendedStatistics() {
  const { data, loading, error, fetchStatistics } = useExtendedStatistics()

  useEffect(() => {
    fetchStatistics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderDistribution = (distribution: Record<string, number>, title: string) => {
    if (!distribution) return null

    const entries = Object.entries(distribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)

    const maxValue = Math.max(...entries.map(([, v]) => v))

    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground">{title}</h3>
        <div className="space-y-2">
          {entries.map(([key, value]) => {
            const percentage = (value / maxValue) * 100
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{key}</span>
                  <Badge variant="outline">{value}</Badge>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Estatísticas Estendidas</CardTitle>
              <CardDescription>
                Análise matemática completa de todos os sorteios históricos
              </CardDescription>
            </div>
            <Button onClick={fetchStatistics} disabled={loading} variant="outline" size="sm">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          {loading && !data && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {data && (
            <Tabs defaultValue="quantity" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="quantity">Frequência</TabsTrigger>
                <TabsTrigger value="patterns">Padrões</TabsTrigger>
                <TabsTrigger value="groups">Grupos</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
              </TabsList>

              <TabsContent value="quantity" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Frequência de Números
                    </CardTitle>
                    <CardDescription>
                      Quantidade de vezes que cada número foi sorteado (Top 15)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderDistribution(data.quantity, "Números mais sorteados")}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patterns" className="space-y-4 mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pares vs Ímpares</CardTitle>
                      <CardDescription>Distribuição de números pares por sorteio</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderDistribution(data.pairs, "Quantidade de pares")}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Números Primos</CardTitle>
                      <CardDescription>Distribuição de números primos por sorteio</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderDistribution(data.primes, "Quantidade de primos")}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Soma Total</CardTitle>
                      <CardDescription>Soma dos 15 números em cada sorteio</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderDistribution(data.sums, "Somas mais frequentes")}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Média Arredondada</CardTitle>
                      <CardDescription>Média dos números em cada sorteio</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderDistribution(data.mean, "Médias mais frequentes")}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="groups" className="space-y-4 mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Distribuição por Unidade</CardTitle>
                      <CardDescription>Frequência do último dígito (0-9)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderDistribution(data.ones, "Unidades mais sorteadas")}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Distribuição por Dezena</CardTitle>
                      <CardDescription>Frequência por grupos de 10</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderDistribution(data.tens, "Dezenas mais sorteadas")}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Análise Sequencial</CardTitle>
                    <CardDescription>
                      Frequência de números por posição de sorteio (15 posições)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                      {data.sequential?.slice(0, 15).map((position: Record<string, number>, index: number) => (
                        <Card key={index}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Posição {index + 1}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-1">
                              {Object.entries(position)
                                .sort(([, a], [, b]) => (b as number) - (a as number))
                                .slice(0, 5)
                                .map(([num, count]) => (
                                  <div key={num} className="flex justify-between text-xs">
                                    <span className="font-medium">{num}</span>
                                    <Badge variant="secondary" className="text-xs px-2 py-0">
                                      {count}
                                    </Badge>
                                  </div>
                                ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
