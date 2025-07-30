import { useCallback } from 'react'
import Papa from 'papaparse'

export function useDataExport() {
  // Função para exportar dados para CSV
  const exportToCsv = useCallback((transactions) => {
    if (!transactions || transactions.length === 0) {
      throw new Error("Nenhuma transação para exportar.")
    }

    // Cabeçalho correto
    const headers = "id,type,amount,category,description,date,createdAt,recurrence,recurrenceFrequency,installments"
    
    const csvContent = transactions.map(t => {
      return `${t.id},${t.type},${t.amount},"${t.category}","${t.description}",${t.date},${t.createdAt},${t.recurrence || ''},${t.recurrenceFrequency || ''},${t.installments || ''}`
    }).join('\n')

    const fullContent = headers + '\n' + csvContent
    
    const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [])

  // Função para exportar dados para TXT
  const exportToTxt = useCallback((transactions) => {
    if (!transactions || transactions.length === 0) {
      throw new Error("Nenhuma transação para exportar.")
    }

    const headers = "id,type,amount,category,description,date,createdAt"
    
    const txtContent = transactions.map(t => {
      return `${t.id},${t.type},${t.amount},"${t.category}","${t.description}",${t.date},${t.createdAt}`
    }).join('\n')

    const fullContent = headers + '\n' + txtContent
    
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.txt`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [])

  return {
    exportToCsv,
    exportToTxt
  }
}

export function useDataImport() {
  const importFromCsv = useCallback(async (file, transactions, onTransactionsUpdate, salvarDado, listarDados) => {
    if (!file) {
      throw new Error('Nenhum arquivo selecionado.')
    }

    try {
      const results = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: resolve,
          error: reject
        })
      })

      if (!results.data || results.data.length === 0) {
        throw new Error('Nenhum dado encontrado no arquivo CSV.')
      }
      
      const existingIds = new Set(transactions.map(t => t.id))
      
      const newTransactions = results.data.filter(t => {
        return t.id && !existingIds.has(t.id)
      })

      if (newTransactions.length > 0) {
        const parsedTransactions = newTransactions.map(t => ({
          ...t,
          amount: parseFloat(t.amount) || 0
        }))
        
        for (const t of parsedTransactions) {
          await salvarDado(t)
        }
        
        const updatedTransactions = await listarDados()
        onTransactionsUpdate(updatedTransactions)
        return `${newTransactions.length} novas transações importadas!`
      } else {
        throw new Error("Nenhuma transação nova encontrada no arquivo.")
      }
    } catch (error) {
      console.error('Erro ao importar CSV:', error)
      throw new Error('Erro ao processar o arquivo CSV. Verifique o formato.')
    }
  }, [])

  return {
    importFromCsv
  }
}
