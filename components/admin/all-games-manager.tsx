'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Database,
  Download,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Hash,
  Percent,
  Activity
} from 'lucide-react'

interface AllGamesStats {
  total_games: number
  expected_total: number
  is_complete: boolean
  stats: {
    total_games: number
    min_sum: number | null
    max_sum: number | null
    avg_sum: number | null
    games_with_sequences: number | null
    balanced_7_8: number | null
    balanced_8_7: number | null
  }
  timestamp: string
}

export function AllGamesManager() {
  const [stats, setStats] = useState<AllGamesStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/all-games/stats')
      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Erro ao carregar stats:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchStats()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gerenciador de Jogos Possíveis
          </CardTitle>
          <CardDescription>
            Carregando estatísticas...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const completionPercentage = stats
    ? (stats.total_games / stats.expected_total) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gerenciador de Jogos Possíveis
          </CardTitle>
          <CardDescription>
            Base de dados com todas as 3.268.760 combinações possíveis da Lotofácil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {stats && (
            <>
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {stats.is_complete ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <Badge variant="default" className="bg-green-500">
                        Base Completa
                      </Badge>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      <Badge variant="secondary">
                        Importação Necessária
                      </Badge>
                    </>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  Atualizar
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">
                    {stats.total_games.toLocaleString()} / {stats.expected_total.toLocaleString()}
                    {' '}
                    ({completionPercentage.toFixed(2)}%)
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>

              {/* Statistics Grid */}
              {stats.is_complete && stats.stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      Soma Mínima
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.stats.min_sum || 'N/A'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      Soma Máxima
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.stats.max_sum || 'N/A'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      Soma Média
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.stats.avg_sum || 'N/A'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Percent className="h-4 w-4" />
                      Com Sequências
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.stats.games_with_sequences?.toLocaleString() || 'N/A'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Percent className="h-4 w-4" />
                      7 Ímpares
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.stats.balanced_7_8?.toLocaleString() || 'N/A'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Percent className="h-4 w-4" />
                      8 Ímpares
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.stats.balanced_8_7?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      {!stats?.is_complete && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Como Importar os Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A base de dados ainda não foi importada. Siga os passos abaixo para importar todos os jogos possíveis.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Passo 1: Criar a Tabela</h4>
                <p className="text-sm text-muted-foreground">
                  Execute o script SQL no Supabase SQL Editor:
                </p>
                <code className="block bg-muted p-3 rounded text-xs overflow-x-auto">
                  scripts/009_create_all_possible_games.sql
                </code>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Passo 2: Instalar Dependências</h4>
                <code className="block bg-muted p-3 rounded text-xs">
                  npm install
                </code>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Passo 3: Executar Importação</h4>
                <p className="text-sm text-muted-foreground">
                  Execute o script de importação (tempo estimado: 5-10 minutos):
                </p>
                <code className="block bg-muted p-3 rounded text-xs">
                  npm run import-all-games
                </code>
              </div>

              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  O script importará automaticamente todos os 3.268.760 jogos do arquivo{' '}
                  <code className="text-xs bg-muted px-1 rounded">TODO/games_csv.zip</code>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Examples Card */}
      {stats?.is_complete && (
        <Card>
          <CardHeader>
            <CardTitle>Exemplos de Uso da API</CardTitle>
            <CardDescription>
              Endpoints disponíveis para consultar os jogos possíveis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Validar um jogo</h4>
              <code className="block bg-muted p-3 rounded text-xs overflow-x-auto">
                POST /api/all-games/validate
                <br />
                {`{ "numbers": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] }`}
              </code>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Buscar jogos com filtros</h4>
              <code className="block bg-muted p-3 rounded text-xs overflow-x-auto">
                GET /api/all-games?oddCount=7,8&sumMin=185&sumMax=215&limit=100
              </code>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Encontrar jogos similares</h4>
              <code className="block bg-muted p-3 rounded text-xs overflow-x-auto">
                POST /api/all-games/similar
                <br />
                {`{ "numbers": [1,2,3,...], "minMatches": 11 }`}
              </code>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
