# Dashboard Financeiro Pessoal - Manual do Usuário

## Visão Geral
O Dashboard Financeiro Pessoal é uma aplicação web completa para controle de finanças pessoais, desenvolvida com React e tecnologias modernas. Permite gerenciar receitas, despesas, visualizar gráficos interativos e obter insights sobre seus hábitos financeiros.

## Funcionalidades Principais

### 1. Resumo Financeiro (Cards Principais)
- **Saldo Atual**: Mostra o saldo total (receitas - despesas)
- **Receitas do Mês**: Total de receitas do mês atual
- **Despesas do Mês**: Total de despesas do mês atual
- **Economia do Mês**: Diferença entre receitas e despesas mensais

### 2. Adicionar Transações
**Como usar:**
1. Clique na aba "Adicionar Transação"
2. Selecione o tipo: Receita ou Despesa
3. Insira o valor (apenas números)
4. Escolha uma categoria apropriada
5. Selecione a data (padrão: hoje)
6. Adicione uma descrição
7. Clique em "Adicionar Transação"

**Categorias disponíveis:**
- **Receitas**: Salário, Freelance, Investimentos, Outros
- **Despesas**: Alimentação, Transporte, Moradia, Saúde, Lazer, Educação, Outros

### 3. Histórico de Transações
- Visualize todas as transações em ordem cronológica
- Cada transação mostra: descrição, categoria, data e valor
- Cores diferentes para receitas (verde) e despesas (vermelho)

### 4. Análises e Gráficos
**Gráfico de Pizza**: Distribuição de gastos por categoria
- Mostra percentual de cada categoria de despesa
- Cores diferentes para cada categoria

**Gráfico de Barras**: Receitas vs Despesas por mês
- Compare receitas e despesas mensais
- Visualize tendências ao longo do tempo

**Gráfico de Linha**: Evolução do saldo
- Acompanhe como seu saldo mudou ao longo do tempo
- Cada ponto representa uma transação

### 5. Estatísticas Avançadas
- **Total de Transações**: Número total de transações registradas
- **Médias Mensais**: Média de receitas e despesas por mês
- **Média Semanal de Gastos**: Quanto você gasta em média por semana
- **Categoria com Maior Gasto**: Identifica onde você mais gasta

### 6. Projeções e Alertas
**Projeções de Saldo**: 
- Estimativa do saldo para os próximos 3 meses
- Baseada na média histórica de receitas e despesas

**Alertas Visuais**:
- Aviso quando gastos excedem 80% da receita mensal
- Dicas personalizadas baseadas no seu perfil financeiro

**Dicas Financeiras**:
- Sugestões automáticas baseadas nos seus dados
- Alertas para saldo negativo ou gastos excessivos

## Como Começar

### 1. Primeira Utilização
1. Acesse o dashboard no navegador
2. Comece adicionando suas receitas mensais (salário, freelances, etc.)
3. Registre suas despesas principais
4. Explore as análises na aba "Análises"

### 2. Uso Diário
- Registre transações conforme elas acontecem
- Verifique o saldo atual regularmente
- Consulte as análises semanalmente para insights

### 3. Planejamento Mensal
- Revise as projeções de saldo
- Analise as categorias com maiores gastos
- Ajuste seus hábitos baseado nas dicas financeiras

## Armazenamento de Dados
- Todos os dados são salvos localmente no seu navegador
- Os dados persistem entre sessões
- Para backup, você pode exportar os dados (funcionalidade futura)

## Dicas de Uso
1. **Seja consistente**: Registre todas as transações para análises precisas
2. **Use categorias corretas**: Isso melhora a qualidade dos gráficos
3. **Verifique regularmente**: Consulte as análises para tomar decisões informadas
4. **Defina metas**: Use as projeções para planejar objetivos financeiros

## Tecnologias Utilizadas
- **Frontend**: React com TypeScript
- **Estilização**: Tailwind CSS + Shadcn/UI
- **Gráficos**: Recharts
- **Armazenamento**: LocalStorage
- **Responsividade**: Compatível com desktop e mobile

## Suporte e Melhorias Futuras
O dashboard foi desenvolvido com foco na usabilidade e pode ser expandido com:
- Backup e sincronização em nuvem
- Metas financeiras personalizadas
- Relatórios em PDF
- Integração com bancos
- Categorias customizáveis

## Resolução de Problemas
- **Dados não salvam**: Verifique se o JavaScript está habilitado
- **Gráficos não aparecem**: Adicione algumas transações primeiro
- **Layout quebrado**: Atualize a página ou limpe o cache do navegador

