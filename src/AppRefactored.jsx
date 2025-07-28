import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Switch } from "@/components/ui/switch.jsx"
import { useTheme } from "next-themes"
import './App.css'

// Hooks customizados
import { useTransactions } from './hooks/useTransactions'
import { useFinancialStats, useAdvancedStats } from './hooks/useFinancialStats'
import { useChartData } from './hooks/useChartData'
import { useFilters } from './hooks/useFilters'

// Componentes
import { DashboardCards } from './components/Dashboard/DashboardCards'
import { TransactionForm } from './components/TransactionForm/TransactionForm'
import { ChartsSection } from './components/Charts/ChartsSection'

// Utils
import { formatCurrency } from './utils/financial'

// Componentes refatorados
import { TransactionList } from './components/TransactionList/TransactionList'
import { StatisticsSection } from './components/Statistics/StatisticsSection'

function App() {
  const { theme, setTheme } = useTheme()
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions()
  const stats = useFinancialStats(transactions)
  const advancedStats = useAdvancedStats(transactions)
  const chartData = useChartData(transactions)
  const { filteredTransactions, filters, setFilters, resetFilters } = useFilters(transactions)
  
  const importInputRef = useRef(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando seus dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-1 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-2 sm:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">Dashboard Financeiro</h1>
            <p className="text-gray-400 dark:text-gray-300 text-xs sm:text-base">Controle suas finanças de forma inteligente</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Tema escuro</span>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </div>

        {/* Cards de Resumo */}
        <DashboardCards stats={stats} formatCurrency={formatCurrency} />

        {/* Conteúdo Principal */}
        <Tabs defaultValue="add-transaction" className="space-y-1 sm:space-y-4">
          <TabsList className="grid w-full grid-cols-1 xs:grid-cols-2 md:grid-cols-3 text-xs sm:text-base">
            <TabsTrigger value="add-transaction">Adicionar Transação</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
          </TabsList>

          {/* Aba Adicionar Transação */}
          <TabsContent value="add-transaction">
            <TransactionForm onAddTransaction={addTransaction} />
          </TabsContent>

          {/* Aba Transações */}
          <TabsContent value="transactions">
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
          </TabsContent>

          {/* Aba Análises */}
          <TabsContent value="analytics">
            <div className="space-y-2 sm:space-y-6">
              <ChartsSection chartData={chartData} formatCurrency={formatCurrency} />
              <StatisticsSection 
                transactions={transactions}
                stats={stats}
                advancedStats={advancedStats}
                chartData={chartData}
                formatCurrency={formatCurrency}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
