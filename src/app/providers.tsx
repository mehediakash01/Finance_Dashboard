"use client"

import { PropsWithChildren } from "react"

import { FinanceProvider } from "@/context/finance-context"

export function Providers({ children }: PropsWithChildren) {
  return <FinanceProvider>{children}</FinanceProvider>
}
