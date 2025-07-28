import { useMemo, useCallback } from 'react'
import Papa from 'papaparse'

export function useDataExport(transactions) {
  // Função para exportar dados para CSV
  const exportToCSV = useCallback(() => {
    if (transactions.length === 0) {
      alert("Nenhuma transação para exportar.")
      return
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
  }, [transactions])

  // Função para exportar dados para TXT
  const exportToTXT = useCallback(() => {
    if (transactions.length === 0) {
      alert("Nenhuma transação para exportar.")
      return
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
  }, [transactions])

  return {
    exportToCSV,
    exportToTXT
  }
}

export function useDataImport(transactions, onTransactionsUpdate) {
  const importFromCSV = useCallback(async (file, salvarDado, listarDados) => {
    if (!file) {
      alert('Nenhum arquivo selecionado.')
      return
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
        alert('Nenhum dado encontrado no arquivo CSV.')
        return
      }
      
      console.log('Transações existentes:', transactions)
      
      const existingIds = new Set(transactions.map(t => t.id))
      console.log('IDs existentes:', Array.from(existingIds))
      
      const newTransactions = results.data.filter(t => {
        console.log('Verificando transação:', t)
        return t.id && !existingIds.has(t.id)
      })
      
      console.log('Transações novas encontradas:', newTransactions)

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
        alert(`${newTransactions.length} novas transações importadas!`)
      } else {
        alert("Nenhuma transação nova encontrada no arquivo.")
      }
    } catch (error) {
      console.error('Erro ao importar CSV:', error)
      alert('Erro ao processar o arquivo CSV. Verifique o formato.')
    }
  }, [transactions, onTransactionsUpdate])

  return {
    importFromCSV
  }
}
