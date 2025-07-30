import { useState, useRef, useMemo } from 'react'
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
  Calendar, 
  Download, 
  Upload, 
  Search,
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  ArrowUpDown,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx'
import { toast } from 'sonner'
import { formatCurrencyInput, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/utils/financial'
import { useDataExport, useDataImport } from '../../hooks/useDataImportExport'
import { salvarDado, listarDados } from '@/lib/db'

function TransactionList({ 
  transactions, 
  filteredTransactions, 
  filters, 
  setFilters,
  resetFilters,
  onUpdateTransaction, 
  onDeleteTransaction, 
  formatCurrency 
}) {
  const [editTransaction, setEditTransaction] = useState(null)
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [viewMode, setViewMode] = useState('detailed') // 'detailed' | 'compact'
  const [selectedTransactions, setSelectedTransactions] = useState([])
  
  const fileInputRef = useRef(null)
  const { exportToCsv } = useDataExport()
  const { importFromCsv } = useDataImport()

  // Ordenação e paginação
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'category':
          aValue = a.category.toLowerCase()
          bValue = b.category.toLowerCase()
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        default:
          aValue = new Date(a.date)
          bValue = new Date(b.date)
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [filteredTransactions, sortBy, sortOrder])

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const startEditTransaction = (transaction) => {
    setEditTransaction({
      ...transaction,
      amount: transaction.amount.toString().replace('.', ','),
      recurrence: transaction.recurrence || 'none',
      recurrenceFrequency: transaction.recurrenceFrequency || ''
    })
  }

  const saveEditTransaction = async () => {
    try {
      const amount = parseFloat(editTransaction.amount.replace(/[^\d,]/g, '').replace(',', '.'))
      
      if (isNaN(amount) || amount <= 0) {
        toast.error('Valor inválido', {
          description: 'Digite um valor válido maior que zero'
        })
        return
      }

      if (!editTransaction.category) {
        toast.error('Categoria obrigatória', {
          description: 'Selecione uma categoria para a transação'
        })
        return
      }

      if (!editTransaction.description.trim()) {
        toast.error('Descrição obrigatória', {
          description: 'Digite uma descrição para a transação'
        })
        return
      }

      if (editTransaction.recurrence === 'recorrente' && !editTransaction.recurrenceFrequency) {
        toast.error('Frequência obrigatória', {
          description: 'Selecione a frequência da recorrência'
        })
        return
      }

      const updatedTransaction = {
        ...editTransaction,
        amount,
        recurrence: editTransaction.recurrence || 'none',
        recurrenceFrequency: editTransaction.recurrence === 'recorrente' ? editTransaction.recurrenceFrequency : ''
      }

      await onUpdateTransaction(updatedTransaction)
      setEditTransaction(null)
      
      toast.success('Transação atualizada!', {
        description: 'As alterações foram salvas com sucesso'
      })
    } catch {
      toast.error('Erro ao atualizar transação')
    }
  }

  const cancelEditTransaction = () => {
    setEditTransaction(null)
  }

  const handleDeleteTransaction = async (id) => {
    try {
      await onDeleteTransaction(id)
      toast.success('Transação excluída!', {
        description: 'A transação foi removida permanentemente'
      })
    } catch {
      toast.error('Erro ao excluir transação')
    }
  }

  const handleExportCsv = () => {
    try {
      exportToCsv(transactions)
      toast.success('Dados exportados!', {
        description: 'Arquivo CSV baixado com sucesso'
      })
    } catch {
      toast.error('Erro ao exportar dados')
    }
  }

  const handleImportCsv = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        const message = await importFromCsv(file, transactions, () => {
          // Recarregar as transações seria feito pelo componente pai
        }, salvarDado, listarDados)
        
        toast.success('Dados importados!', {
          description: message
        })
      } catch (error) {
        toast.error('Erro ao importar dados', {
          description: error.message
        })
      }
    }
    event.target.value = ''
  }

  const toggleTransactionSelection = (id) => {
    setSelectedTransactions(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    )
  }

  const getRecurrenceBadge = (transaction) => {
    if (transaction.recurrence === 'recorrente') {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
          {transaction.recurrenceFrequency}
        </Badge>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico de Transações
            </CardTitle>
            <CardDescription>
              Gerencie todas as suas transações financeiras
            </CardDescription>
          </div>
        </div>

        {/* Barra de Ferramentas */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={filters.filterDescription}
                onChange={(e) => setFilters.setFilterDescription(e.target.value)}
                className="pl-9 w-48"
                placeholder="Buscar transações..."
              />
            </div>
            
            <Select value={filters.filterType} onValueChange={setFilters.setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.filterCategory} onValueChange={setFilters.setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={resetFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>

          {/* Ações */}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'detailed' ? 'compact' : 'detailed')}>
              {viewMode === 'detailed' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportCsv}
              accept=".csv"
              className="hidden"
            />
          </div>
        </div>

        {/* Cabeçalho da Lista com Ordenação */}
        <div className="flex items-center gap-4 py-2 px-4 bg-muted/30 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 justify-start"
            onClick={() => handleSort('date')}
          >
            Data
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 justify-start"
            onClick={() => handleSort('type')}
          >
            Tipo
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 justify-start"
            onClick={() => handleSort('amount')}
          >
            Valor
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 justify-start"
            onClick={() => handleSort('category')}
          >
            Categoria
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredTransactions.length} de {transactions.length} transações
        </div>
      </CardHeader>
      
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              Nenhuma transação encontrada
            </p>
            <p className="text-sm text-muted-foreground">
              {transactions.length === 0 
                ? 'Adicione sua primeira transação para começar'
                : 'Tente ajustar os filtros para encontrar suas transações'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`group relative rounded-lg border p-4 transition-all hover:shadow-md ${
                  selectedTransactions.includes(transaction.id) ? 'border-primary bg-primary/5' : ''
                }`}
              >
                {editTransaction?.id === transaction.id ? (
                  // Modo de Edição Completo
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                    {/* Tipo da Transação */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tipo da Transação</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={editTransaction.type === 'income' ? 'default' : 'outline'}
                          size="sm"
                          className={`${editTransaction.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                          onClick={() => setEditTransaction({ ...editTransaction, type: 'income', category: '' })}
                        >
                          Receita
                        </Button>
                        <Button
                          type="button"
                          variant={editTransaction.type === 'expense' ? 'default' : 'outline'}
                          size="sm"
                          className={`${editTransaction.type === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                          onClick={() => setEditTransaction({ ...editTransaction, type: 'expense', category: '' })}
                        >
                          Despesa
                        </Button>
                      </div>
                    </div>

                    {/* Campos principais */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="edit-amount">Valor</Label>
                        <Input
                          id="edit-amount"
                          type="text"
                          inputMode="decimal"
                          placeholder="0,00"
                          value={editTransaction.amount}
                          onChange={e => {
                            const formatted = formatCurrencyInput(e.target.value)
                            setEditTransaction({ ...editTransaction, amount: formatted })
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-category">Categoria</Label>
                        <Select
                          value={editTransaction.category}
                          onValueChange={value => setEditTransaction({ ...editTransaction, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {(editTransaction.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-date">Data</Label>
                        <Input
                          id="edit-date"
                          type="date"
                          value={editTransaction.date}
                          onChange={e => setEditTransaction({ ...editTransaction, date: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-recurrence">Recorrência</Label>
                        <Select
                          value={editTransaction.recurrence || 'none'}
                          onValueChange={value => setEditTransaction({ 
                            ...editTransaction, 
                            recurrence: value,
                            recurrenceFrequency: value === 'none' ? '' : editTransaction.recurrenceFrequency,
                            installments: value === 'none' ? '' : editTransaction.installments
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Única</SelectItem>
                            <SelectItem value="recorrente">Recorrente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Campos condicionais de recorrência */}
                    {editTransaction.recurrence === 'recorrente' && (
                      <div className="space-y-2">
                        <Label htmlFor="edit-frequency">Frequência</Label>
                        <Select
                          value={editTransaction.recurrenceFrequency || ''}
                          onValueChange={value => setEditTransaction({ ...editTransaction, recurrenceFrequency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="semanal">Semanal</SelectItem>
                            <SelectItem value="mensal">Mensal</SelectItem>
                            <SelectItem value="anual">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Descrição */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Descrição</Label>
                      <Textarea
                        id="edit-description"
                        placeholder="Descreva a transação..."
                        value={editTransaction.description}
                        onChange={e => setEditTransaction({ ...editTransaction, description: e.target.value })}
                        rows={2}
                      />
                    </div>

                    {/* Botões de ação */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={saveEditTransaction}>
                        Salvar Alterações
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditTransaction}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Modo de Visualização
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {/* Checkbox para seleção */}
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={() => toggleTransactionSelection(transaction.id)}
                        className="rounded border-gray-300"
                      />
                      
                      {/* Ícone do tipo */}
                      <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      
                      {/* Informações da transação */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{transaction.description}</span>
                          {getRecurrenceBadge(transaction)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {transaction.category}
                          </Badge>
                          <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Valor e ações */}
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${
                        transaction.type === 'income' 
                          ? 'text-emerald-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => startEditTransaction(transaction)}>
                            <Edit3 className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TransactionList
