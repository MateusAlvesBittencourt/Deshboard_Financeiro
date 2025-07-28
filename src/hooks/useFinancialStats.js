import { useMemo } from 'react'

export function useFinancialStats(transactions) {
  const stats = useMemo(() => {
    if (!transactions.length) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        currentBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        monthlySavings: 0
      }
    }

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
    })

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const currentBalance = totalIncome - totalExpenses

    const monthlyIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const monthlyExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const monthlySavings = monthlyIncome - monthlyExpenses

    return {
      totalIncome,
      totalExpenses,
      currentBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings
    }
  }, [transactions])

  return stats
}

export function useAdvancedStats(transactions) {
  const advancedStats = useMemo(() => {
    if (!transactions.length) return {}

    // Média semanal de gastos
    const weeklyExpenses = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const date = new Date(t.date)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const weekKey = weekStart.toISOString().split('T')[0]
      weeklyExpenses[weekKey] = (weeklyExpenses[weekKey] || 0) + t.amount
    })
    
    const avgWeeklyExpenses = Object.values(weeklyExpenses).reduce((sum, val) => sum + val, 0) / Object.keys(weeklyExpenses).length || 0

    // Projeção de saldo para próximos 3 meses
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const currentBalance = totalIncome - totalExpenses

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
    })

    const monthlyIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const monthlyExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

    const avgMonthlyIncome = monthlyIncome || (totalIncome / Math.max(1, new Set(transactions.filter(t => t.type === 'income').map(t => new Date(t.date).getMonth())).size))
    const avgMonthlyExpenses = monthlyExpenses || (totalExpenses / Math.max(1, new Set(transactions.filter(t => t.type === 'expense').map(t => new Date(t.date).getMonth())).size))
    
    const projectedSaldo = []
    let currentProjectedBalance = currentBalance
    
    for (let i = 1; i <= 3; i++) {
      currentProjectedBalance += (avgMonthlyIncome - avgMonthlyExpenses)
      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + i)
      projectedSaldo.push({
        month: futureDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        saldo: currentProjectedBalance
      })
    }

    // Categoria com maior gasto
    const expensesByCategory = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount
    })
    
    const topExpenseCategory = Object.entries(expensesByCategory).reduce((max, [category, amount]) => 
      amount > max.amount ? { category, amount } : max, { category: '', amount: 0 })

    // Limite de gastos (exemplo: 80% da receita mensal)
    const spendingLimit = avgMonthlyIncome * 0.8
    const isOverSpendingLimit = monthlyExpenses > spendingLimit

    return {
      avgWeeklyExpenses,
      projectedSaldo,
      topExpenseCategory,
      spendingLimit,
      isOverSpendingLimit,
      avgMonthlyIncome,
      avgMonthlyExpenses
    }
  }, [transactions])

  return advancedStats
}
