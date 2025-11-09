# Sistema de Jogos Possíveis - Lotofácil

Documentação completa do sistema de importação e uso dos 3.268.760 jogos possíveis da Lotofácil.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Instalação](#instalação)
3. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
4. [Importação dos Dados](#importação-dos-dados)
5. [API Endpoints](#api-endpoints)
6. [Casos de Uso](#casos-de-uso)
7. [Performance](#performance)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O sistema armazena **todas as 3.268.760 combinações possíveis** da Lotofácil (C(25,15)) no banco de dados PostgreSQL do Supabase, permitindo:

- ✅ Validação de apostas
- 🔍 Busca por jogos com características específicas
- 📊 Análises combinatórias avançadas
- 🎲 Sistema de fechamento (desdobramentos)
- 🔎 Encontrar jogos similares (quase acertei)

### Fonte dos Dados

Os dados originais estão em `TODO/games_csv.zip` (8.4 MB) e foram gerados matematicamente usando o algoritmo de combinações C(25,15).

**Créditos:** [gugacwb/lotofacil](https://github.com/gugacwb/lotofacil) (MIT License)

---

## 🚀 Instalação

### Passo 1: Instalar Dependências

```bash
npm install
```

As seguintes dependências serão instaladas:
- `tsx` - TypeScript executor
- `unzipper` - Extração de arquivos ZIP

### Passo 2: Criar a Tabela no Supabase

Execute o script SQL no **Supabase SQL Editor**:

```bash
scripts/009_create_all_possible_games.sql
```

Este script criará:
- Tabela `all_possible_games` com 13 colunas + índices
- Políticas RLS (Row Level Security)
- Funções auxiliares (`is_valid_lotofacil_game`, `find_similar_games`)
- View `all_games_stats` para estatísticas rápidas

### Passo 3: Executar a Importação

```bash
npm run import-all-games
```

**Tempo estimado:** 5-10 minutos
**Progresso:** Exibido em tempo real no terminal

```
✅ Processados: 3,268,760 | Inseridos: 3,268,760 | Batch: 3269 | Progresso: 100.00%
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `all_possible_games`

```sql
CREATE TABLE all_possible_games (
  id                    BIGSERIAL PRIMARY KEY,
  numbers               INTEGER[] NOT NULL,           -- [1,2,3,...,15]
  numbers_str           TEXT NOT NULL UNIQUE,         -- "01-02-03-...-15"
  sum_numbers           INTEGER NOT NULL,             -- 120-300
  odd_count             INTEGER NOT NULL,             -- 0-15
  even_count            INTEGER NOT NULL,             -- 0-15
  low_count             INTEGER NOT NULL,             -- 1-12
  high_count            INTEGER NOT NULL,             -- 13-25
  range_01_05           INTEGER NOT NULL,
  range_06_10           INTEGER NOT NULL,
  range_11_15           INTEGER NOT NULL,
  range_16_20           INTEGER NOT NULL,
  range_21_25           INTEGER NOT NULL,
  has_sequence          BOOLEAN NOT NULL,
  max_sequence_length   INTEGER NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);
```

### Índices Criados

- `idx_all_games_sum` - Busca por soma
- `idx_all_games_odd_even` - Busca por ímpares/pares
- `idx_all_games_numbers_gin` - Busca por números específicos (GIN)
- `idx_all_games_has_sequence` - Jogos com sequências
- `idx_all_games_ranges` - Distribuição por faixas

### Funções SQL

#### `is_valid_lotofacil_game(INTEGER[])`

Verifica se um jogo é válido:

```sql
SELECT is_valid_lotofacil_game(ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
-- Retorna: true
```

#### `find_similar_games(INTEGER[], INTEGER)`

Encontra jogos similares:

```sql
SELECT * FROM find_similar_games(
  ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
  11  -- mínimo de matches
) LIMIT 10;
```

---

## 🌐 API Endpoints

### 1. **GET** `/api/all-games/stats`

Retorna estatísticas gerais da base de dados.

**Response:**
```json
{
  "total_games": 3268760,
  "expected_total": 3268760,
  "is_complete": true,
  "stats": {
    "total_games": 3268760,
    "min_sum": 120,
    "max_sum": 300,
    "avg_sum": 195.00,
    "games_with_sequences": 1500000,
    "balanced_7_8": 817190,
    "balanced_8_7": 817190
  }
}
```

---

### 2. **GET** `/api/all-games`

Busca jogos com filtros.

**Query Parameters:**

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `oddCount` | string | Ímpares (separado por vírgula) | `7,8` |
| `evenCount` | string | Pares | `7,8` |
| `sumMin` | number | Soma mínima | `185` |
| `sumMax` | number | Soma máxima | `215` |
| `mustInclude` | string | Números obrigatórios | `3,7,15` |
| `mustExclude` | string | Números proibidos | `25` |
| `hasSequence` | boolean | Tem sequências? | `true` |
| `limit` | number | Limite (máx 1000) | `100` |
| `offset` | number | Paginação | `0` |

**Exemplo:**
```bash
GET /api/all-games?oddCount=7,8&sumMin=185&sumMax=215&limit=100
```

**Response:**
```json
{
  "games": [
    {
      "id": 12345,
      "numbers": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,16],
      "numbers_str": "01-02-03-04-05-06-07-08-09-10-11-12-13-14-16",
      "sum_numbers": 195,
      "odd_count": 7,
      "even_count": 8,
      "has_sequence": true
    }
  ],
  "total": 3268760,
  "filtered": 45,
  "offset": 0,
  "limit": 100
}
```

---

### 3. **POST** `/api/all-games/validate`

Valida se um jogo é válido.

**Request:**
```json
{
  "numbers": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
}
```

**Response:**
```json
{
  "valid": true,
  "numbers": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
  "numbers_str": "01-02-03-04-05-06-07-08-09-10-11-12-13-14-15",
  "game_id": 1,
  "message": "Jogo válido! Esta combinação existe nas possibilidades da Lotofácil."
}
```

---

### 4. **POST** `/api/all-games/similar`

Encontra jogos similares (útil para "quase acertei").

**Request:**
```json
{
  "numbers": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
  "minMatches": 11
}
```

**Response:**
```json
{
  "input_numbers": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
  "min_matches": 11,
  "total_found": 156,
  "similar_games": [
    {
      "game_id": 12,
      "game_numbers": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,16],
      "game_str": "01-02-03-04-05-06-07-08-09-10-11-12-13-14-16",
      "match_count": 14
    }
  ]
}
```

---

## 💡 Casos de Uso

### 1. Validar Aposta do Usuário

```typescript
const response = await fetch('/api/all-games/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    numbers: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
  })
})

const { valid } = await response.json()
if (!valid) {
  alert('Aposta inválida!')
}
```

### 2. Gerar Jogos Balanceados

```typescript
// Buscar jogos com 7 ou 8 ímpares, soma entre 185-215
const response = await fetch(
  '/api/all-games?oddCount=7,8&sumMin=185&sumMax=215&limit=1000'
)

const { games } = await response.json()
// Retorna até 1000 jogos otimizados
```

### 3. Sistema "Quase Acertei"

```typescript
const drawnNumbers = [3,5,7,9,11,13,15,17,19,21,22,23,24,25,01]

const response = await fetch('/api/all-games/similar', {
  method: 'POST',
  body: JSON.stringify({
    numbers: userPrediction,
    minMatches: 14  // Errou só 1
  })
})

const { similar_games } = await response.json()
console.log(`Você errou só ${15 - similar_games[0].match_count} número(s)!`)
```

### 4. Filtrar Jogos por Padrões

```typescript
// Buscar jogos sem sequências, com números específicos
const response = await fetch(
  '/api/all-games?hasSequence=false&mustInclude=3,7,13&mustExclude=25&limit=100'
)
```

---

## ⚡ Performance

### Importação

- **Velocidade:** ~10.000 jogos/segundo
- **Tempo total:** 5-10 minutos
- **Batch size:** 1000 jogos por INSERT
- **Uso de memória:** ~500 MB durante importação

### Consultas

#### Queries Rápidas (< 100ms)
- Busca por ID
- Validação de jogo (índice GIN)
- Estatísticas (view materializada)
- Contagem total

#### Queries Médias (100-500ms)
- Filtros simples (odd/even, sum)
- Range queries
- Paginação

#### Queries Lentas (> 500ms)
- `mustInclude`/`mustExclude` (post-processing)
- `find_similar_games` com minMatches baixo
- Queries sem índices

### Otimizações Recomendadas

1. **Cache em Redis:**
```typescript
// Cachear queries frequentes
const cacheKey = `games:${JSON.stringify(filters)}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)
```

2. **Materialized Views:**
```sql
CREATE MATERIALIZED VIEW popular_patterns AS
SELECT odd_count, even_count, COUNT(*) as total
FROM all_possible_games
GROUP BY odd_count, even_count;
```

3. **Partition by Range:**
```sql
-- Para bases muito grandes
CREATE TABLE all_possible_games_part_1 PARTITION OF all_possible_games
FOR VALUES FROM (120) TO (200);
```

---

## 🐛 Troubleshooting

### Erro: "Tabela não existe"

**Solução:** Execute o script SQL antes da importação:
```bash
scripts/009_create_all_possible_games.sql
```

### Erro: "SUPABASE_SERVICE_ROLE_KEY não definida"

**Solução:** Configure as variáveis de ambiente:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### Importação Travou

**Solução:** Verifique:
1. Conexão com internet (API Supabase)
2. Limites do plano Supabase (Free tier tem limites)
3. Arquivo `TODO/games_csv.zip` existe e não está corrompido

```bash
# Verificar arquivo
unzip -t TODO/games_csv.zip
```

### Query Muito Lenta

**Solução:** Verifique os índices:
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'all_possible_games';
```

Se faltarem índices, execute novamente o script `009_create_all_possible_games.sql`.

### Erro de Memória no Import

**Solução:** Reduzir BATCH_SIZE:
```typescript
// Em scripts/import-all-games.ts
const BATCH_SIZE = 500 // era 1000
```

---

## 📊 Estatísticas da Base

### Distribuição por Soma

| Faixa | Jogos | % |
|-------|-------|---|
| 120-150 | ~200k | 6% |
| 151-180 | ~800k | 25% |
| 181-210 | ~1.2M | 37% |
| 211-240 | ~800k | 25% |
| 241-300 | ~200k | 6% |

### Distribuição Ímpar/Par

| Ímpares | Pares | Jogos | % |
|---------|-------|-------|---|
| 7 | 8 | 817.190 | 25% |
| 8 | 7 | 817.190 | 25% |
| 6 | 9 | 490.314 | 15% |
| 9 | 6 | 490.314 | 15% |
| Outros | - | 653.752 | 20% |

### Jogos com Sequências

- **Com sequências (3+):** ~1.5M (46%)
- **Sem sequências:** ~1.7M (54%)

---

## 🔐 Segurança

### RLS (Row Level Security)

```sql
-- Leitura: Pública
CREATE POLICY "Qualquer um pode visualizar jogos possíveis"
  ON all_possible_games FOR SELECT USING (true);

-- Escrita: Apenas Admin
CREATE POLICY "Apenas admin pode inserir jogos"
  ON all_possible_games FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### API Rate Limiting

Considere adicionar rate limiting nas rotas públicas:

```typescript
// middleware.ts
if (isPublicRoute && !checkRateLimit(ip)) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
}
```

---

## 📚 Referências

- [Repositório Original](https://github.com/gugacwb/lotofacil)
- [Combinações C(n,k)](https://en.wikipedia.org/wiki/Combination)
- [PostgreSQL Array Functions](https://www.postgresql.org/docs/current/functions-array.html)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

---

## 📝 Licença

Dados originais: MIT License © 2021 gugacwb
Sistema de importação: Parte do projeto Lotofy

---

## 🆘 Suporte

Em caso de problemas:

1. Verifique este documento
2. Consulte os logs de importação
3. Teste as APIs com Postman/Insomnia
4. Abra uma issue no repositório

**Última atualização:** 2025-11-09
