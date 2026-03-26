import { useState, Suspense, lazy } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { useTheme } from "next-themes"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Toaster } from '@/components/ui/sonner.jsx'
import { Home, Plus, List, BarChart3, Calendar, Moon, Sun } from 'lucide-react'
import './App.css'

// Hooks customizados
import { useTransactions } from './hooks/useTransactions'
import { useFinancialStats, useAdvancedStats } from './hooks/useFinancialStats'
import { useChartData } from './hooks/useChartData'
import { useFilters } from './hooks/useFilters'
import { useMonthlyData, useMultiMonthData } from './hooks/useMonthlyData'

// Componentes Lazy Loading para performance
const DashboardCards = lazy(() => import('./components/Dashboard/DashboardCards'))
const TransactionForm = lazy(() => import('./components/TransactionForm/TransactionForm'))
const TransactionList = lazy(() => import('./components/TransactionList/TransactionList'))
const ChartsSection = lazy(() => import('./components/Charts/ChartsSection'))
const StatisticsSection = lazy(() => import('./components/Statistics/StatisticsSection'))
const MonthlyAnalysis = lazy(() => import('./components/Monthly/MonthlyAnalysis'))
const MonthlyHistoryChart = lazy(() => import('./components/Monthly/MonthlyHistoryChart'))

// Utils
import { formatCurrency } from './utils/financial'

// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

function AppSidebar({ activeTab, setActiveTab }) {
  const { theme, setTheme } = useTheme()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'add-transaction', label: 'Nova Transação', icon: Plus },
    { id: 'transactions', label: 'Transações', icon: List },
    { id: 'analytics', label: 'Análises', icon: BarChart3 },
    { id: 'monthly', label: 'Consulta Mensal', icon: Calendar },
  ]

  return (
    <Sidebar collapsible="icon" className="surface shadow-md min-h-screen">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--color-accent) text-(--color-accent-contrast) shadow">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="grid flex-1 text-left text-base leading-tight">
            <span className="truncate font-semibold">Dashboard</span>
            <span className="truncate text-xs muted">Financeiro v3.0</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <nav className="grid gap-2 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 rounded-md transition hover:bg-accent/10 ${activeTab === item.id ? 'font-semibold' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            )
          })}
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-6">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 rounded-md"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions()
  const stats = useFinancialStats(transactions)
  const advancedStats = useAdvancedStats(transactions)
  const chartData = useChartData(transactions)
  const { filteredTransactions, filters, setFilters, resetFilters } = useFilters(transactions)
  
  // Hooks para análise mensal
  const monthlyData = useMonthlyData(transactions)
  const multiMonthData = useMultiMonthData(transactions, 12)
  
  // Função para adicionar transação simples
  const handleAddTransaction = async (transactionData) => {
    return await addTransaction(transactionData)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-bg)">
        <div className="text-center space-y-4 surface p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--color-accent) mx-auto"></div>
          <p className="muted">Carregando seus dados financeiros...</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 container">
            <div className="surface p-6 flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
              <p className="muted">
                Visão geral das suas finanças pessoais
              </p>
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardCards stats={stats} formatCurrency={formatCurrency} />
            </Suspense>
            {transactions.length > 0 && (
              <div className="grid gap-6">
                <Suspense fallback={<LoadingSpinner />}>
                  <ChartsSection chartData={chartData} formatCurrency={formatCurrency} />
                </Suspense>
              </div>
            )}
          </div>
        )
      case 'add-transaction':
        return (
          <div className="space-y-6 container">
            <div className="surface p-6 flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Nova Transação</h1>
              <p className="muted">
                Adicione uma nova receita ou despesa
              </p>
            </div>
            <div className="elevated p-6">
              <Suspense fallback={<LoadingSpinner />}>
                <TransactionForm onAddTransaction={handleAddTransaction} />
              </Suspense>
            </div>
          </div>
        )
      case 'transactions':
        return (
          <div className="space-y-6 container">
            <div className="surface p-6 flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
              <p className="muted">
                Lista de todas as suas transações
              </p>
            </div>
            <div className="elevated p-6">
              <Suspense fallback={<LoadingSpinner />}>
                <TransactionList
                  transactions={transactions}
                  filteredTransactions={filteredTransactions}
                  filters={filters}
                  setFilters={setFilters}
                  resetFilters={resetFilters}
                  onUpdateTransaction={updateTransaction}
                  onDeleteTransaction={deleteTransaction}
                  formatCurrency={formatCurrency}
                />
              </Suspense>
            </div>
          </div>
        )
      case 'analytics':
        return (
          <div className="space-y-6 container">
            <div className="surface p-6 flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Análises</h1>
              <p className="muted">
                Estatísticas e gráficos avançados
              </p>
            </div>
            <div className="elevated p-6">
              <Suspense fallback={<LoadingSpinner />}>
                <StatisticsSection
                  transactions={transactions}
                  stats={stats}
                  advancedStats={advancedStats}
                  chartData={chartData}
                  formatCurrency={formatCurrency}
                />
              </Suspense>
            </div>
          </div>
        )
      case 'monthly':
        return (
          <div className="space-y-6 container">
            <div className="surface p-6 flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Consulta Mensal</h1>
              <p className="muted">
                Histórico mensal das suas finanças
              </p>
            </div>
            <div className="elevated p-6 mb-4">
              <Suspense fallback={<LoadingSpinner />}>
                <MonthlyAnalysis
                  {...monthlyData}
                  formatCurrency={formatCurrency}
                />
              </Suspense>
            </div>
            <div className="elevated p-6">
              <Suspense fallback={<LoadingSpinner />}>
                <MonthlyHistoryChart
                  multiMonthData={multiMonthData}
                  formatCurrency={formatCurrency}
                />
              </Suspense>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-(--color-bg)">
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-(--color-surface)">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Dashboard Financeiro</span>
              <span className="muted">v3.0</span>
            </div>
          </header>
          <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-8">
            <div className="w-full max-w-5xl">
              {renderContent()}
            </div>
          </main>
        </SidebarInset>
      </div>
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  )
}

export default App
