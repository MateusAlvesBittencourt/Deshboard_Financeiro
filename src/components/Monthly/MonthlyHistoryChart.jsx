import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

function MonthlyHistoryChart({ multiMonthData, formatCurrency }) {
  if (!multiMonthData || multiMonthData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico Mensal</CardTitle>
          <CardDescription>Evolução das finanças nos últimos meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado disponível para exibir o histórico
          </div>
        </CardContent>
      </Card>
    )
  }

  // Preparar dados para o gráfico (ordem cronológica)
  const chartData = [...multiMonthData]
    .reverse() // Reverter para ordem cronológica (mais antigo primeiro)
    .map(month => ({
      ...month,
      receitas: month.income,
      despesas: month.expenses,
      saldo: month.balance
    }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Receitas vs Despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico Mensal - Receitas vs Despesas</CardTitle>
          <CardDescription>
            Comparação de receitas e despesas nos últimos {multiMonthData.length} meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="receitas" 
                  fill="#22c55e" 
                  name="Receitas"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="despesas" 
                  fill="#ef4444" 
                  name="Despesas"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Evolução do Saldo */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Saldo Mensal</CardTitle>
          <CardDescription>
            Tendência do saldo (receitas - despesas) ao longo dos meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p style={{ color: value >= 0 ? '#22c55e' : '#ef4444' }}>
                            Saldo: {formatCurrency(value)}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabela Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Mensal</CardTitle>
          <CardDescription>
            Dados detalhados dos últimos meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Mês</th>
                  <th className="text-right p-2 font-medium">Receitas</th>
                  <th className="text-right p-2 font-medium">Despesas</th>
                  <th className="text-right p-2 font-medium">Saldo</th>
                  <th className="text-center p-2 font-medium">Transações</th>
                  <th className="text-right p-2 font-medium">Taxa Poupança</th>
                </tr>
              </thead>
              <tbody>
                {multiMonthData.map((month) => {
                  const savingsRate = month.income > 0 ? 
                    ((month.balance / month.income) * 100) : 0
                  
                  return (
                    <tr key={month.month} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{month.label}</td>
                      <td className="p-2 text-right text-green-600">
                        {formatCurrency(month.income)}
                      </td>
                      <td className="p-2 text-right text-red-600">
                        {formatCurrency(month.expenses)}
                      </td>
                      <td className={`p-2 text-right font-medium ${
                        month.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(month.balance)}
                      </td>
                      <td className="p-2 text-center">
                        {month.totalTransactions}
                      </td>
                      <td className={`p-2 text-right ${
                        savingsRate >= 10 ? 'text-green-600' : 
                        savingsRate >= 5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {savingsRate.toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Média Mensal Receitas</div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(
                multiMonthData.reduce((sum, m) => sum + m.income, 0) / multiMonthData.length
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Média Mensal Despesas</div>
            <div className="text-xl font-bold text-red-600">
              {formatCurrency(
                multiMonthData.reduce((sum, m) => sum + m.expenses, 0) / multiMonthData.length
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Melhor Mês</div>
            <div className="text-xl font-bold text-green-600">
              {(() => {
                const bestMonth = multiMonthData.reduce((best, current) => 
                  current.balance > best.balance ? current : best
                )
                return formatCurrency(bestMonth.balance)
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Transações</div>
            <div className="text-xl font-bold">
              {multiMonthData.reduce((sum, m) => sum + m.totalTransactions, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MonthlyHistoryChart
