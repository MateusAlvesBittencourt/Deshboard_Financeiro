import { useState, useEffect, useCallback } from 'react'
import { salvarDado, listarDados } from '../lib/db'
import { toast } from 'sonner'

export function useInstallmentManager() {
  const [installmentGroups, setInstallmentGroups] = useState([])
  const [lastProcessedDate, setLastProcessedDate] = useState(null)

  // Carregar grupos de parcelas do IndexedDB
  const loadInstallmentGroups = useCallback(async () => {
    try {
      const data = await listarDados()
      const groups = data.filter(item => item.type === 'installment_group')
      setInstallmentGroups(groups)
      
      // Carregar última data de processamento
      const lastProcessed = localStorage.getItem('lastInstallmentProcessed')
      if (lastProcessed) {
        setLastProcessedDate(new Date(lastProcessed))
      }
    } catch (error) {
      console.error('Erro ao carregar grupos de parcelas:', error)
    }
  }, [])

  // Criar grupo de parcelas
  const createInstallmentGroup = useCallback(async (transactionData) => {
    try {
      const groupId = `installment_${Date.now()}`
      const startDate = new Date(transactionData.date)
      
      // Criar grupo de parcelas
      const installmentGroup = {
        id: groupId,
        type: 'installment_group',
        originalTransaction: transactionData,
        totalInstallments: parseInt(transactionData.installments),
        paidInstallments: 0,
        startDate: transactionData.date,
        status: 'active',
        createdAt: new Date().toISOString()
      }

      await salvarDado(installmentGroup)
      
      // Criar primeira parcela (imediata)
      await createInstallmentTransaction(installmentGroup, 1, startDate)
      
      toast.success('Transação parcelada criada!', {
        description: `${transactionData.installments} parcelas serão processadas automaticamente todo dia 15`
      })

      await loadInstallmentGroups()
      return { success: true, groupId }
    } catch (error) {
      console.error('Erro ao criar grupo de parcelas:', error)
      return { success: false, error: error.message }
    }
  }, [loadInstallmentGroups])

  // Criar transação individual de parcela
  const createInstallmentTransaction = async (group, installmentNumber, date) => {
    const { originalTransaction } = group
    const installmentAmount = originalTransaction.amount / group.totalInstallments
    
    const transaction = {
      id: `${group.id}_installment_${installmentNumber}`,
      type: originalTransaction.type,
      amount: installmentAmount,
      category: originalTransaction.category,
      description: `${originalTransaction.description} (${installmentNumber}/${group.totalInstallments})`,
      date: date.toISOString().split('T')[0],
      installmentGroup: group.id,
      installmentNumber,
      isInstallment: true,
      createdAt: new Date().toISOString()
    }

    await salvarDado(transaction)
    return transaction
  }

  // Processar parcelas automáticas (executar todo dia 15)
  const processInstallments = useCallback(async () => {
    try {
      const today = new Date()
      const currentDay = today.getDate()
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()
      
      // Verificar se é dia 15
      if (currentDay !== 15) {
        return { processed: false, reason: 'Não é dia 15' }
      }

      // Verificar se já foi processado este mês
      if (lastProcessedDate) {
        const lastMonth = lastProcessedDate.getMonth()
        const lastYear = lastProcessedDate.getFullYear()
        
        if (lastMonth === currentMonth && lastYear === currentYear) {
          return { processed: false, reason: 'Já processado este mês' }
        }
      }

      const activeGroups = installmentGroups.filter(group => group.status === 'active')
      let processedCount = 0
      let completedGroups = 0

      for (const group of activeGroups) {
        const nextInstallmentNumber = group.paidInstallments + 1
        
        if (nextInstallmentNumber <= group.totalInstallments) {
          // Calcular data da próxima parcela (sempre dia 15)
          const installmentDate = new Date(currentYear, currentMonth, 15)
          
          // Verificar se não é a primeira parcela (que já foi criada)
          if (nextInstallmentNumber > 1) {
            await createInstallmentTransaction(group, nextInstallmentNumber, installmentDate)
          }
          
          // Atualizar grupo
          const updatedGroup = {
            ...group,
            paidInstallments: nextInstallmentNumber,
            lastProcessedDate: today.toISOString()
          }

          // Se é a última parcela, marcar como completo
          if (nextInstallmentNumber === group.totalInstallments) {
            updatedGroup.status = 'completed'
            updatedGroup.completedAt = today.toISOString()
            completedGroups++
            
            toast.success('Parcelas concluídas!', {
              description: `${group.originalTransaction.description} - Todas as parcelas foram processadas`
            })
          }

          await salvarDado(updatedGroup)
          processedCount++
        }
      }

      // Atualizar data do último processamento
      const processedDate = today.toISOString()
      localStorage.setItem('lastInstallmentProcessed', processedDate)
      setLastProcessedDate(today)

      await loadInstallmentGroups()

      if (processedCount > 0) {
        toast.success('Parcelas processadas!', {
          description: `${processedCount} parcelas criadas. ${completedGroups} grupos finalizados.`
        })
      }

      return { 
        processed: true, 
        processedCount, 
        completedGroups,
        date: processedDate 
      }
    } catch (error) {
      console.error('Erro ao processar parcelas:', error)
      toast.error('Erro ao processar parcelas', {
        description: error.message
      })
      return { processed: false, error: error.message }
    }
  }, [installmentGroups, lastProcessedDate, loadInstallmentGroups])

  // Forçar processamento manual (para testes)
  const forceProcessInstallments = useCallback(async () => {
    // Temporariamente ignorar a verificação de data
    const activeGroups = installmentGroups.filter(group => group.status === 'active')
    let processedCount = 0

    for (const group of activeGroups) {
      const nextInstallmentNumber = group.paidInstallments + 1
      
      if (nextInstallmentNumber <= group.totalInstallments) {
        const today = new Date()
        await createInstallmentTransaction(group, nextInstallmentNumber, today)
        
        const updatedGroup = {
          ...group,
          paidInstallments: nextInstallmentNumber,
          lastProcessedDate: today.toISOString()
        }

        if (nextInstallmentNumber === group.totalInstallments) {
          updatedGroup.status = 'completed'
          updatedGroup.completedAt = today.toISOString()
        }

        await salvarDado(updatedGroup)
        processedCount++
      }
    }

    await loadInstallmentGroups()
    
    toast.success('Processamento manual concluído!', {
      description: `${processedCount} parcelas processadas`
    })

    return { processedCount }
  }, [installmentGroups, loadInstallmentGroups])

  // Verificar automaticamente na inicialização
  useEffect(() => {
    loadInstallmentGroups()
  }, [loadInstallmentGroups])

  // Verificar automaticamente todo dia
  useEffect(() => {
    const checkDaily = () => {
      processInstallments()
    }

    // Verificar imediatamente
    checkDaily()

    // Configurar verificação diária às 9:00
    const now = new Date()
    const next9AM = new Date()
    next9AM.setHours(9, 0, 0, 0)
    
    if (now > next9AM) {
      next9AM.setDate(next9AM.getDate() + 1)
    }

    const timeUntil9AM = next9AM.getTime() - now.getTime()
    
    setTimeout(() => {
      checkDaily()
      // Depois executar a cada 24 horas
      setInterval(checkDaily, 24 * 60 * 60 * 1000)
    }, timeUntil9AM)

  }, [processInstallments])

  return {
    installmentGroups,
    lastProcessedDate,
    createInstallmentGroup,
    processInstallments,
    forceProcessInstallments,
    loadInstallmentGroups
  }
}
