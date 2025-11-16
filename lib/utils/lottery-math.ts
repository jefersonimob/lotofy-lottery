export function factorial(num: number): number {
  if (num <= 1) return 1
  let calc: number = num
  while (num > 1) calc *= --num
  return calc
}

export function combinatorics(amount: number, overall: number): number {
  const f1 = factorial(overall)
  const f2 = factorial(amount)
  const f3 = factorial(overall - amount)

  return Math.round(f1 / (f2 * f3))
}

export function randomInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function betQuantity(balls: number): number {
  return balls > 15 ? combinatorics(15, balls) : balls === 15 ? 1 : 0
}

const totalBets: number = combinatorics(15, 25)

export function probability(quantity: number): number {
  return quantity > 0 ? Math.round(totalBets / quantity) : 0
}

export function probabilityLevel(prob: number): 1 | 2 | 3 | 4 | 5 {
  if (prob < 1) return 5

  return prob <= totalBets / 10000
    ? 1
    : prob <= totalBets / 1000
      ? 2
      : prob <= totalBets / 100
        ? 3
        : prob <= totalBets / 10
          ? 4
          : 5
}

export function match(bet: number[], raffle: number[]): number {
  return bet.reduce((sum, num1) => (raffle.some((num2) => num1 === num2) ? sum + 1 : sum), 0)
}

export function matches(bet: number[], raffles: number[][]): Record<number, number> {
  const result: Record<number, number> = {}

  raffles.forEach((raffle) => {
    const hit: number = match(bet, raffle)
    if (hit in result) {
      result[hit]++
    } else {
      result[hit] = 1
    }
  })

  return result
}

export function whoMatches(bet: number[], raffles: Record<number, number[]>): Record<number, number[]> {
  const result: Record<number, number[]> = {}

  Object.entries(raffles).forEach(([contestNum, raffle]) => {
    const hit: number = match(bet, raffle)
    if (!(hit in result)) result[hit] = []
    result[hit].push(parseInt(contestNum))
  })

  return result
}

export function surprise(amount: number = 15, overall: number = 25): number[] {
  if (amount > overall) throw new Error("amount cannot be greater than overall")

  const result: number[] = []

  while (result.length < amount) {
    const random: number = randomInt(1, overall)
    if (result.some((num) => num === random)) continue
    result.push(random)
  }

  return result.sort((a, b) => a - b)
}

export function surprises(quantity: number, amount: number = 15, overall: number = 25): number[][] {
  const bets: number[][] = []
  while (bets.length < quantity) bets.push(surprise(amount, overall))
  return bets
}

export function sum(bet: number[]): number {
  return bet.reduce((total, num) => total + num, 0)
}

export function mean(bet: number[]): number {
  return Math.round(sum(bet) / bet.length)
}

export function pairs(bet: number[]): number {
  return bet.reduce((total, num) => (num % 2 === 0 ? total + 1 : total), 0)
}

function isPrime(num: number): boolean {
  for (let i = 2; i < num; i++) if (num % i === 0) return false
  return num > 1
}

export function primes(bet: number[]): number {
  return bet.reduce((total, num) => (isPrime(num) ? total + 1 : total), 0)
}

export function replicates(bets: number[][]): number[] {
  return bets.reduce((res, bet, index) => {
    const duplicates = bets.filter((bet2) => bet.every((num) => bet2.some((num2) => num === num2)))
    return duplicates.length > 1 ? [...res, index] : res
  }, [] as number[])
}

export function betCost(balls: number, pricePerBet: number = 3.0): number {
  const quantity = betQuantity(balls)
  return quantity * pricePerBet
}

export function totalCost(bets: number[][], pricePerBet: number = 3.0): number {
  return bets.reduce((total, bet) => total + betCost(bet.length, pricePerBet), 0)
}
