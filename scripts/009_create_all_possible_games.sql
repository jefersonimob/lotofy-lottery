-- 009: Criar tabela para todos os jogos possíveis da Lotofácil
-- Total: 3.268.760 combinações possíveis (C(25,15))

-- Criar tabela principal
CREATE TABLE IF NOT EXISTS all_possible_games (
  id BIGSERIAL PRIMARY KEY,

  -- Números do jogo
  numbers INTEGER[] NOT NULL,           -- Array: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
  numbers_str TEXT NOT NULL UNIQUE,     -- String: "01-02-03-04-05-06-07-08-09-10-11-12-13-14-15"

  -- Metadados para filtros rápidos (pré-calculados)
  sum_numbers INTEGER NOT NULL,         -- Soma dos 15 números (mín: 120, máx: 300)
  odd_count INTEGER NOT NULL,           -- Quantidade de números ímpares (0-15)
  even_count INTEGER NOT NULL,          -- Quantidade de números pares (0-15)
  low_count INTEGER NOT NULL,           -- Números de 1-12
  high_count INTEGER NOT NULL,          -- Números de 13-25

  -- Análise de distribuição por faixas
  range_01_05 INTEGER NOT NULL,         -- Quantidade de números entre 01-05
  range_06_10 INTEGER NOT NULL,         -- Quantidade de números entre 06-10
  range_11_15 INTEGER NOT NULL,         -- Quantidade de números entre 11-15
  range_16_20 INTEGER NOT NULL,         -- Quantidade de números entre 16-20
  range_21_25 INTEGER NOT NULL,         -- Quantidade de números entre 21-25

  -- Padrões de sequências
  has_sequence BOOLEAN NOT NULL,        -- Tem 3+ números consecutivos?
  max_sequence_length INTEGER NOT NULL, -- Maior sequência de números consecutivos

  -- Metadados de sistema
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance em consultas comuns
CREATE INDEX IF NOT EXISTS idx_all_games_sum ON all_possible_games(sum_numbers);
CREATE INDEX IF NOT EXISTS idx_all_games_odd_even ON all_possible_games(odd_count, even_count);
CREATE INDEX IF NOT EXISTS idx_all_games_low_high ON all_possible_games(low_count, high_count);
CREATE INDEX IF NOT EXISTS idx_all_games_numbers_gin ON all_possible_games USING GIN(numbers);
CREATE INDEX IF NOT EXISTS idx_all_games_has_sequence ON all_possible_games(has_sequence);
CREATE INDEX IF NOT EXISTS idx_all_games_ranges ON all_possible_games(range_01_05, range_06_10, range_11_15, range_16_20, range_21_25);

-- Índice para busca por string (útil para verificar se jogo existe)
CREATE INDEX IF NOT EXISTS idx_all_games_str ON all_possible_games(numbers_str);

-- Comentários na tabela
COMMENT ON TABLE all_possible_games IS 'Todas as 3.268.760 combinações possíveis da Lotofácil';
COMMENT ON COLUMN all_possible_games.numbers IS 'Array de 15 números ordenados';
COMMENT ON COLUMN all_possible_games.numbers_str IS 'String formatada do jogo (único)';
COMMENT ON COLUMN all_possible_games.sum_numbers IS 'Soma dos 15 números (120-300)';
COMMENT ON COLUMN all_possible_games.odd_count IS 'Quantidade de números ímpares';
COMMENT ON COLUMN all_possible_games.even_count IS 'Quantidade de números pares';
COMMENT ON COLUMN all_possible_games.low_count IS 'Quantidade de números baixos (1-12)';
COMMENT ON COLUMN all_possible_games.high_count IS 'Quantidade de números altos (13-25)';

-- RLS (Row Level Security)
ALTER TABLE all_possible_games ENABLE ROW LEVEL SECURITY;

-- Políticas: Todos podem ler, apenas admin pode inserir/modificar
CREATE POLICY "Qualquer um pode visualizar jogos possíveis"
  ON all_possible_games
  FOR SELECT
  USING (true);

CREATE POLICY "Apenas admin pode inserir jogos"
  ON all_possible_games
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Apenas admin pode deletar jogos"
  ON all_possible_games
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Função auxiliar para verificar se um jogo específico é válido
CREATE OR REPLACE FUNCTION is_valid_lotofacil_game(game_numbers INTEGER[])
RETURNS BOOLEAN AS $$
BEGIN
  -- Verifica se existe na tabela de jogos possíveis
  RETURN EXISTS (
    SELECT 1 FROM all_possible_games
    WHERE numbers = game_numbers
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Função para buscar jogos similares (útil para "quase acertei")
CREATE OR REPLACE FUNCTION find_similar_games(
  input_numbers INTEGER[],
  min_matches INTEGER DEFAULT 11
)
RETURNS TABLE (
  game_id BIGINT,
  game_numbers INTEGER[],
  game_str TEXT,
  match_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id,
    numbers,
    numbers_str,
    (SELECT COUNT(*) FROM UNNEST(numbers) num WHERE num = ANY(input_numbers))::INTEGER as matches
  FROM all_possible_games
  WHERE (SELECT COUNT(*) FROM UNNEST(numbers) num WHERE num = ANY(input_numbers)) >= min_matches
  ORDER BY matches DESC, id
  LIMIT 100;
END;
$$ LANGUAGE plpgsql STABLE;

-- View para estatísticas rápidas
CREATE OR REPLACE VIEW all_games_stats AS
SELECT
  COUNT(*) as total_games,
  MIN(sum_numbers) as min_sum,
  MAX(sum_numbers) as max_sum,
  ROUND(AVG(sum_numbers)::numeric, 2) as avg_sum,
  COUNT(*) FILTER (WHERE has_sequence = true) as games_with_sequences,
  COUNT(*) FILTER (WHERE odd_count = 7 AND even_count = 8) as balanced_7_8,
  COUNT(*) FILTER (WHERE odd_count = 8 AND even_count = 7) as balanced_8_7
FROM all_possible_games;

COMMENT ON VIEW all_games_stats IS 'Estatísticas gerais sobre todos os jogos possíveis';
