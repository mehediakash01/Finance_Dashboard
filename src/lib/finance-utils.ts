import { Transaction } from "@/types/finance"

export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatDate(date: string): string {
  return dateFormatter.format(new Date(date))
}

export function getSummary(transactions: Transaction[]) {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  return {
    income,
    expenses,
    balance: income - expenses,
  }
}

export function getBalanceTrend(transactions: Transaction[]) {
  const monthMap = new Map<string, { month: string; income: number; expense: number; net: number }>()

  transactions.forEach((transaction) => {
    const month = new Date(transaction.date).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    })

    const current = monthMap.get(month) ?? { month, income: 0, expense: 0, net: 0 }

    if (transaction.type === "income") {
      current.income += transaction.amount
      current.net += transaction.amount
    } else {
      current.expense += transaction.amount
      current.net -= transaction.amount
    }

    monthMap.set(month, current)
  })

  return [...monthMap.values()]
}

export function getSpendingBreakdown(transactions: Transaction[]) {
  const categoryMap = new Map<string, number>()

  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      categoryMap.set(
        transaction.category,
        (categoryMap.get(transaction.category) ?? 0) + transaction.amount
      )
    })

  return [...categoryMap.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function getInsights(transactions: Transaction[]) {
  const monthly = getBalanceTrend(transactions)
  const spending = getSpendingBreakdown(transactions)

  const highestSpending = spending[0]
  const latestMonth = monthly[monthly.length - 1]
  const previousMonth = monthly[monthly.length - 2]

  const monthComparison =
    latestMonth && previousMonth
      ? ((latestMonth.net - previousMonth.net) / Math.max(Math.abs(previousMonth.net), 1)) * 100
      : 0

  return {
    highestSpending,
    latestMonth,
    previousMonth,
    monthComparison,
    averageExpense:
      transactions.filter((transaction) => transaction.type === "expense").reduce((sum, tx) => sum + tx.amount, 0) /
      Math.max(transactions.filter((transaction) => transaction.type === "expense").length, 1),
  }
}
