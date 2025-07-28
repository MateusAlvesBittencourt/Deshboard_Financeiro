import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, Download, Upload } from 'lucide-react'
import { formatCurrencyInput, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/utils/financial'
import { useDataExport, useDataImport } from '@/hooks/useDataImportExport'
import { salvarDado, listarDados } from '@/lib/db'

export function TransactionList({ 
  transactions, 
  filteredTransactions, 
  filters, 
  setFilters,
  resetFilters,
  onUpdateTransaction, 
  onDeleteTransaction, 
  formatCurrency 
}) {
  const [editTransactionId, setEditTransactionId] = useState(null)
  const [editTransaction, setEditTransaction] = useState(null)
  const importInputRef = useRef(null)
  
  const { exportToCSV, exportToTXT } = useDataExport(transactions)
  const { importFromCSV } = useDataImport(transactions, () => {
    // Callback após importação - pode ser usado para atualizar estado se necessário
    window.location.reload() // Solução simples para recarregar dados
  })

  // Função para iniciar edição
  const startEditTransaction = (transaction) => {
    setEditTransactionId(transaction.id)
    setEditTransaction({ ...transaction, amount: transaction.amount.toString() })
  }

  // Função para cancelar edição
  const cancelEditTransaction = () => {
    setEditTransactionId(null)
    setEditTransaction(null)
  }

  // Função para salvar edição
  const saveEditTransaction = async () => {
    if (!editTransaction.amount || !editTransaction.category || !editTransaction.description) {
      alert('Por favor, preencha todos os campos')
      return
    }
    
    const amount = parseFloat(editTransaction.amount.replace(/\./g, '').replace(',', '.'))

    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, insira um valor positivo maior que zero.')
      return
    }

    if (editTransaction.type === 'income' && amount < 0) {
      alert('Receitas não podem ter valor negativo.')
      return
    }

    if (editTransaction.type === 'expense' && amount < 0) {
      alert('Despesas não podem ter valor negativo.')
      return
    }

    const result = await onUpdateTransaction({
      ...editTransaction,
      amount
    })

    if (result.success) {
      setEditTransactionId(null)
      setEditTransaction(null)
    } else {
      alert(`Erro ao atualizar transação: ${result.error}`)
    }
  }

  // Função para deletar transação
  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      const result = await onDeleteTransaction(id)
      if (!result.success) {
        alert(`Erro ao deletar transação: ${result.error}`)
      }
    }
  }

  // Função para importar CSV
  const handleImportCSV = (event) => {
    const file = event.target.files[0]
    if (file) {
      importFromCSV(file, salvarDado, listarDados)
    }
    // Reset input
    event.target.value = ''
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico de Transações
            </CardTitle>
            <CardDescription>
              Visualize todas as suas transações
            </CardDescription>
          </div>
          
          {/* Botões de Import/Export */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="text-xs sm:text-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToTXT}
              className="text-xs sm:text-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Exportar TXT
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => importInputRef.current?.click()}
              className="text-xs sm:text-sm"
            >
              <Upload className="h-4 w-4 mr-1" />
              Importar CSV
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              style={{ display: 'none' }}
            />
          </div>
        </div>
        
        {/* Filtros avançados */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-4">
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
          
          <Input
            type="date"
            value={filters.filterStartDate}
            onChange={(e) => setFilters.setFilterStartDate(e.target.value)}
            className="w-36"
            placeholder="Data inicial"
          />
          
          <Input
            type="date"
            value={filters.filterEndDate}
            onChange={(e) => setFilters.setFilterEndDate(e.target.value)}
            className="w-36"
            placeholder="Data final"
          />
          
          <Input
            type="text"
            value={filters.filterDescription}
            onChange={(e) => setFilters.setFilterDescription(e.target.value)}
            className="w-40"
            placeholder="Buscar descrição..."
          />
          
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Limpar Filtros
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="overflow-x-auto">
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Mostrando {filteredTransactions.length} de {transactions.length} transações
        </div>
        
        {filteredTransactions.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-300">
            Nenhuma transação encontrada. Ajuste os filtros ou adicione sua primeira transação!
          </p>
        ) : (
          <div className="space-y-1 sm:space-y-2 min-w-[280px] sm:min-w-[320px]">
            {filteredTransactions.slice().reverse().map(transaction => (
              <div key={transaction.id} className="flex flex-col md:flex-row md:items-center justify-between p-2 sm:p-4 border rounded-lg gap-1 sm:gap-0 text-xs sm:text-base">
                {editTransactionId === transaction.id ? (
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={editTransaction.amount}
                      onChange={e => {
                        const formatted = formatCurrencyInput(e.target.value)
                        setEditTransaction({ ...editTransaction, amount: formatted })
                      }}
                      className="w-24"
                    />
                    <Select
                      value={editTransaction.category}
                      onValueChange={value => setEditTransaction({ ...editTransaction, category: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(editTransaction.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={editTransaction.description}
                      onChange={e => setEditTransaction({ ...editTransaction, description: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      type="date"
                      value={editTransaction.date}
                      onChange={e => setEditTransaction({ ...editTransaction, date: e.target.value })}
                      className="w-32"
                    />
                    <div className="flex gap-1">
                      <Button size="sm" onClick={saveEditTransaction}>
                        Salvar
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditTransaction}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{transaction.description}</span>
                          {transaction.recurrence === 'recorrente' && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              {transaction.recurrenceFrequency}
                            </Badge>
                          )}
                          {transaction.recurrence === 'parcelada' && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                              {transaction.installments}x
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                            {transaction.category}
                          </span>
                          <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <p className={`font-bold text-sm sm:text-base ${
                        transaction.type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <Button size="sm" variant="outline" className="ml-2" onClick={() => startEditTransaction(transaction)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDeleteTransaction(transaction.id)}>
                        Excluir
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
