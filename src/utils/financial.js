// Função para formatar valor monetário
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Função para formatar input como moeda brasileira
export const formatCurrencyInput = (value) => {
  value = value.replace(/\D/g, '')
  let intValue = parseInt(value, 10)
  if (isNaN(intValue)) return ''
  let formatted = (intValue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return formatted
}

// Validar dados de transação
export const validateTransaction = (transaction) => {
  const errors = []

  if (!transaction.amount || transaction.amount === '') {
    errors.push('Valor é obrigatório')
  }

  if (!transaction.category || transaction.category === '') {
    errors.push('Categoria é obrigatória')
  }

  if (!transaction.description || transaction.description === '') {
    errors.push('Descrição é obrigatória')
  }

  const amount = parseFloat(transaction.amount.toString().replace(/\./g, '').replace(',', '.'))
  
  if (isNaN(amount) || amount <= 0) {
    errors.push('Valor deve ser um número positivo maior que zero')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validar apenas o valor de uma transação
export const validateAmount = (value) => {
  if (!value || value === '') {
    return false
  }
  
  const amount = parseFloat(value.toString().replace(/[^\d,]/g, '').replace(',', '.'))
  return !isNaN(amount) && amount > 0
}

// Categorias predefinidas
export const INCOME_CATEGORIES = ['Salário', 'Freelance', 'Investimentos', 'Outros']
export const EXPENSE_CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Outros']

// Opções de recorrência
export const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'recorrente', label: 'Recorrente' },
  { value: 'parcelada', label: 'Parcelada' },
]

export const RECURRENCE_FREQUENCIES = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'anual', label: 'Anual' },
]
