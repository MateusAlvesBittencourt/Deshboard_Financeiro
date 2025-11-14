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
    <Card className="border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <CardHeader className="flex-wrap gap-4 md:flex-row">
        <div className="flex-1">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Transações
          </CardTitle>
          <CardDescription>
            Visualize e gerencie suas transações
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv"
            onChange={handleImportCsv}
          />
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="mb-6 rounded-lg border border-dashed p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Filtros</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Limpar filtros
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="search">Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Descrição ou valor..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters({ ...filters, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Receitas</DropdownMenuLabel>
                  {INCOME_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Despesas</DropdownMenuLabel>
                  {EXPENSE_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabela de Transações */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('type')}>
                    Tipo
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Descrição
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('amount')}>
                    Valor
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('category')}>
                    Categoria
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('date')}>
                    Data
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map(transaction => (
                <tr key={transaction.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle">
                    <Badge variant={transaction.type === 'income' ? 'success' : 'destructive'}>
                      {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle font-medium">{transaction.description}</td>
                  <td className={`p-4 align-middle ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="p-4 align-middle text-muted-foreground">{transaction.category}</td>
                  <td className="p-4 align-middle text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </td>
                  <td className="p-4 align-middle text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => startEditTransaction(transaction)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteTransaction(transaction.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedTransactions.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
          </div>
        )}

        {/* Modal de Edição */}
        {editTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>Editar Transação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Valor</Label>
                  <Input
                    id="edit-amount"
                    value={editTransaction.amount}
                    onChange={(e) => setEditTransaction({ ...editTransaction, amount: formatCurrencyInput(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={editTransaction.description}
                    onChange={(e) => setEditTransaction({ ...editTransaction, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Select
                    value={editTransaction.category}
                    onValueChange={(value) => setEditTransaction({ ...editTransaction, category: value })}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue />
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
                    onChange={(e) => setEditTransaction({ ...editTransaction, date: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={cancelEditTransaction}>Cancelar</Button>
                  <Button onClick={saveEditTransaction}>Salvar</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TransactionList
