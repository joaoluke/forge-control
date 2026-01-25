# 🏗️ Arquitetura da Aplicação

## Estrutura Modular

O Forge Control foi estruturado com uma arquitetura modular e escalável, facilitando a adição de novas features.

## 📁 Estrutura de Diretórios

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.tsx      # Layout principal com sidebar
│   ├── Sidebar.tsx     # Menu de navegação lateral
│   └── LanguageSelector.tsx  # Seletor de idioma
├── pages/              # Páginas da aplicação
│   ├── Dashboard.tsx   # Página inicial (dashboard)
│   ├── Processes.tsx   # Gerenciamento de processos (FASE 1)
│   ├── Projects.tsx    # Scanner de projetos (FASE 2)
│   ├── Network.tsx     # Monitoramento de rede (FASE 4)
│   └── Settings.tsx    # Configurações e testes
├── locales/            # Arquivos de tradução
│   ├── pt.json        # Português
│   └── en.json        # English
├── lib/               # Utilitários
│   ├── logger.ts      # Sistema de logs
│   └── tauri.ts       # Wrapper para comandos Tauri
├── i18n.ts            # Configuração i18next
├── App.tsx            # Configuração de rotas
└── main.tsx           # Entry point

src-tauri/
├── src/
│   └── main.rs        # Backend Rust com comandos Tauri
├── Cargo.toml         # Dependências Rust
└── tauri.conf.json    # Configuração Tauri
```

## 🎨 Sistema de Navegação

### Sidebar Menu

O menu lateral (`Sidebar.tsx`) contém:
- **Logo e título** do aplicativo
- **Menu de navegação** com 5 seções:
  - 📊 Dashboard (página inicial)
  - ⚙️ Processos (FASE 1)
  - 📁 Projetos (FASE 2)
  - 🌐 Rede (FASE 4)
  - ⚙️ Configurações
- **Seletor de idioma** (PT/EN)
- **Footer** com informação da fase atual

### Rotas

```tsx
/ → Dashboard (página inicial)
/processes → Processos
/projects → Projetos
/network → Rede
/settings → Configurações
```

## 🧩 Componentes Principais

### Layout (`Layout.tsx`)

Componente wrapper que estrutura a aplicação:
- Sidebar fixa à esquerda
- Área de conteúdo principal à direita
- Usa `<Outlet />` do React Router para renderizar páginas

### Sidebar (`Sidebar.tsx`)

Menu de navegação lateral com:
- Links ativos destacados visualmente
- Ícones para cada seção
- Integração com i18n
- Design responsivo

### Dashboard (`Dashboard.tsx`)

Página inicial com:
- **Cards de informação do sistema** (OS, hostname, versão)
- **Visão geral do sistema** (CPU, memória, disco)
- **Ações rápidas** (botões para features principais)
- Carregamento automático de dados do sistema

## 🔄 Fluxo de Dados

### Frontend → Backend

```
Componente React
    ↓
invoke('comando', args)  // @tauri-apps/api/core
    ↓
Comando Rust (#[tauri::command])
    ↓
Retorna Result<T, String>
    ↓
Componente React (atualiza estado)
```

### Exemplo

```tsx
// Frontend
const info = await invoke<SystemInfo>('get_system_info');

// Backend (Rust)
#[tauri::command]
fn get_system_info() -> Result<SystemInfo, String> {
    // Lógica...
}
```

## 🌍 Internacionalização

Sistema i18n integrado em toda a aplicação:
- Detecção automática de idioma
- Persistência no localStorage
- Traduções organizadas por contexto
- Fácil adição de novos idiomas

## 🎯 Páginas

### Dashboard (Implementada)
- Visão geral do sistema
- Cards informativos
- Ações rápidas
- Gráficos de recursos (mockup)

### Processes (Placeholder - FASE 1)
- Lista de processos
- Monitoramento de CPU/memória
- Gerenciamento de processos

### Projects (Placeholder - FASE 2)
- Scanner de repositórios Git
- Status de projetos
- Atalhos para abrir no editor

### Network (Placeholder - FASE 4)
- Informações de rede
- WiFi management
- Dispositivos conectados

### Settings (Implementada)
- Teste de comunicação frontend/backend
- Configurações futuras

## 🚀 Próximos Passos

### FASE 1 - Sistema & Processos
1. Implementar listagem de processos em Rust
2. Criar tabela de processos no frontend
3. Adicionar filtros e ordenação
4. Implementar função de encerrar processo

### FASE 2 - Projetos & Git
1. Scanner de diretórios
2. Detecção de repositórios Git
3. Exibição de status e branches
4. Integração com VS Code

## 📝 Convenções de Código

### Componentes
- Usar PascalCase para nomes
- Um componente por arquivo
- Exportar como named export

### Páginas
- Sempre em `src/pages/`
- Nome descritivo e singular
- Usar hooks do React

### Traduções
- Organizar por contexto/feature
- Chaves em camelCase
- Manter PT e EN sincronizados

### Comandos Rust
- Usar snake_case
- Sempre retornar `Result<T, String>`
- Documentar com comentários

---

**Arquitetura preparada para crescimento modular e manutenível!** 🎉
