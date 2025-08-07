import { useState, useMemo } from 'react'

export function useMonthlyData(transactions) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  // Obter lista de meses disponíveis
  const availableMonths = useMemo(() => {
    if (!transactions.length) return []

    const monthsSet = new Set()
    transactions.forEach(t => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthsSet.add(monthKey)
    })

    return Array.from(monthsSet)
      .sort((a, b) => b.localeCompare(a)) // Ordem decrescente (mais recente primeiro)
      .map(monthKey => {
        const [year, month] = monthKey.split('-')
        const date = new Date(year, month - 1)
        return {
          value: monthKey,
          label: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          shortLabel: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        }
      })
  }, [transactions])

  // Filtrar transações do mês selecionado
  const monthlyTransactions = useMemo(() => {
    if (!selectedMonth) return transactions

    const [year, month] = selectedMonth.split('-').map(Number)
    
    return transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getFullYear() === year && 
             transactionDate.getMonth() === month - 1
    })
  }, [transactions, selectedMonth])

  // Calcular estatísticas do mês selecionado
  const monthlyStats = useMemo(() => {
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = income - expenses

    // Estatísticas por categoria
    const categoriesStats = {}
    monthlyTransactions.forEach(t => {
      if (!categoriesStats[t.category]) {
        categoriesStats[t.category] = {
          income: 0,
          expense: 0,
          count: 0
        }
      }
      categoriesStats[t.category][t.type] += t.amount
      categoriesStats[t.category].count += 1
    })

    // Top categorias de gastos
    const topExpenseCategories = Object.entries(categoriesStats)
      .filter(([, stats]) => stats.expense > 0)
      .sort(([, a], [, b]) => b.expense - a.expense)
      .slice(0, 5)
      .map(([category, stats]) => ({
        category,
        amount: stats.expense,
        count: stats.count
      }))

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance,
      totalTransactions: monthlyTransactions.length,
      categoriesStats,
      topExpenseCategories,
      averageTransactionValue: monthlyTransactions.length > 0 ? 
        (income + expenses) / monthlyTransactions.length : 0
    }
  }, [monthlyTransactions])

  // Comparação com mês anterior
  const previousMonthComparison = useMemo(() => {
    if (!selectedMonth || availableMonths.length < 2) return null

    const currentIndex = availableMonths.findIndex(m => m.value === selectedMonth)
    if (currentIndex === -1 || currentIndex === availableMonths.length - 1) return null

    const previousMonth = availableMonths[currentIndex + 1].value
    const [prevYear, prevMonth] = previousMonth.split('-').map(Number)
    
    const previousMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getFullYear() === prevYear && 
             transactionDate.getMonth() === prevMonth - 1
    })

    const prevIncome = previousMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const prevExpenses = previousMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const incomeChange = monthlyStats.totalIncome - prevIncome
    const expenseChange = monthlyStats.totalExpenses - prevExpenses
    const balanceChange = monthlyStats.balance - (prevIncome - prevExpenses)

    return {
      previousMonth: availableMonths[currentIndex + 1].label,
      incomeChange,
      expenseChange,
      balanceChange,
      incomePercentChange: prevIncome > 0 ? ((incomeChange / prevIncome) * 100) : 0,
      expensePercentChange: prevExpenses > 0 ? ((expenseChange / prevExpenses) * 100) : 0
    }
  }, [selectedMonth, monthlyStats, availableMonths, transactions])

  return {
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    monthlyTransactions,
    monthlyStats,
    previousMonthComparison
  }
}

// Hook para obter dados de múltiplos meses
export function useMultiMonthData(transactions, monthsCount = 12) {
  const multiMonthData = useMemo(() => {
    if (!transactions.length) return []

    const monthsMap = new Map()
    
    transactions.forEach(t => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, {
          month: monthKey,
          label: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          income: 0,
          expenses: 0,
          transactions: []
        })
      }
      
      const monthData = monthsMap.get(monthKey)
      monthData.transactions.push(t)
      
      if (t.type === 'income') {
        monthData.income += t.amount
      } else {
        monthData.expenses += t.amount
      }
    })

    return Array.from(monthsMap.values())
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, monthsCount)
      .map(monthData => ({
        ...monthData,
        balance: monthData.income - monthData.expenses,
        totalTransactions: monthData.transactions.length
      }))
  }, [transactions, monthsCount])

  return multiMonthData
}
