import { useState, useRef, Suspense, lazy } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { useTheme } from "next-themes"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Toaster } from '@/components/ui/sonner.jsx'
import { Home, Plus, List, BarChart3, CreditCard, Settings, Moon, Sun, Menu } from 'lucide-react'
import './App.css'

// Hooks customizados
import { useTransactions } from './hooks/useTransactions'
import { useFinancialStats, useAdvancedStats } from './hooks/useFinancialStats'
import { useChartData } from './hooks/useChartData'
import { useFilters } from './hooks/useFilters'
import { useInstallmentManager } from './hooks/useInstallmentManager'

// Componentes Lazy Loading para performance
const DashboardCards = lazy(() => import('./components/Dashboard/DashboardCards'))
const TransactionForm = lazy(() => import('./components/TransactionForm/TransactionForm'))
const TransactionList = lazy(() => import('./components/TransactionList/TransactionList'))
const ChartsSection = lazy(() => import('./components/Charts/ChartsSection'))
const StatisticsSection = lazy(() => import('./components/Statistics/StatisticsSection'))

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
    { id: 'installments', label: 'Parcelas', icon: CreditCard },
    { id: 'analytics', label: 'Análises', icon: BarChart3 },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Dashboard</span>
            <span className="truncate text-xs text-muted-foreground">Financeiro v3.0</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <nav className="grid gap-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </nav>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-2 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
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
  const { createInstallmentGroup, forceProcessInstallments, installmentGroups } = useInstallmentManager()
  
  const importInputRef = useRef(null)

  // Função para adicionar transação com suporte a parcelas
  const handleAddTransaction = async (transactionData) => {
    if (transactionData.recurrence === 'parcelada') {
      // Criar grupo de parcelas
      return await createInstallmentGroup(transactionData)
    } else {
      // Transação normal
      return await addTransaction(transactionData)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando seus dados financeiros...</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
              <p className="text-muted-foreground">
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
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Nova Transação</h1>
              <p className="text-muted-foreground">
                Adicione uma nova receita ou despesa
              </p>
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <TransactionForm onAddTransaction={handleAddTransaction} />
            </Suspense>
          </div>
        )
      case 'transactions':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
              <p className="text-muted-foreground">
                Gerencie todas as suas transações
              </p>
            </div>
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
                importInputRef={importInputRef}
              />
            </Suspense>
          </div>
        )
      case 'installments':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestão de Parcelas</h1>
              <p className="text-muted-foreground">
                Acompanhe suas transações parceladas e processamento automático
              </p>
            </div>
            
            {/* Painel de controle de parcelas */}
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Controle Automático</CardTitle>
                  <CardDescription>
                    O sistema processa as parcelas automaticamente todo dia 15 do mês
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Processamento manual (para testes)</span>
                    <Button onClick={forceProcessInstallments} variant="outline">
                      Processar Agora
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de grupos de parcelas */}
              <Card>
                <CardHeader>
                  <CardTitle>Grupos de Parcelas Ativos</CardTitle>
                  <CardDescription>
                    {installmentGroups.filter(g => g.status === 'active').length} grupos ativos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {installmentGroups.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum grupo de parcelas encontrado.
                      <br />
                      Crie uma transação parcelada para começar.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {installmentGroups.map(group => (
                        <div key={group.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{group.originalTransaction.description}</h3>
                            <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
                              {group.status === 'active' ? 'Ativo' : 'Concluído'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Valor Total:</span>
                              <p className="font-medium">{formatCurrency(group.originalTransaction.amount)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Parcelas:</span>
                              <p className="font-medium">{group.paidInstallments}/{group.totalInstallments}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Valor por Parcela:</span>
                              <p className="font-medium">{formatCurrency(group.originalTransaction.amount / group.totalInstallments)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Início:</span>
                              <p className="font-medium">{new Date(group.startDate).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          
                          {group.status === 'active' && (
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all" 
                                  style={{ width: `${(group.paidInstallments / group.totalInstallments) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Análises</h1>
              <p className="text-muted-foreground">
                Insights detalhados sobre suas finanças
              </p>
            </div>
            <div className="space-y-6">
              <Suspense fallback={<LoadingSpinner />}>
                <ChartsSection chartData={chartData} formatCurrency={formatCurrency} />
              </Suspense>
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
      default:
        return null
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Dashboard Financeiro</span>
              <span className="text-muted-foreground">v3.0</span>
            </div>
          </header>
          <main className="flex-1 space-y-4 p-6">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  )
}

export default App
