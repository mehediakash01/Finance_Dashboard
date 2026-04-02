export type TransactionType = "income" | "expense"

export type UserRole = "viewer" | "admin"

export type TransactionCategory =
  | "Salary"
  | "Freelance"
  | "Groceries"
  | "Housing"
  | "Transport"
  | "Utilities"
  | "Dining"
  | "Shopping"
  | "Health"
  | "Entertainment"
  | "Savings"
  | "Investment"

export type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  category: TransactionCategory
  type: TransactionType
}

export type TransactionFilters = {
  query: string
  type: "all" | TransactionType
  category: "all" | TransactionCategory
  sortBy: "newest" | "oldest" | "amount-high" | "amount-low"
}
