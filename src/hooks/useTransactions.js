import { useState, useEffect, useCallback } from 'react'
import { salvarDado, listarDados, atualizarDado, deletarDado } from '../lib/db'

export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  // Carregar dados do IndexedDB
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const savedTransactions = await listarDados()
      setTransactions(savedTransactions || [])
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Adicionar nova transação
  const addTransaction = useCallback(async (transactionData) => {
    try {
      // A transactionData já vem pronta do formulário
      await salvarDado(transactionData)
      await fetchTransactions() // Recarrega a lista para mostrar a nova transação
      return { success: true }
    } catch (error) {
      console.error('Erro ao adicionar transação:', error)
      return { success: false, error: error.message }
    }
  }, [fetchTransactions])

  // Atualizar transação
  const updateTransaction = useCallback(async (transactionData) => {
    try {
      await atualizarDado(transactionData)
      await fetchTransactions()
      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar transação:', error)
      return { success: false, error: error.message }
    }
  }, [fetchTransactions])

  // Deletar transação
  const deleteTransaction = useCallback(async (id) => {
    try {
      await deletarDado(id)
      await fetchTransactions()
      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar transação:', error)
      return { success: false, error: error.message }
    }
  }, [fetchTransactions])

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions
  }
}
