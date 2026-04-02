"use client"

import { FormEvent, useMemo, useState } from "react"
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Filter,
  Plus,
  Shield,
  UserRound,
  Wallet,
} from "lucide-react"

import { useFinance } from "@/context/finance-context"
import {
  formatCurrency,
  formatDate,
  getBalanceTrend,
  getInsights,
  getSpendingBreakdown,
  getSummary,
} from "@/lib/finance-utils"
import { TransactionCategory, TransactionType, UserRole } from "@/types/finance"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const trendChartConfig = {
  net: {
    label: "Net",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const spendingChartConfig = {
  amount: {
    label: "Spent",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

type NewTransactionState = {
  date: string
  description: string
  amount: string
  category: TransactionCategory | null
  type: TransactionType
}

const initialFormState: NewTransactionState = {
  date: "",
  description: "",
  amount: "",
  category: null,
  type: "expense",
}

export function DashboardShell() {
  const {
    role,
    filters,
    categories,
    transactions,
    filteredTransactions,
    setRole,
    setFilters,
    resetFilters,
    addTransaction,
  } = useFinance()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<NewTransactionState>(initialFormState)

  const summary = useMemo(() => getSummary(transactions), [transactions])
  const trend = useMemo(() => getBalanceTrend(transactions), [transactions])
  const spending = useMemo(() => getSpendingBreakdown(transactions), [transactions])
  const insights = useMemo(() => getInsights(transactions), [transactions])

  function handleRoleChange(next: UserRole | null) {
    if (next) {
      setRole(next)
    }
  }

  function handleAddTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.category || !form.date || !form.description || !form.amount) {
      return
    }

    addTransaction({
      date: form.date,
      description: form.description,
      amount: Number(form.amount),
      category: form.category,
      type: form.type,
    })

    setForm(initialFormState)
    setDialogOpen(false)
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-3xl border bg-linear-to-r from-[#f7f6f2] via-[#f6eee4] to-[#eff7f5] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Finance Dashboard
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Stay in control of every dollar
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              A focused snapshot of your balance, spending rhythm, and transaction flow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-45 bg-background/90">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer role</SelectItem>
                <SelectItem value="admin">Admin role</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger
                render={
                  <Button disabled={role !== "admin"}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add transaction
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a transaction</DialogTitle>
                  <DialogDescription>
                    This action is available only for admin role.
                  </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleAddTransaction}>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={form.description}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Payment details"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        min={1}
                        value={form.amount}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            amount: event.target.value,
                          }))
                        }
                        placeholder="0"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={form.date}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            date: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Category</Label>
                      <Select
                        value={form.category}
                        onValueChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            category: value as TransactionCategory,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pick category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Type</Label>
                      <Select
                        value={form.type}
                        onValueChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            type: value as TransactionType,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit">Save transaction</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          {role === "admin" ? (
            <>
              <Shield className="h-4 w-4" />
              Admin mode can add transactions.
            </>
          ) : (
            <>
              <UserRound className="h-4 w-4" />
              Viewer mode has read-only access.
            </>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="border-0 bg-linear-to-br from-emerald-50 to-white shadow-sm">
          <CardHeader>
            <CardDescription>Total Balance</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(summary.balance)}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4" />
            Net position after all transactions
          </CardContent>
        </Card>

        <Card className="border-0 bg-linear-to-br from-sky-50 to-white shadow-sm">
          <CardHeader>
            <CardDescription>Total Income</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(summary.income)}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-emerald-700">
            <ArrowUpRight className="h-4 w-4" />
            Cash in over selected data
          </CardContent>
        </Card>

        <Card className="border-0 bg-linear-to-br from-amber-50 to-white shadow-sm sm:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(summary.expenses)}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-rose-700">
            <ArrowDownRight className="h-4 w-4" />
            Outflow across all categories
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Balance trend</CardTitle>
            <CardDescription>Monthly net movement (income - expenses)</CardDescription>
          </CardHeader>
          <CardContent>
            {trend.length > 0 ? (
              <ChartContainer className="h-75 w-full" config={trendChartConfig}>
                <LineChart data={trend} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="var(--color-net)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <EmptyState title="No trend yet" description="Add transactions to visualize monthly performance." />
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Spending breakdown</CardTitle>
            <CardDescription>Category distribution for expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {spending.length > 0 ? (
              <ChartContainer className="mx-auto h-75 w-full" config={spendingChartConfig}>
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />}
                  />
                  <Pie
                    data={spending}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={88}
                    label
                  >
                    {spending.map((entry, index) => (
                      <Cell key={entry.category} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <EmptyState title="No spending data" description="Expense transactions will appear here." />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Search, filter, and sort your transaction list</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <Input
                  value={filters.query}
                  onChange={(event) => setFilters({ query: event.target.value })}
                  placeholder="Search by description or category"
                />
              </div>

              <Select
                value={filters.type}
                onValueChange={(value) => {
                  if (value) {
                    setFilters({ type: value as TransactionType | "all" })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.category}
                onValueChange={(value) =>
                  value
                    ? setFilters({
                        category: value as TransactionCategory | "all",
                      })
                    : undefined
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={filters.sortBy}
                onValueChange={(value) => {
                  if (value) {
                    setFilters({ sortBy: value as typeof filters.sortBy })
                  }
                }}
              >
                <SelectTrigger className="w-55">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Sort: Newest first</SelectItem>
                  <SelectItem value="oldest">Sort: Oldest first</SelectItem>
                  <SelectItem value="amount-high">Sort: Amount high to low</SelectItem>
                  <SelectItem value="amount-low">Sort: Amount low to high</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={resetFilters}>
                <Filter className="mr-1.5 h-4 w-4" />
                Reset filters
              </Button>
            </div>

            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell className="font-medium">{transaction.description}</TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>
                          <Badge
                            variant={transaction.type === "income" ? "secondary" : "destructive"}
                            className={
                              transaction.type === "income"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }
                          >
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No transactions match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
            <CardDescription>Quick observations from your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InsightItem
              label="Highest spending category"
              value={
                insights.highestSpending
                  ? `${insights.highestSpending.category} (${formatCurrency(insights.highestSpending.amount)})`
                  : "No expense data yet"
              }
            />

            <Separator />

            <InsightItem
              label="Monthly comparison"
              value={
                insights.latestMonth && insights.previousMonth
                  ? `${insights.latestMonth.month} is ${Math.abs(insights.monthComparison).toFixed(1)}% ${
                      insights.monthComparison >= 0 ? "above" : "below"
                    } ${insights.previousMonth.month}`
                  : "Need at least two months of data"
              }
            />

            <Separator />

            <InsightItem
              label="Average expense"
              value={formatCurrency(insights.averageExpense)}
            />

            <Separator />

            <div className="rounded-xl bg-muted/70 p-3 text-sm text-muted-foreground">
              <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                <CircleDollarSign className="h-4 w-4" />
                Recommendation
              </div>
              Move 10% of monthly income to savings before discretionary spending.
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function InsightItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-70 flex-col items-center justify-center rounded-xl border border-dashed text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
