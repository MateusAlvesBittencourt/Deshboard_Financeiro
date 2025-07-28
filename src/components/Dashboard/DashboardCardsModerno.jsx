import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target,
  AlertTriangle,
  Activity,
  Calendar
} from 'lucide-react'

export function DashboardCards({ stats, formatCurrency }) {
  const { 
    currentBalance, 
    monthlyIncome, 
    monthlyExpenses, 
    monthlySavings,
    totalIncome,
    totalExpenses
  } = stats

  // Calcular percentuais e métricas
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0
  const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0
  const balanceGrowth = totalIncome > 0 ? ((currentBalance / totalIncome) * 100) : 0

  const getSavingsColor = (rate) => {
    if (rate >= 20) return 'text-emerald-600'
    if (rate >= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBalanceVariant = (balance) => {
    if (balance >= 0) return 'default'
    return 'destructive'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Saldo Atual */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          <div className="p-2 bg-primary/10 rounded-full">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(currentBalance)}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={getBalanceVariant(currentBalance)} className="text-xs">
              {currentBalance >= 0 ? 'Positivo' : 'Negativo'}
            </Badge>
            {balanceGrowth !== 0 && (
              <span className="text-xs text-muted-foreground">
                {balanceGrowth.toFixed(1)}% do total
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Receitas do Mês */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
          <div className="p-2 bg-emerald-100 rounded-full">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(monthlyIncome)}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Activity className="h-3 w-3 text-emerald-600" />
            <span className="text-xs text-muted-foreground">
              Este mês
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Despesas do Mês */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
          <div className="p-2 bg-red-100 rounded-full">
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(monthlyExpenses)}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">% da receita</span>
              <span className={expenseRatio > 80 ? 'text-red-600' : 'text-muted-foreground'}>
                {expenseRatio.toFixed(0)}%
              </span>
            </div>
            <Progress value={Math.min(expenseRatio, 100)} className="h-1" />
          </div>
        </CardContent>
      </Card>

      {/* Economia do Mês */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Economia do Mês</CardTitle>
          <div className="p-2 bg-blue-100 rounded-full">
            <Target className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${monthlySavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(monthlySavings)}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Taxa de poupança</span>
              <span className={getSavingsColor(savingsRate)}>
                {savingsRate.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={Math.min(Math.max(savingsRate, 0), 100)} 
              className="h-1"
            />
          </div>
          {savingsRate < 10 && monthlySavings < 0 && (
            <div className="flex items-center space-x-1 mt-2">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span className="text-xs text-amber-600">Meta: 10% mínimo</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Resumo Expandido - ocupando toda a largura */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resumo Financeiro
          </CardTitle>
          <CardDescription>
            Visão consolidada das suas finanças
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Receitas</p>
              <p className="text-lg font-bold text-emerald-600">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Despesas</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Resultado Total</p>
              <p className={`text-lg font-bold ${currentBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(currentBalance)}
              </p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Eficiência</p>
              <p className={`text-lg font-bold ${savingsRate >= 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>
          
          {/* Alertas e Dicas */}
          {(expenseRatio > 90 || savingsRate < 5 || currentBalance < 0) && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Alertas Financeiros</span>
              </div>
              <ul className="text-sm text-amber-700 space-y-1">
                {expenseRatio > 90 && (
                  <li>• Suas despesas representam {expenseRatio.toFixed(0)}% da receita</li>
                )}
                {savingsRate < 5 && (
                  <li>• Taxa de poupança baixa: {savingsRate.toFixed(1)}% (recomendado: 10%+)</li>
                )}
                {currentBalance < 0 && (
                  <li>• Saldo negativo: revise seus gastos urgentemente</li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
