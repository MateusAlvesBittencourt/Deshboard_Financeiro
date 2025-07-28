import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react'

export function DashboardCards({ stats, formatCurrency }) {
  const { currentBalance, monthlyIncome, monthlyExpenses, monthlySavings } = stats

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Saldo Atual</CardTitle>
          <Wallet className="h-4 w-4 text-gray-400 dark:text-gray-300" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(currentBalance)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Receitas do Mês</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(monthlyIncome)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Despesas do Mês</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(monthlyExpenses)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Economia do Mês</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-300" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${monthlySavings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(monthlySavings)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
