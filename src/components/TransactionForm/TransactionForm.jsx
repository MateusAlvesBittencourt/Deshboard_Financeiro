import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { 
  PlusCircle, 
  DollarSign,
  Calendar,
  Tag,
  FileText,
  Repeat,
  TrendingUp,
  TrendingDown,
  Sparkles,
  CreditCard
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  formatCurrencyInput, 
  INCOME_CATEGORIES, 
  EXPENSE_CATEGORIES,
  validateAmount 
} from '@/utils/financial'

function TransactionForm({ onAddTransaction }) {
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    recurrence: 'none',
    recurrenceFrequency: '',
    installments: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)

  const incomeCategories = INCOME_CATEGORIES
  const expenseCategories = EXPENSE_CATEGORIES
  const recurrenceOptions = [
    { value: 'none', label: 'Única' },
    { value: 'recorrente', label: 'Recorrente' },
    { value: 'parcelada', label: 'Parcelada' }
  ]
  const frequencyOptions = [
    { value: 'semanal', label: 'Semanal' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'anual', label: 'Anual' }
  ]

  const handleSubmit = useCallback(async () => {
    // Validações
    if (!validateAmount(newTransaction.amount)) {
      toast.error('Valor inválido', {
        description: 'Digite um valor válido maior que zero'
      })
      return
    }

    if (!newTransaction.category) {
      toast.error('Categoria obrigatória', {
        description: 'Selecione uma categoria para a transação'
      })
      return
    }

    if (!newTransaction.description.trim()) {
      toast.error('Descrição obrigatória', {
        description: 'Digite uma descrição para a transação'
      })
      return
    }

    if (newTransaction.recurrence === 'recorrente' && !newTransaction.recurrenceFrequency) {
      toast.error('Frequência obrigatória', {
        description: 'Selecione a frequência da recorrência'
      })
      return
    }

    if (newTransaction.recurrence === 'parcelada' && (!newTransaction.installments || newTransaction.installments < 2)) {
      toast.error('Parcelas inválidas', {
        description: 'Digite um número válido de parcelas (mínimo 2)'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const amount = parseFloat(newTransaction.amount.replace(/[^\d,]/g, '').replace(',', '.'))
      
      // Se for parcelada, incluir informação na descrição
      let description = newTransaction.description.trim()
      if (newTransaction.recurrence === 'parcelada' && newTransaction.installments) {
        description += ` (${newTransaction.installments}x)`
      }
      
      const transaction = {
        ...newTransaction,
        amount,
        description,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }

      await onAddTransaction(transaction)
      
      // Feedback de sucesso
      toast.success('Transação adicionada!', {
        description: `${newTransaction.type === 'income' ? 'Receita' : 'Despesa'} de ${formatCurrencyInput(newTransaction.amount)} cadastrada com sucesso`,
        action: {
          label: 'Ver transações',
          onClick: () => console.log('Navigate to transactions')
        }
      })

      // Reset form
      setNewTransaction({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        recurrence: 'none',
        recurrenceFrequency: '',
        installments: ''
      })
    } catch {
      toast.error('Erro ao adicionar transação', {
        description: 'Tente novamente em alguns instantes'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [newTransaction, onAddTransaction])

  const handleTypeChange = (type) => {
    setNewTransaction({
      ...newTransaction,
      type,
      category: '' // Reset category when type changes
    })
  }

  const handleAmountChange = (value) => {
    const formatted = formatCurrencyInput(value)
    setNewTransaction({ ...newTransaction, amount: formatted })
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <PlusCircle className="h-5 w-5 text-primary" />
          </div>
          Nova Transação
        </CardTitle>
        <CardDescription>
          Registre uma nova receita ou despesa no seu controle financeiro
        </CardDescription>
        
        {/* Toggle Advanced Mode */}
        <div className="flex items-center space-x-2 pt-2">
          <Switch
            id="advanced-mode"
            checked={isAdvancedMode}
            onCheckedChange={setIsAdvancedMode}
          />
          <Label htmlFor="advanced-mode" className="text-sm">
            Modo avançado
          </Label>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Opções extras
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tipo da Transação */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Tipo da Transação</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={newTransaction.type === 'income' ? 'default' : 'outline'}
              className={`h-20 flex-col gap-2 ${newTransaction.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              onClick={() => handleTypeChange('income')}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Receita</span>
            </Button>
            <Button
              type="button"
              variant={newTransaction.type === 'expense' ? 'default' : 'outline'}
              className={`h-20 flex-col gap-2 ${newTransaction.type === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}`}
              onClick={() => handleTypeChange('expense')}
            >
              <TrendingDown className="h-6 w-6" />
              <span>Despesa</span>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Valor
            </Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder="R$ 0,00"
              value={newTransaction.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categoria
            </Label>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Descrição
          </Label>
          <Textarea
            id="description"
            placeholder="Descreva a transação (ex: Salário mensal, Supermercado, etc.)"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
            className="min-h-[60px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Data
          </Label>
          <Input
            id="date"
            type="date"
            value={newTransaction.date}
            onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
          />
        </div>

        {/* Opções Avançadas */}
        {isAdvancedMode && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                <Label className="text-base font-medium">Recorrência</Label>
              </div>
              
              <Select
                value={newTransaction.recurrence}
                onValueChange={value => setNewTransaction({ 
                  ...newTransaction, 
                  recurrence: value, 
                  recurrenceFrequency: '',
                  installments: ''
                })}
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

              {newTransaction.recurrence === 'recorrente' && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="frequency">Frequência</Label>
                  <Select
                    value={newTransaction.recurrenceFrequency}
                    onValueChange={value => setNewTransaction({ ...newTransaction, recurrenceFrequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {newTransaction.recurrence === 'parcelada' && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="installments" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Número de parcelas
                  </Label>
                  <Input
                    id="installments"
                    type="number"
                    min="2"
                    max="60"
                    value={newTransaction.installments}
                    onChange={e => setNewTransaction({ ...newTransaction, installments: e.target.value })}
                    placeholder="Ex: 12"
                  />
                </div>
              )}
            </div>
          </>
        )}

        <Separator />

        <Button 
          onClick={handleSubmit} 
          className="w-full h-12 text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processando...
            </>
          ) : (
            <>
              <PlusCircle className="h-5 w-5 mr-2" />
              Adicionar Transação
            </>
          )}
        </Button>

        {/* Preview da Transação */}
        {newTransaction.amount && newTransaction.category && newTransaction.description && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                Preview
              </Badge>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className={newTransaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}>
                  {newTransaction.type === 'income' ? 'Receita' : 'Despesa'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor:</span>
                <span className="font-medium">R$ {newTransaction.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoria:</span>
                <span>{newTransaction.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descrição:</span>
                <span className="truncate max-w-[150px]">{newTransaction.description}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TransactionForm
