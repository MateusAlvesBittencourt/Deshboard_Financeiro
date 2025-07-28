import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { TrendingDown, TrendingUp } from 'lucide-react'

export function StatisticsSection({ transactions, stats, advancedStats, chartData, formatCurrency }) {
  const { currentBalance, monthlySavings, monthlyExpenses } = stats
  const { barData } = chartData

  if (transactions.length === 0) {
    return null
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader>
        <CardTitle>Estatísticas Resumidas</CardTitle>
        <CardDescription>
          Informações importantes sobre suas finanças
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total de Transações</p>
            <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Média de Receitas Mensais</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(barData.length > 0 ? barData.reduce((sum, item) => sum + item.receitas, 0) / barData.length : 0)}
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Média de Despesas Mensais</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(barData.length > 0 ? barData.reduce((sum, item) => sum + item.despesas, 0) / barData.length : 0)}
            </p>
          </div>
        </div>

        {/* Estatísticas Avançadas */}
        {advancedStats.avgWeeklyExpenses && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Análises Avançadas</h3>
            
            {/* Alerta de Limite de Gastos */}
            {advancedStats.isOverSpendingLimit && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <p className="font-semibold text-red-800">Atenção: Limite de Gastos Excedido!</p>
                </div>
                <p className="text-red-700 mt-1">
                  Você gastou {formatCurrency(monthlyExpenses)} este mês, ultrapassando o limite recomendado de {formatCurrency(advancedStats.spendingLimit)}.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Média Semanal */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Média de Gastos Semanais</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(advancedStats.avgWeeklyExpenses)}
                </p>
              </div>

              {/* Categoria com Maior Gasto */}
              {advancedStats.topExpenseCategory.category && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Categoria com Maior Gasto</p>
                  <p className="text-lg font-bold text-orange-600">
                    {advancedStats.topExpenseCategory.category}
                  </p>
                  <p className="text-sm text-orange-500">
                    {formatCurrency(advancedStats.topExpenseCategory.amount)}
                  </p>
                </div>
              )}
            </div>

            {/* Projeções de Saldo */}
            {advancedStats.projectedSaldo.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold mb-3">Projeção de Saldo (Próximos 3 Meses)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {advancedStats.projectedSaldo.map((projection, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600">{projection.month}</p>
                      <p className={`text-lg font-bold ${projection.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(projection.saldo)}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Projeção baseada na média de receitas e despesas mensais
                </p>
              </div>
            )}

            {/* Dicas Financeiras */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-md font-semibold text-blue-800 mb-2">💡 Dicas Financeiras</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {currentBalance < 0 && (
                  <li>• Seu saldo está negativo. Considere reduzir gastos ou aumentar receitas.</li>
                )}
                {advancedStats.isOverSpendingLimit && (
                  <li>• Você excedeu o limite recomendado de gastos. Revise suas despesas na categoria "{advancedStats.topExpenseCategory.category}".</li>
                )}
                {monthlySavings > 0 && (
                  <li>• Parabéns! Você economizou {formatCurrency(monthlySavings)} este mês.</li>
                )}
                <li>• Mantenha um controle regular de suas finanças para atingir seus objetivos.</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
