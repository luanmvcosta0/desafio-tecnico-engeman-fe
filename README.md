# Desafio Técnico Engeman - Frontend

Aplicação frontend para gestão e busca de imóveis, desenvolvida como desafio técnico da Engeman. Permite autenticação de usuários com diferentes papéis (administrador, corretor e cliente), cadastro/edição de imóveis, filtros de busca, paginação e favoritos.

## Sumário

- [Stack](#stack)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar](#como-rodar)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Rotas](#rotas)
- [Autenticação](#autenticação)
- [Configuração da API](#configuração-da-api)

## Stack

- **React 19** + **TypeScript**
- **Vite** — build tool e dev server
- **React Router 7** — roteamento (com rotas privadas)
- **Tailwind CSS 4** — estilização
- **Radix UI / shadcn** — componentes de UI acessíveis
- **Axios** — cliente HTTP
- **Lucide React** — ícones
- **ESLint** — linting

## Funcionalidades

- Autenticação (login e cadastro) com token JWT
- Controle de acesso por papel do usuário:
  - `ADMIN` / `BROKER`: podem cadastrar, editar e ativar/inativar imóveis
  - `CUSTOMER`: pode favoritar imóveis (favoritos salvos localmente por usuário)
- Listagem de imóveis com paginação
- Filtros de busca por nome, tipo, faixa de preço e número de quartos (com debounce)
- Cópia rápida da tabela de imóveis para a área de transferência

## Pré-requisitos

- Docker e Docker Compose
- Uma API backend rodando em `http://localhost:8080` (endpoints `/auth/login`, `/auth/register`, `/property/...`). Clone o repositório [desafio-tecnico-engeman-be](https://github.com/luanmvcosta0/desafio-tecnico-engeman-be) e siga as instruções de execução por lá.

## Como rodar

```bash
docker compose up --build
```

Isso constrói a imagem (Node 24 Alpine) e sobe o servidor de desenvolvimento em `http://localhost:5173`.

## Estrutura do projeto

```
src/
├── components/
│   ├── auth/          # Formulários de login e cadastro
│   ├── properties/    # Diálogos de criação/edição de imóveis
│   └── ui/            # Componentes de UI genéricos (shadcn/radix)
├── contexts/
│   └── AuthProvider.tsx   # Contexto de autenticação (login, registro, logout)
├── interfaces/         # Tipos TypeScript (User, Property, AuthContextType)
├── lib/
│   ├── jwt.ts          # Decodificação de JWT
│   └── utils.ts
├── pages/
│   ├── HomePage.tsx     # Listagem/filtros/paginação de imóveis
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── routes/
│   ├── AppRoutes.tsx    # Definição das rotas
│   └── PrivateRoute.tsx # Guard de rotas autenticadas
└── services/
    ├── authService.ts     # Chamadas HTTP de autenticação
    └── propertyService.ts # Chamadas HTTP de imóveis
```

## Rotas

| Rota        | Acesso  | Descrição                   |
| ----------- | ------- | --------------------------- |
| `/login`    | Público | Tela de login               |
| `/cadastro` | Público | Tela de cadastro de usuário |
| `/`         | Privado | Painel principal (imóveis)  |

## Autenticação

Após o login, o token JWT retornado pela API é armazenado em `localStorage` (`token`), junto com os dados do usuário (`user`). O papel (`role`) é extraído diretamente do payload do token e usado para controlar as permissões de UI (ex.: exibir ações de gerenciamento de imóveis). O `axios` injeta automaticamente o header `Authorization: Bearer <token>` nas requisições de imóveis.

## Configuração da API

A URL base da API está definida diretamente em `src/services/authService.ts` e `src/services/propertyService.ts` (`http://localhost:8080`). Ajuste esse valor caso a API esteja em outro endereço.
