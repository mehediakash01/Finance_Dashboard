"use client"

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { mockTransactions } from "@/data/mock-transactions"
import { Transaction, TransactionCategory, TransactionFilters, UserRole } from "@/types/finance"

type AddTransactionInput = Omit<Transaction, "id">

type FinanceContextValue = {
  role: UserRole
  transactions: Transaction[]
  filteredTransactions: Transaction[]
  filters: TransactionFilters
  categories: TransactionCategory[]
  setRole: (role: UserRole) => void
  setFilters: (next: Partial<TransactionFilters>) => void
  resetFilters: () => void
  addTransaction: (transaction: AddTransactionInput) => void
}

const STORAGE_KEY_TRANSACTIONS = "finance-dashboard-transactions-v1"
const STORAGE_KEY_ROLE = "finance-dashboard-role-v1"

const defaultFilters: TransactionFilters = {
  query: "",
  type: "all",
  category: "all",
  sortBy: "newest",
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

export function FinanceProvider({ children }: PropsWithChildren) {
  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window === "undefined") {
      return "viewer"
    }

    const savedRole = window.localStorage.getItem(STORAGE_KEY_ROLE)
    return savedRole === "admin" || savedRole === "viewer" ? savedRole : "viewer"
  })

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window === "undefined") {
      return mockTransactions
    }

    const savedTransactions = window.localStorage.getItem(STORAGE_KEY_TRANSACTIONS)

    if (!savedTransactions) {
      return mockTransactions
    }

    try {
      return JSON.parse(savedTransactions) as Transaction[]
    } catch {
      return mockTransactions
    }
  })
  const [filters, setFiltersState] = useState<TransactionFilters>(defaultFilters)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY_ROLE, role)
  }, [role])

  const categories = useMemo(() => {
    return Array.from(new Set(transactions.map((transaction) => transaction.category))).sort() as TransactionCategory[]
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    const query = filters.query.trim().toLowerCase()

    const visible = transactions.filter((transaction) => {
      const queryMatch =
        query.length === 0 ||
        transaction.description.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query)

      const typeMatch = filters.type === "all" || transaction.type === filters.type
      const categoryMatch =
        filters.category === "all" || transaction.category === filters.category

      return queryMatch && typeMatch && categoryMatch
    })

    return visible.sort((a, b) => {
      if (filters.sortBy === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }

      if (filters.sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }

      if (filters.sortBy === "amount-high") {
        return b.amount - a.amount
      }

      return a.amount - b.amount
    })
  }, [transactions, filters])

  function setFilters(next: Partial<TransactionFilters>) {
    setFiltersState((current) => ({
      ...current,
      ...next,
    }))
  }

  function resetFilters() {
    setFiltersState(defaultFilters)
  }

  function addTransaction(transaction: AddTransactionInput) {
    setTransactions((current) => [
      {
        id: crypto.randomUUID(),
        ...transaction,
      },
      ...current,
    ])
  }

  const value: FinanceContextValue = {
    role,
    transactions,
    filteredTransactions,
    filters,
    categories,
    setRole,
    setFilters,
    resetFilters,
    addTransaction,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const context = useContext(FinanceContext)

  if (!context) {
    throw new Error("useFinance must be used inside FinanceProvider")
  }

  return context
}
