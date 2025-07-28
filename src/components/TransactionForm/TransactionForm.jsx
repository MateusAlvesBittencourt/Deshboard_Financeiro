import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { PlusCircle } from 'lucide-react'

const incomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Outros']
const expenseCategories = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Outros']

const recurrenceOptions = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'recorrente', label: 'Recorrente' },
  { value: 'parcelada', label: 'Parcelada' },
]

const recurrenceFrequencies = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'anual', label: 'Anual' },
]

// Função para formatar input como moeda brasileira
function formatCurrencyInput(value) {
  value = value.replace(/\D/g, '')
  let intValue = parseInt(value, 10)
  if (isNaN(intValue)) return ''
  let formatted = (intValue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return formatted
}

export function TransactionForm({ onAddTransaction }) {
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    recurrence: 'none',
    recurrenceFrequency: '',
    installments: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!newTransaction.amount || !newTransaction.category || !newTransaction.description) {
      alert('Por favor, preencha todos os campos')
      return
    }

    const amount = parseFloat(newTransaction.amount.replace(/\./g, '').replace(',', '.'))

    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, insira um valor positivo maior que zero.')
      return
    }

    if (newTransaction.type === 'income' && amount < 0) {
      alert('Receitas não podem ter valor negativo.')
      return
    }

    if (newTransaction.type === 'expense' && amount < 0) {
      alert('Despesas não podem ter valor negativo.')
      return
    }

    setIsSubmitting(true)
    
    const result = await onAddTransaction({
      ...newTransaction,
      amount
    })

    if (result.success) {
      setNewTransaction({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        recurrence: 'none',
        recurrenceFrequency: '',
        installments: '',
      })
    } else {
      alert(`Erro ao adicionar transação: ${result.error}`)
    }
    
    setIsSubmitting(false)
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Nova Transação
        </CardTitle>
        <CardDescription>
          Adicione uma nova receita ou despesa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={newTransaction.type} onValueChange={(value) => 
              setNewTransaction({...newTransaction, type: value, category: ''})
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={newTransaction.amount}
              onChange={e => {
                const formatted = formatCurrencyInput(e.target.value)
                setNewTransaction({ ...newTransaction, amount: formatted })
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={newTransaction.category} onValueChange={(value) => 
              setNewTransaction({...newTransaction, category: value})
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {(newTransaction.type === 'income' ? incomeCategories : expenseCategories).map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurrence">Recorrência</Label>
            <Select
              value={newTransaction.recurrence}
              onValueChange={value => setNewTransaction({ ...newTransaction, recurrence: value, recurrenceFrequency: '', installments: '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de recorrência" />
              </SelectTrigger>
              <SelectContent>
                {recurrenceOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {newTransaction.recurrence === 'recorrente' && (
            <div className="space-y-2">
              <Label htmlFor="recurrenceFrequency">Frequência</Label>
              <Select
                value={newTransaction.recurrenceFrequency}
                onValueChange={value => setNewTransaction({ ...newTransaction, recurrenceFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  {recurrenceFrequencies.map(freq => (
                    <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {newTransaction.recurrence === 'parcelada' && (
            <div className="space-y-2">
              <Label htmlFor="installments">Número de Parcelas</Label>
              <Input
                id="installments"
                type="number"
                min="1"
                value={newTransaction.installments}
                onChange={e => setNewTransaction({ ...newTransaction, installments: e.target.value })}
                placeholder="Ex: 12"
              />
            </div>
          )}
        </div>

        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            placeholder="Descrição da transação"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
            className="text-xs sm:text-base py-2"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full text-xs sm:text-base py-2"
          disabled={isSubmitting}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Adicionando...' : 'Adicionar Transação'}
        </Button>
      </CardContent>
    </Card>
  )
}
