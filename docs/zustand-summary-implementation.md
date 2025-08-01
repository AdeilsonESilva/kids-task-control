# Gerenciamento de Estado com Zustand - Summary

## Visão Geral

Implementação do gerenciamento de estado global com Zustand para `daily-summary` e `monthly-summary`, removendo a dependência de chamadas constantes para endpoints e melhorando a performance da aplicação.

## Estrutura

### Stores

- **`lib/stores/daily-summary-store.ts`**: Store para gerenciar estado do resumo diário
- **`lib/stores/monthly-summary-store.ts`**: Store para gerenciar estado do resumo mensal
- **`lib/stores/index.ts`**: Exportações centralizadas dos stores

### Hooks

- **`hooks/use-daily-summary.ts`**: Hook atualizado para usar o store do Zustand
- **`hooks/use-monthly-summary.ts`**: Hook atualizado para usar o store do Zustand
- **`hooks/use-summary-preloader.ts`**: Hook para pré-carregar dados de múltiplas crianças
- **`hooks/use-summary-invalidation.ts`**: Hook utilitário para invalidação de cache

### Providers

- **`components/summary-provider.tsx`**: Provider para inicializar dados globalmente
- **`components/root-provider.tsx`**: Provider raiz atualizado para incluir o SummaryProvider

## Funcionalidades

### Cache Inteligente

- Os dados são armazenados em cache por criança e data
- Evita requisições desnecessárias para dados já carregados
- Sistema de invalidação por criança ou data específica

### Inicialização Automática

- Dados são carregados automaticamente ao iniciar a aplicação
- Pré-carregamento para todas as crianças do dia atual e mês atual

### Compatibilidade

- Hooks mantêm a mesma interface que o React Query
- Componentes existentes continuam funcionando sem modificações

### Gerenciamento de Erros

- Tratamento de erros centralizado nos stores
- Exibição de toasts automáticos para erros
- Função de limpeza de erros

## Como Usar

### Hook Básico

```typescript
const { data, isLoading, error, refetch } = useDailySummary({
  selectedChild: "child-id",
  selectedDate: new Date(),
});
```

### Invalidação Manual

```typescript
const { invalidateChildSummaries } = useSummaryInvalidation();

// Invalida todos os dados de uma criança
invalidateChildSummaries("child-id");
```

### Pré-carregamento

```typescript
const { preloadSummaries } = useSummaryPreloader();

// Pré-carrega dados para múltiplas crianças
await preloadSummaries(["child-1", "child-2"]);
```

## Vantagens

1. **Performance**: Reduz chamadas desnecessárias para a API
2. **Cache**: Dados persistem entre navegações
3. **Sincronização**: Estado global sincronizado em toda aplicação
4. **Flexibilidade**: Fácil invalidação e atualização de dados
5. **Compatibilidade**: Migração transparente do React Query

## Fluxo de Dados

1. **Inicialização**: SummaryProvider carrega dados ao iniciar
2. **Cache**: Dados ficam em cache por chave (childId + date)
3. **Acesso**: Hooks retornam dados do cache se disponíveis
4. **Atualização**: Refetch força nova requisição e atualiza cache
5. **Invalidação**: Sistema permite limpeza seletiva do cache
