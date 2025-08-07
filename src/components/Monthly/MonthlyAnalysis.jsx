import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { TrendingUp, TrendingDown, Calendar, ArrowUpIcon, ArrowDownIcon, Equal } from 'lucide-react'

function MonthlyAnalysis({ 
  selectedMonth, 
  setSelectedMonth, 
  availableMonths, 
  monthlyStats, 
  previousMonthComparison,
  formatCurrency 
}) {
  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowUpIcon className="h-3 w-3 text-green-600" />
    if (change < 0) return <ArrowDownIcon className="h-3 w-3 text-red-600" />
    return <Equal className="h-3 w-3 text-gray-500" />
  }

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  const getChangeText = (change, isIncome = false) => {
    const sign = change > 0 ? '+' : ''
    const direction = isIncome ? 
      (change > 0 ? 'aumento' : 'redução') : 
      (change > 0 ? 'aumento' : 'redução')
    return `${sign}${formatCurrency(Math.abs(change))} (${direction})`
  }

  return (
    <div className="space-y-6">
      {/* Seletor de Mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Análise Mensal
          </CardTitle>
          <CardDescription>
            Selecione um mês para visualizar dados detalhados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Mês:</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecione um mês" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo Mensal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receitas do Mês */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyStats.totalIncome)}
            </div>
            {previousMonthComparison && (
              <div className="flex items-center text-xs mt-2">
                {getChangeIcon(previousMonthComparison.incomeChange)}
                <span className={`ml-1 ${getChangeColor(previousMonthComparison.incomeChange)}`}>
                  {getChangeText(previousMonthComparison.incomeChange, true)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Despesas do Mês */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(monthlyStats.totalExpenses)}
            </div>
            {previousMonthComparison && (
              <div className="flex items-center text-xs mt-2">
                {getChangeIcon(previousMonthComparison.expenseChange)}
                <span className={`ml-1 ${getChangeColor(previousMonthComparison.expenseChange)}`}>
                  {getChangeText(previousMonthComparison.expenseChange)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saldo do Mês */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Badge variant={monthlyStats.balance >= 0 ? "default" : "destructive"}>
              {monthlyStats.balance >= 0 ? "Positivo" : "Negativo"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthlyStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(monthlyStats.balance)}
            </div>
            {previousMonthComparison && (
              <div className="flex items-center text-xs mt-2">
                {getChangeIcon(previousMonthComparison.balanceChange)}
                <span className={`ml-1 ${getChangeColor(previousMonthComparison.balanceChange)}`}>
                  {getChangeText(previousMonthComparison.balanceChange)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transações */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <span className="text-sm text-muted-foreground">Total</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.totalTransactions}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Média: {formatCurrency(monthlyStats.averageTransactionValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categorias de Gastos */}
      {monthlyStats.topExpenseCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Principais Categorias de Gastos</CardTitle>
            <CardDescription>
              Categorias com maiores despesas no mês selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyStats.topExpenseCategories.map((category, index) => {
                const percentage = monthlyStats.totalExpenses > 0 ? 
                  (category.amount / monthlyStats.totalExpenses) * 100 : 0
                
                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        #{index + 1} {category.category}
                      </span>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(category.amount)}</div>
                        <div className="text-xs text-muted-foreground">
                          {category.count} transações
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Progress value={percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground text-right">
                        {percentage.toFixed(1)}% do total de gastos
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparação com Mês Anterior */}
      {previousMonthComparison && (
        <Card>
          <CardHeader>
            <CardTitle>Comparação com Mês Anterior</CardTitle>
            <CardDescription>
              Variação em relação a {previousMonthComparison.previousMonth}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Receitas</div>
                <div className={`text-lg font-bold ${getChangeColor(previousMonthComparison.incomeChange)}`}>
                  {previousMonthComparison.incomePercentChange > 0 ? '+' : ''}
                  {previousMonthComparison.incomePercentChange.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  {getChangeText(previousMonthComparison.incomeChange)}
                </div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Despesas</div>
                <div className={`text-lg font-bold ${getChangeColor(previousMonthComparison.expenseChange)}`}>
                  {previousMonthComparison.expensePercentChange > 0 ? '+' : ''}
                  {previousMonthComparison.expensePercentChange.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  {getChangeText(previousMonthComparison.expenseChange)}
                </div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Saldo</div>
                <div className={`text-lg font-bold ${getChangeColor(previousMonthComparison.balanceChange)}`}>
                  {getChangeText(previousMonthComparison.balanceChange)}
                </div>
                <div className="text-xs text-gray-500">
                  Variação no resultado
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MonthlyAnalysis
