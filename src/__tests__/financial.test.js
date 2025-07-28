// Exemplo de testes unitários para os utils financeiros
// Para executar: npm install --save-dev jest @testing-library/react @testing-library/jest-dom

import { formatCurrency, formatCurrencyInput, validateTransaction } from '../utils/financial'

describe('Financial Utils', () => {
  describe('formatCurrency', () => {
    test('should format positive numbers correctly', () => {
      expect(formatCurrency(1000)).toBe('R$ 1.000,00')
      expect(formatCurrency(0.5)).toBe('R$ 0,50')
    })

    test('should format negative numbers correctly', () => {
      expect(formatCurrency(-500)).toBe('-R$ 500,00')
    })

    test('should handle zero', () => {
      expect(formatCurrency(0)).toBe('R$ 0,00')
    })
  })

  describe('formatCurrencyInput', () => {
    test('should format input string correctly', () => {
      expect(formatCurrencyInput('100050')).toBe('1.000,50')
      expect(formatCurrencyInput('50')).toBe('0,50')
    })

    test('should handle empty input', () => {
      expect(formatCurrencyInput('')).toBe('')
    })

    test('should remove non-digit characters', () => {
      expect(formatCurrencyInput('abc123def')).toBe('1,23')
    })
  })

  describe('validateTransaction', () => {
    test('should validate correct transaction', () => {
      const transaction = {
        amount: '100,00',
        category: 'Alimentação',
        description: 'Compras do mercado'
      }

      const result = validateTransaction(transaction)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should detect missing fields', () => {
      const transaction = {
        amount: '',
        category: '',
        description: ''
      }

      const result = validateTransaction(transaction)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Valor é obrigatório')
      expect(result.errors).toContain('Categoria é obrigatória')
      expect(result.errors).toContain('Descrição é obrigatória')
    })

    test('should detect invalid amount', () => {
      const transaction = {
        amount: '0',
        category: 'Alimentação',
        description: 'Test'
      }

      const result = validateTransaction(transaction)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Valor deve ser um número positivo maior que zero')
    })
  })
})

// Exemplo de teste para hooks customizados
import { renderHook } from '@testing-library/react'
import { useFinancialStats } from '../hooks/useFinancialStats'

describe('useFinancialStats Hook', () => {
  test('should calculate stats correctly', () => {
    const mockTransactions = [
      {
        id: '1',
        type: 'income',
        amount: 1000,
        date: new Date().toISOString(),
        category: 'Salário',
        description: 'Salário mensal'
      },
      {
        id: '2', 
        type: 'expense',
        amount: 300,
        date: new Date().toISOString(),
        category: 'Alimentação',
        description: 'Mercado'
      }
    ]

    const { result } = renderHook(() => useFinancialStats(mockTransactions))

    expect(result.current.totalIncome).toBe(1000)
    expect(result.current.totalExpenses).toBe(300)
    expect(result.current.currentBalance).toBe(700)
  })

  test('should handle empty transactions', () => {
    const { result } = renderHook(() => useFinancialStats([]))

    expect(result.current.totalIncome).toBe(0)
    expect(result.current.totalExpenses).toBe(0)
    expect(result.current.currentBalance).toBe(0)
  })
})
