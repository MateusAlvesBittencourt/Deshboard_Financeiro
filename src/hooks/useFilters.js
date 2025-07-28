import { useState, useMemo } from 'react'

export function useFilters(transactions) {
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [filterDescription, setFilterDescription] = useState('')

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Tipo
      if (filterType !== 'all' && t.type !== filterType) return false
      // Categoria
      if (filterCategory !== 'all' && t.category !== filterCategory) return false
      // Período
      if (filterStartDate && new Date(t.date) < new Date(filterStartDate)) return false
      if (filterEndDate && new Date(t.date) > new Date(filterEndDate)) return false
      // Descrição
      if (filterDescription && !t.description.toLowerCase().includes(filterDescription.toLowerCase())) return false
      return true
    })
  }, [transactions, filterType, filterCategory, filterStartDate, filterEndDate, filterDescription])

  const resetFilters = () => {
    setFilterType('all')
    setFilterCategory('all')
    setFilterStartDate('')
    setFilterEndDate('')
    setFilterDescription('')
  }

  return {
    filteredTransactions,
    filters: {
      filterType,
      filterCategory,
      filterStartDate,
      filterEndDate,
      filterDescription
    },
    setFilters: {
      setFilterType,
      setFilterCategory,
      setFilterStartDate,
      setFilterEndDate,
      setFilterDescription
    },
    resetFilters
  }
}
