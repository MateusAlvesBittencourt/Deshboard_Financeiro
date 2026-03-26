import { useState, useMemo } from 'react'

const INITIAL_FILTERS = {
  type: 'all',
  category: 'all',
  startDate: '',
  endDate: '',
  searchTerm: ''
}

export function useFilters(transactions) {
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (filters.type !== 'all' && transaction.type !== filters.type) return false
      if (filters.category !== 'all' && transaction.category !== filters.category) return false
      if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) return false
      if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) return false

      if (filters.searchTerm) {
        const searchValue = filters.searchTerm.toLowerCase()
        const normalizedAmount = transaction.amount.toString().replace('.', ',')
        const matchesSearch =
          transaction.description.toLowerCase().includes(searchValue) ||
          transaction.category.toLowerCase().includes(searchValue) ||
          normalizedAmount.includes(searchValue)

        if (!matchesSearch) return false
      }

      return true
    })
  }, [transactions, filters])

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS)
  }

  return {
    filteredTransactions,
    filters,
    setFilters,
    resetFilters
  }
}
