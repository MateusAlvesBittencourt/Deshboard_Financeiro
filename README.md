# Dashboard Financeiro Pessoal

Um dashboard completo para controle financeiro pessoal desenvolvido em React com funcionalidades avançadas de análise e projeção.

## 🚀 Funcionalidades

### ✅ Funcionalidades Implementadas
- ✅ Inserção de receitas e despesas com categorização
- ✅ Cálculo automático de saldo atual
- ✅ Gráfico de pizza com distribuição de gastos por categoria
- ✅ Gráfico de barras comparando receitas vs despesas por mês
- ✅ Gráfico de linha mostrando evolução do saldo ao longo do tempo
- ✅ Estatísticas detalhadas (total mensal, economia, média semanal)
- ✅ Projeções de saldo para próximos 3 meses
- ✅ Alertas visuais para limites de gastos excedidos
- ✅ Dicas financeiras personalizadas
- ✅ Interface responsiva para desktop e mobile
- ✅ Persistência de dados no navegador (IndexedDB)
- ✅ Importação e exportação de dados em CSV

### 📊 Análises Disponíveis
- Distribuição de gastos por categoria
- Comparativo mensal de receitas vs despesas
- Evolução histórica do saldo
- Média de gastos semanais
- Categoria com maior gasto
- Projeções baseadas em médias históricas

## 🛠️ Tecnologias

- **React 18** - Framework principal
- **Tailwind CSS** - Estilização
- **Shadcn/UI** - Componentes de interface
- **Recharts** - Biblioteca de gráficos
- **Lucide React** - Ícones
- **Vite** - Build tool
- **IndexedDB** - Persistência local de dados

## 📁 Estrutura do Projeto

```
dashboard-financeiro/
├── public/
├── src/
│   ├── components/ui/     # Componentes Shadcn/UI
│   ├── App.jsx           # Componente principal
│   ├── App.css           # Estilos globais
│   └── main.jsx          # Ponto de entrada
├── MANUAL_USUARIO.md     # Manual do usuário
├── package.json
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou pnpm

### Instalação e Execução
```bash
# Clonar o repositório
git clone <url-do-seu-repositorio>
cd dashboard-financeiro

# Instalar dependências
npm install
# ou
pnpm install

# Executar em modo desenvolvimento
npm run dev
# ou
pnpm run dev

# Acessar no navegador
http://localhost:5173
```

### Build para Produção
```bash
npm run build
# ou
pnpm run build
```

## 💾 Armazenamento de Dados

Os dados são armazenados localmente no navegador usando **IndexedDB**:
- **Store**: `transactions`
- **Formato**: Array de objetos de transação
- **Persistência**: Dados mantidos entre sessões

### Estrutura de Dados
```javascript
{
  id: string,           // ID único da transação
  type: 'income' | 'expense',  // Tipo da transação
  amount: number,       // Valor da transação
  category: string,     // Categoria selecionada
  description: string,  // Descrição da transação
  date: string,         // Data no formato ISO
  createdAt: string     // Timestamp de criação
}
```

## 📤 Importação e Exportação de Dados (CSV)

- **Exportar:** Clique em "Exportar para CSV" para baixar todas as transações no formato compatível.
- **Importar:** Clique em "Importar de CSV" e selecione um arquivo `.csv` gerado pelo sistema ou com o mesmo padrão de colunas:

```
id,type,amount,category,description,date,createdAt
1750453067723,expense,1083,"Moradia","financiamento Caixa",2025-06-20,2025-06-20T20:57:47.723Z
```

> **Atenção:**
> - O arquivo deve ter exatamente o cabeçalho acima, separado por vírgulas.
> - Não edite o arquivo em editores que possam alterar o formato CSV.
> - Apenas novas transações (com IDs ainda não existentes) serão importadas.

## 🎨 Design e UX

### Cores e Temas
- **Receitas**: Verde (#00C49F)
- **Despesas**: Vermelho/Laranja (#FF8042)
- **Saldo Positivo**: Verde
- **Saldo Negativo**: Vermelho
- **Alertas**: Vermelho com fundo claro

### Responsividade
- Grid adaptativo para diferentes tamanhos de tela
- Componentes otimizados para touch em dispositivos móveis
- Gráficos responsivos que se ajustam ao container

## 📈 Algoritmos de Cálculo

### Projeções de Saldo
```javascript
// Média mensal baseada em dados históricos
avgMonthlyIncome = totalIncome / uniqueMonths
avgMonthlyExpenses = totalExpenses / uniqueMonths

// Projeção para próximos meses
projectedBalance = currentBalance + (avgIncome - avgExpenses) * months
```

### Alertas de Limite
```javascript
// Limite recomendado: 80% da receita mensal
spendingLimit = avgMonthlyIncome * 0.8
isOverLimit = monthlyExpenses > spendingLimit
```

### Média Semanal
```javascript
// Agrupamento por semana (domingo a sábado)
weeklyExpenses = groupByWeek(expenses)
avgWeeklyExpenses = sum(weeklyExpenses) / weekCount
```

## 🔧 Customização

### Adicionar Novas Categorias
Edite as arrays `incomeCategories` e `expenseCategories` em `App.jsx`:

```javascript
const incomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Nova Categoria']
const expenseCategories = ['Alimentação', 'Transporte', 'Nova Categoria']
```

### Modificar Cores dos Gráficos
Altere a array `COLORS` em `App.jsx`:

```javascript
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']
```

### Ajustar Limite de Gastos
Modifique o multiplicador em `calculateAdvancedStats()`:

```javascript
const spendingLimit = avgMonthlyIncome * 0.8  // 80% -> altere para o valor desejado
```

## 🚀 Melhorias Futuras

### Funcionalidades Planejadas
- [ ] Export/Import de dados (JSON)
- [ ] Metas financeiras personalizadas
- [ ] Relatórios em PDF
- [ ] Categorias customizáveis pelo usuário
- [ ] Filtros avançados por período
- [ ] Backup em nuvem
- [ ] Modo escuro
- [ ] Múltiplas moedas

### Melhorias Técnicas
- [ ] Migração para TypeScript completo
- [ ] Testes unitários e de integração
- [ ] PWA (Progressive Web App)
- [ ] Otimização de performance
- [ ] Acessibilidade (WCAG)

## 📝 Licença

Este projeto foi desenvolvido como uma solução personalizada para controle financeiro pessoal.

## 🤝 Contribuição

Para contribuir com melhorias:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📞 Suporte

Para dúvidas sobre uso, consulte o `MANUAL_USUARIO.md`.
Para questões técnicas, abra uma issue no repositório.

