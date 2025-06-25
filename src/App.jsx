import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { PlusCircle, DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, BarChart3, PieChart } from 'lucide-react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts'
import './App.css'
import { salvarDado, listarDados, atualizarDado, deletarDado } from './lib/db'
import Papa from 'papaparse'
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch.jsx";

function App() {
  const [transactions, setTransactions] = useState([])
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [editTransactionId, setEditTransactionId] = useState(null)
  const [editTransaction, setEditTransaction] = useState(null)
  const importInputRef = useRef(null)
  const { theme, setTheme } = useTheme();

  // Categorias predefinidas
  const incomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Outros']
  const expenseCategories = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Outros']

  // Carregar dados do IndexedDB
  useEffect(() => {
    async function fetchTransactions() {
      const savedTransactions = await listarDados();
      setTransactions(savedTransactions || []);
    }
    fetchTransactions();
  }, []);

  // Função para formatar input como moeda brasileira
  function formatCurrencyInput(value) {
    value = value.replace(/\D/g, '');
    let intValue = parseInt(value, 10);
    if (isNaN(intValue)) return '';
    let formatted = (intValue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return formatted;
  }

  // Salvar nova transação no IndexedDB
  const addTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.category || !newTransaction.description) {
      alert('Por favor, preencha todos os campos')
      return
    }

    const amount = parseFloat(newTransaction.amount.replace(/\./g, '').replace(',', '.'));

    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, insira um valor positivo maior que zero.');
      return;
    }

    if (newTransaction.type === 'income' && amount < 0) {
      alert('Receitas não podem ter valor negativo.');
      return;
    }

    if (newTransaction.type === 'expense' && amount < 0) {
      alert('Despesas não podem ter valor negativo.');
      return;
    }

    const transaction = {
      id: Date.now().toString(),
      ...newTransaction,
      amount,
      createdAt: new Date().toISOString()
    }

    await salvarDado(transaction);
    const updatedTransactions = await listarDados();
    setTransactions(updatedTransactions || []);
    setNewTransaction({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    })
  }

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
    const amount = parseFloat(editTransaction.amount.replace(/\./g, '').replace(',', '.'));

    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, insira um valor positivo maior que zero.');
      return;
    }

    if (editTransaction.type === 'income' && amount < 0) {
      alert('Receitas não podem ter valor negativo.');
      return;
    }

    if (editTransaction.type === 'expense' && amount < 0) {
      alert('Despesas não podem ter valor negativo.');
      return;
    }

    const updated = {
      ...editTransaction,
      amount
    }
    await atualizarDado(updated)
    const updatedTransactions = await listarDados()
    setTransactions(updatedTransactions || [])
    setEditTransactionId(null)
    setEditTransaction(null)
  }

  // Função para deletar transação
  const deleteTransaction = async (id) => {
    await deletarDado(id);
    const updatedTransactions = await listarDados();
    setTransactions(updatedTransactions || []);
  };

  // Calcular estatísticas
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date)
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
  })

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const currentBalance = totalIncome - totalExpenses

  const monthlyIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const monthlySavings = monthlyIncome - monthlyExpenses

  // Formatar valor monetário
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Preparar dados para gráficos
  const prepareChartData = () => {
    // Dados para gráfico de pizza (gastos por categoria)
    const expensesByCategory = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount
    })
    
    const pieData = Object.entries(expensesByCategory).map(([category, amount]) => ({
      name: category,
      value: amount,
      percentage: ((amount / totalExpenses) * 100).toFixed(1)
    }))

    // Dados para gráfico de barras (receitas vs despesas por mês)
    const monthlyData = {}
    transactions.forEach(t => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthName, receitas: 0, despesas: 0 }
      }
      
      if (t.type === 'income') {
        monthlyData[monthKey].receitas += t.amount
      } else {
        monthlyData[monthKey].despesas += t.amount
      }
    })
    
    const barData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))

    // Dados para gráfico de linha (evolução do saldo)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date))
    let runningBalance = 0
    const lineData = sortedTransactions.map(t => {
      runningBalance += t.type === 'income' ? t.amount : -t.amount
      return {
        date: new Date(t.date).toLocaleDateString('pt-BR'),
        saldo: runningBalance,
        description: t.description
      }
    })

    return { pieData, barData, lineData }
  }

  // Calcular estatísticas avançadas
  const calculateAdvancedStats = () => {
    if (transactions.length === 0) return {}

    // Média semanal de gastos
    const weeklyExpenses = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const date = new Date(t.date)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const weekKey = weekStart.toISOString().split('T')[0]
      weeklyExpenses[weekKey] = (weeklyExpenses[weekKey] || 0) + t.amount
    })
    
    const avgWeeklyExpenses = Object.values(weeklyExpenses).reduce((sum, val) => sum + val, 0) / Object.keys(weeklyExpenses).length || 0

    // Projeção de saldo para próximos 3 meses
    const avgMonthlyIncome = monthlyIncome || (totalIncome / Math.max(1, new Set(transactions.filter(t => t.type === 'income').map(t => new Date(t.date).getMonth())).size))
    const avgMonthlyExpenses = monthlyExpenses || (totalExpenses / Math.max(1, new Set(transactions.filter(t => t.type === 'expense').map(t => new Date(t.date).getMonth())).size))
    
    const projectedSaldo = []
    let currentProjectedBalance = currentBalance
    
    for (let i = 1; i <= 3; i++) {
      currentProjectedBalance += (avgMonthlyIncome - avgMonthlyExpenses)
      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + i)
      projectedSaldo.push({
        month: futureDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        saldo: currentProjectedBalance
      })
    }

    // Categoria com maior gasto
    const expensesByCategory = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount
    })
    
    const topExpenseCategory = Object.entries(expensesByCategory).reduce((max, [category, amount]) => 
      amount > max.amount ? { category, amount } : max, { category: '', amount: 0 })

    // Limite de gastos (exemplo: 80% da receita mensal)
    const spendingLimit = avgMonthlyIncome * 0.8
    const isOverSpendingLimit = monthlyExpenses > spendingLimit

    return {
      avgWeeklyExpenses,
      projectedSaldo,
      topExpenseCategory,
      spendingLimit,
      isOverSpendingLimit,
      avgMonthlyIncome,
      avgMonthlyExpenses
    }
  }

  const { pieData, barData, lineData } = prepareChartData()
  const advancedStats = calculateAdvancedStats()

  // Cores para os gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658']

  // Função para exportar dados para TXT
  const exportToTXT = () => {
    if (transactions.length === 0) {
      alert("Nenhuma transação para exportar.");
      return;
    }

    // Cabeçalho correto com 7 colunas
    const headers = "id,type,amount,category,description,date,createdAt";

    // Corrigido: sem vírgulas extras após os campos
    const csvContent = transactions.map(t =>
      [
        t.id,
        t.type,
        (typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0),
        `"${(t.category || '').replace(/"/g, '""')}"`,      // escapa aspas corretamente
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.date,
        t.createdAt
      ].join(",")
    ).join("\n");

    const txt = `${headers}\n${csvContent}`;
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "transacoes.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função para lidar com a importação de arquivo
  const handleImport = (event) => {
    const file = event.target.files[0];
    console.log('Arquivo selecionado:', file);
    
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        error: (error) => {
          console.error('Erro ao ler CSV:', error);
          alert('Erro ao ler o arquivo CSV. Verifique se o formato está correto.');
        },
        complete: async (results) => {
          console.log('Resultado completo do parsing:', results);
          console.log('Dados do CSV:', results.data);
          console.log('Erros do parsing:', results.errors);
          
          if (results.errors && results.errors.length > 0) {
            console.error('Erros encontrados:', results.errors);
            alert('Erros encontrados ao ler o CSV. Verifique o console para mais detalhes.');
            return;
          }
          
          if (!results.data || results.data.length === 0) {
            alert('Nenhum dado encontrado no arquivo CSV.');
            return;
          }
          
          console.log('Transações existentes:', transactions);
          
          const existingIds = new Set(transactions.map(t => t.id));
          console.log('IDs existentes:', Array.from(existingIds));
          
          const newTransactions = results.data.filter(t => {
            console.log('Verificando transação:', t);
            return t.id && !existingIds.has(t.id);
          });
          
          console.log('Transações novas encontradas:', newTransactions);

          if (newTransactions.length > 0) {
            const parsedTransactions = newTransactions.map(t => ({
              ...t,
              amount: parseFloat(t.amount) || 0
            }));
            
            for (const t of parsedTransactions) {
              await salvarDado(t);
            }
            const updatedTransactions = await listarDados();
            setTransactions(updatedTransactions);
            alert(`${newTransactions.length} novas transações importadas!`);
          } else {
            alert("Nenhuma transação nova encontrada no arquivo.");
          }
        },
      });
    } else {
      alert('Nenhum arquivo selecionado.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4">
      <div className="flex justify-end mb-4">
        <span className="mr-2 text-sm">🌞</span>
        <Switch
          checked={theme === "dark"}
          onCheckedChange={checked => setTheme(checked ? "dark" : "light")}
        />
        <span className="ml-2 text-sm">🌙</span>
      </div>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Financeiro Pessoal</h1>
          <p className="text-gray-400 dark:text-gray-300">Controle suas finanças de forma inteligente</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Saldo Atual</CardTitle>
              <Wallet className="h-4 w-4 text-gray-400 dark:text-gray-300" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(currentBalance)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Receitas do Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(monthlyIncome)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Despesas do Mês</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(monthlyExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Economia do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-300" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${monthlySavings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(monthlySavings)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <Tabs defaultValue="add-transaction" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add-transaction">Adicionar Transação</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
          </TabsList>

          {/* Aba Adicionar Transação */}
          <TabsContent value="add-transaction">
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        const formatted = formatCurrencyInput(e.target.value);
                        setNewTransaction({ ...newTransaction, amount: formatted });
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Descrição da transação"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  />
                </div>

                <Button onClick={addTransaction} className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar Transação
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Transações */}
          <TabsContent value="transactions">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Histórico de Transações
                  </CardTitle>
                  <div className="flex gap-2">
                    <input type="file" accept=".csv" ref={importInputRef} className="hidden" onChange={handleImport} />
                    <Button onClick={() => importInputRef.current.click()} variant="outline">Importar de CSV</Button>
                    <Button onClick={exportToTXT} variant="outline">Exportar para CSV</Button>
                  </div>
                </div>
                <CardDescription>
                  Visualize todas as suas transações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Nenhuma transação encontrada. Adicione sua primeira transação!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {transactions.slice().reverse().map(transaction => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          {editTransactionId === transaction.id ? (
                            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={editTransaction.amount}
                                onChange={e => {
                                  const formatted = formatCurrencyInput(e.target.value);
                                  setEditTransaction({ ...editTransaction, amount: formatted });
                                }}
                                className="w-24"
                              />
                              <Select value={editTransaction.category} onValueChange={value => setEditTransaction({ ...editTransaction, category: value })}>
                                <SelectTrigger className="w-32" />
                                <SelectContent>
                                  {(editTransaction.type === 'income' ? incomeCategories : expenseCategories).map(category => (
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
                                className="w-36"
                              />
                              <Button onClick={saveEditTransaction} className="bg-green-600 hover:bg-green-700 text-white">Salvar</Button>
                              <Button variant="outline" onClick={cancelEditTransaction}>Cancelar</Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                                <div>
                                  <p className="font-medium">{transaction.description}</p>
                                  <p className="text-sm text-gray-500">
                                    {transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </p>
                                <Button size="sm" variant="outline" className="ml-2" onClick={() => startEditTransaction(transaction)}>
                                  Editar
                                </Button>
                                <Button size="sm" variant="destructive" className="ml-2" onClick={() => deleteTransaction(transaction.id)}>
                                  Excluir
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Análises */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              {transactions.length === 0 ? (
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Análises e Estatísticas
                    </CardTitle>
                    <CardDescription>
                      Visualize seus dados financeiros
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-300">
                        Adicione algumas transações para visualizar gráficos e análises
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Gráfico de Pizza - Gastos por Categoria */}
                  {pieData.length > 0 && (
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="h-5 w-5" />
                          Distribuição de Gastos por Categoria
                        </CardTitle>
                        <CardDescription>
                          Visualize como seus gastos estão distribuídos
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percentage }) => `${name}: ${percentage}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                              <Legend />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Gráfico de Barras - Receitas vs Despesas por Mês */}
                  {barData.length > 0 && (
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Receitas vs Despesas por Mês
                        </CardTitle>
                        <CardDescription>
                          Compare suas receitas e despesas mensais
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString()}`} />
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                              <Legend />
                              <Bar dataKey="receitas" fill="#00C49F" name="Receitas" />
                              <Bar dataKey="despesas" fill="#FF8042" name="Despesas" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Gráfico de Linha - Evolução do Saldo */}
                  {lineData.length > 0 && (
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Evolução do Saldo
                        </CardTitle>
                        <CardDescription>
                          Acompanhe a evolução do seu saldo ao longo do tempo
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString()}`} />
                              <Tooltip 
                                formatter={(value) => formatCurrency(value)}
                                labelFormatter={(label) => `Data: ${label}`}
                              />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="saldo" 
                                stroke="#0088FE" 
                                strokeWidth={2}
                                name="Saldo Acumulado"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Estatísticas Resumidas */}
                  <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
                    <CardHeader>
                      <CardTitle>Estatísticas Resumidas</CardTitle>
                      <CardDescription>
                        Informações importantes sobre suas finanças
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Total de Transações</p>
                          <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">Média de Receitas Mensais</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(barData.length > 0 ? barData.reduce((sum, item) => sum + item.receitas, 0) / barData.length : 0)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <p className="text-sm text-gray-600">Média de Despesas Mensais</p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(barData.length > 0 ? barData.reduce((sum, item) => sum + item.despesas, 0) / barData.length : 0)}
                          </p>
                        </div>
                      </div>

                      {/* Estatísticas Avançadas */}
                      {advancedStats.avgWeeklyExpenses && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Análises Avançadas</h3>
                          
                          {/* Alerta de Limite de Gastos */}
                          {advancedStats.isOverSpendingLimit && (
                            <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                              <div className="flex items-center gap-2">
                                <TrendingDown className="h-5 w-5 text-red-600" />
                                <p className="font-semibold text-red-800">Atenção: Limite de Gastos Excedido!</p>
                              </div>
                              <p className="text-red-700 mt-1">
                                Você gastou {formatCurrency(monthlyExpenses)} este mês, ultrapassando o limite recomendado de {formatCurrency(advancedStats.spendingLimit)}.
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Média Semanal */}
                            <div className="p-4 bg-purple-50 rounded-lg">
                              <p className="text-sm text-gray-600">Média de Gastos Semanais</p>
                              <p className="text-xl font-bold text-purple-600">
                                {formatCurrency(advancedStats.avgWeeklyExpenses)}
                              </p>
                            </div>

                            {/* Categoria com Maior Gasto */}
                            {advancedStats.topExpenseCategory.category && (
                              <div className="p-4 bg-orange-50 rounded-lg">
                                <p className="text-sm text-gray-600">Categoria com Maior Gasto</p>
                                <p className="text-lg font-bold text-orange-600">
                                  {advancedStats.topExpenseCategory.category}
                                </p>
                                <p className="text-sm text-orange-500">
                                  {formatCurrency(advancedStats.topExpenseCategory.amount)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Projeções de Saldo */}
                          {advancedStats.projectedSaldo.length > 0 && (
                            <div className="mt-6">
                              <h4 className="text-md font-semibold mb-3">Projeção de Saldo (Próximos 3 Meses)</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {advancedStats.projectedSaldo.map((projection, index) => (
                                  <div key={index} className="p-3 bg-gray-50 rounded-lg text-center">
                                    <p className="text-sm text-gray-600">{projection.month}</p>
                                    <p className={`text-lg font-bold ${projection.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {formatCurrency(projection.saldo)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                * Projeção baseada na média de receitas e despesas mensais
                              </p>
                            </div>
                          )}

                          {/* Dicas Financeiras */}
                          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="text-md font-semibold text-blue-800 mb-2">💡 Dicas Financeiras</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              {currentBalance < 0 && (
                                <li>• Seu saldo está negativo. Considere reduzir gastos ou aumentar receitas.</li>
                              )}
                              {advancedStats.isOverSpendingLimit && (
                                <li>• Você excedeu o limite recomendado de gastos. Revise suas despesas na categoria "{advancedStats.topExpenseCategory.category}".</li>
                              )}
                              {monthlySavings > 0 && (
                                <li>• Parabéns! Você economizou {formatCurrency(monthlySavings)} este mês.</li>
                              )}
                              <li>• Mantenha um controle regular de suas finanças para atingir seus objetivos.</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

