"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import {
  CartesianGrid,
  Cell,
  Area,
  AreaChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Download,
  Filter,
  Lightbulb,
  Menu,
  Moon,
  Plus,
  Shield,
  Sun,
  Table2,
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

const PAGE_SIZE = 7

const navItems = [
  {
    id: "overview",
    label: "Overview",
    icon: BarChart3,
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: Table2,
  },
  {
    id: "insights",
    label: "Insights",
    icon: Lightbulb,
  },
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }

    const savedTheme = window.localStorage.getItem("finance-dashboard-theme")
    return savedTheme === "dark"
  })
  const [form, setForm] = useState<NewTransactionState>(initialFormState)

  const summary = useMemo(() => getSummary(transactions), [transactions])
  const trend = useMemo(() => getBalanceTrend(transactions), [transactions])
  const spending = useMemo(() => getSpendingBreakdown(transactions), [transactions])
  const insights = useMemo(() => getInsights(transactions), [transactions])
  const topSpendingCategories = useMemo(() => spending.slice(0, 3), [spending])
  const trendTitle = isDark ? "Balance evolution" : "Balance trend"
  const trendSubtitle = isDark
    ? "Capital performance over the last 6 months"
    : "Monthly net movement (income - expenses)"

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedTransactions = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    return filteredTransactions.slice(start, end)
  }, [safeCurrentPage, filteredTransactions])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
    window.localStorage.setItem("finance-dashboard-theme", isDark ? "dark" : "light")
  }, [isDark])

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

  function triggerDownload(filename: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function exportAsJson() {
    triggerDownload(
      "transactions-export.json",
      JSON.stringify(filteredTransactions, null, 2),
      "application/json"
    )
  }

  function exportAsCsv() {
    const header = ["date", "description", "category", "type", "amount"]
    const rows = filteredTransactions.map((transaction) => [
      transaction.date,
      escapeCsv(transaction.description),
      transaction.category,
      transaction.type,
      String(transaction.amount),
    ])

    const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n")
    triggerDownload("transactions-export.csv", csv, "text/csv;charset=utf-8")
  }

  function toggleTheme() {
    setIsDark((current) => !current)
  }

  return (
    <div className="mx-auto flex w-full max-w-360 gap-6 px-3 py-4 sm:px-6 lg:px-8">
      <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-68 shrink-0 flex-col rounded-[1.75rem] bg-(--card)/72 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.24)] backdrop-blur-2xl lg:flex">
        <div className="mb-6 space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dashboard</p>
          <h2 className="text-xl font-semibold">Finance Control</h2>
          <p className="text-sm text-muted-foreground">Navigate sections quickly.</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl bg-white/5 p-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Quick tip</p>
          <p className="mt-1">Use filters first, then export only what you need.</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] bg-(--card)/64 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(0,240,255,0.14),transparent_28%),radial-gradient(circle_at_84%_4%,rgba(207,92,255,0.16),transparent_24%)]" />
          <div className="pointer-events-none absolute -right-12 top-4 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-72 -translate-x-1/2 rounded-full bg-fuchsia-400/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
            <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <DialogTrigger
                render={
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4" />
                    Menu
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Navigate dashboard</DialogTitle>
                  <DialogDescription>Jump to any section quickly.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </a>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              Theme
            </Button>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.26em] text-muted-foreground/80">
                Finance Dashboard
              </p>
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Stay in control of every dollar
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground/90 sm:text-base">
                A focused snapshot of your balance, spending rhythm, and transaction flow.
              </p>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <Button variant="secondary" size="sm" onClick={exportAsCsv}>
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button variant="secondary" size="sm" onClick={exportAsJson}>
                <Download className="h-4 w-4" />
                JSON
              </Button>
              <Button variant="secondary" size="sm" onClick={toggleTheme}>
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDark ? "Light" : "Dark"}
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer role</SelectItem>
                <SelectItem value="admin">Admin role</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="secondary" size="sm" onClick={exportAsCsv} className="lg:hidden">
              <Download className="h-4 w-4" />
              CSV
            </Button>

            <Button variant="secondary" size="sm" onClick={exportAsJson} className="lg:hidden">
              <Download className="h-4 w-4" />
              JSON
            </Button>

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
          </div>
        </section>

        <section id="overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 scroll-mt-24">
          <Card>
          <CardHeader>
            <CardDescription>Total Balance</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(summary.balance)}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4" />
            Net position after all transactions
          </CardContent>
        </Card>

          <Card>
          <CardHeader>
            <CardDescription>Total Income</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(summary.income)}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-emerald-700">
            <ArrowUpRight className="h-4 w-4" />
            Cash in over selected data
          </CardContent>
        </Card>

          <Card className="sm:col-span-2 xl:col-span-1">
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
          <Card className={`xl:col-span-3 ${isDark ? "bg-(--surface-container-low)/90" : ""}`}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{trendTitle}</CardTitle>
                <CardDescription>{trendSubtitle}</CardDescription>
              </div>
              {isDark ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-foreground">6M</span>
                  <span>1Y</span>
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {trend.length > 0 ? (
              <ChartContainer className="h-75 w-full" config={trendChartConfig}>
                <AreaChart data={trend} margin={{ left: 12, right: 12, top: 8, bottom: 4 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-net)" stopOpacity={0.92} />
                      <stop offset="42%" stopColor="var(--color-net)" stopOpacity={0.56} />
                      <stop offset="100%" stopColor="var(--color-net)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="natural"
                    dataKey="net"
                    stroke="var(--color-net)"
                    strokeWidth={4.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="url(#trendFill)"
                    fillOpacity={1}
                  />
                </AreaChart>
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

        <section id="transactions" className="grid gap-4 lg:grid-cols-3 items-start scroll-mt-24">
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
                  onChange={(event) => {
                    setCurrentPage(1)
                    setFilters({ query: event.target.value })
                  }}
                  placeholder="Search by description or category"
                />
              </div>

              <Select
                value={filters.type}
                onValueChange={(value) => {
                  if (value) {
                    setCurrentPage(1)
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
                    ? (setCurrentPage(1),
                      setFilters({
                        category: value as TransactionCategory | "all",
                      }))
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
                    setCurrentPage(1)
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

              <Button
                variant="outline"
                onClick={() => {
                  setCurrentPage(1)
                  resetFilters()
                }}
              >
                <Filter className="mr-1.5 h-4 w-4" />
                Reset filters
              </Button>
            </div>

            <div className="overflow-hidden rounded-2xl">
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
                    paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell className="font-medium">{transaction.description}</TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>
                          <Badge
                            variant={transaction.type === "income" ? "secondary" : "destructive"}
                            className={
                              transaction.type === "income"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
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

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.length > 0
                  ? `Showing ${(safeCurrentPage - 1) * PAGE_SIZE + 1}-${Math.min(
                      safeCurrentPage * PAGE_SIZE,
                      filteredTransactions.length
                    )} of ${filteredTransactions.length}`
                  : "No records to display"}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {safeCurrentPage} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

          <Card id="insights" className="self-start scroll-mt-24">
          <CardHeader>
            <CardTitle>Insights</CardTitle>
            <CardDescription>Readable signals for quick decisions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <SignalTile
                title="Top spend"
                value={
                  insights.highestSpending
                    ? `${insights.highestSpending.category} • ${formatCurrency(insights.highestSpending.amount)}`
                    : "No expense data yet"
                }
              />
              <SignalTile
                title="Month-over-month"
                value={
                  insights.latestMonth && insights.previousMonth
                    ? `${Math.abs(insights.monthComparison).toFixed(1)}% ${
                        insights.monthComparison >= 0 ? "increase" : "decrease"
                      }`
                    : "Need 2+ months"
                }
              />
              <SignalTile title="Avg expense" value={formatCurrency(insights.averageExpense)} />
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Top categories</p>
              {topSpendingCategories.length > 0 ? (
                topSpendingCategories.map((item) => (
                  <div key={item.category} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                    <span className="text-foreground">{item.category}</span>
                    <span className="font-medium text-foreground">{formatCurrency(item.amount)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No spending categories available.</p>
              )}
            </div>

            <div className="rounded-xl bg-white/5 p-3 text-sm text-muted-foreground">
              <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                <CircleDollarSign className="h-4 w-4" />
                Suggested move
              </div>
              Set a weekly cap for your highest spending category to improve monthly net.
            </div>
          </CardContent>
        </Card>
        </section>
      </main>
    </div>
  )
}

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}

function SignalTile({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2">
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground/80">{title}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-70 flex-col items-center justify-center rounded-2xl bg-white/5 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
