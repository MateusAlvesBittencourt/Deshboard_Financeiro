import { useMemo } from 'react'

export function useChartData(transactions) {
  const chartData = useMemo(() => {
    if (!transactions.length) {
      return { pieData: [], barData: [], lineData: [] }
    }

    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

    // Dados para gráfico de pizza (gastos por categoria)
    const expensesByCategory = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount
    })
    
    const pieData = Object.entries(expensesByCategory).map(([category, amount]) => ({
      name: category,
      value: amount,
      percentage: ((amount / totalExpenses) * 100).toFixed(1)
    }))

    // Dados para gráfico de barras (receitas vs despesas por mês)
    const monthlyData = {}
    transactions.forEach(t => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthName, receitas: 0, despesas: 0 }
      }
      
      if (t.type === 'income') {
        monthlyData[monthKey].receitas += t.amount
      } else {
        monthlyData[monthKey].despesas += t.amount
      }
    })
    
    const barData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))

    // Dados para gráfico de linha (evolução do saldo)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date))
    let runningBalance = 0
    const lineData = sortedTransactions.map(t => {
      runningBalance += t.type === 'income' ? t.amount : -t.amount
      return {
        date: new Date(t.date).toLocaleDateString('pt-BR'),
        saldo: runningBalance,
        description: t.description
      }
    })

    return { pieData, barData, lineData }
  }, [transactions])

  return chartData
}
