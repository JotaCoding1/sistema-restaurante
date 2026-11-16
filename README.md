# Restaurante: Monolito Modular por Domínio - Trabalho Arquitetura de Software: Estilos arquiteturais

Sistema de atendimento de salão para restaurante, desenvolvido como trabalho da disciplina de Arquitetura de Software. O objetivo não é a quantidade de funcionalidades, e sim demonstrar o estilo arquitetural **Monolito Modular por Domínio**: um único processo, dividido em módulos com fronteiras explícitas.

## O que o sistema faz

O garçom abre a mesa e lança pedidos, a cozinha prepara, o caixa recebe o pagamento e a mesa é liberada.

| Papel | O que faz |
| --- | --- |
| `WAITER` (garçom) | Abre mesas, cria pedidos, vê pedidos prontos e marca como entregues |
| `COOK` (cozinheiro) | Vê a fila e marca pedidos como preparando e prontos |
| `CASHIER` (caixa) | Vê a conta da mesa e registra o pagamento |
| `MANAGER` (gerente) | Cadastra funcionários, mesas e itens do cardápio; acessa todas as páginas |

## Arquitetura

O back-end é um único processo Node.js dividido em módulos por domínio. Cada módulo é dono do seu próprio arquivo JSON em `data/` e só é acessado pelos outros através do seu `index.js`.

| Módulo | Responsabilidade | Depende de |
| --- | --- | --- |
| `identity` | Funcionários, login, papéis | nenhum |
| `tables` | Mesas e sessões de atendimento | nenhum |
| `menu` | Cardápio e preços | nenhum |
| `orders` | Pedidos | `tables`, `menu` |
| `kitchen` | Fila e status de preparo | `orders` |
| `payments` | Conta e pagamento (fecha a mesa) | `orders`, `tables` |

Regras da arquitetura:

1. Um módulo só importa outro pelo `index.js` dele.
2. Cada módulo só abre o próprio arquivo JSON (pelo `repository`).
3. `identity`, `tables` e `menu` não dependem de nenhum outro módulo.
4. `shared` não importa módulos.
5. Não há dependências circulares.

Requisitos e diagramas estão na pasta `docs/`.

## Tecnologias

- Node.js 20+ e Express (única dependência)
- Armazenamento em arquivos JSON
- Front-end em HTML, CSS e JavaScript puro (pasta `public/`)

## Como rodar

Pré-requisitos: [Node.js](https://nodejs.org) 20 ou superior e [Git](https://git-scm.com).

```bash
git clone <URL-DO-REPOSITORIO>
cd restaurante
npm install
npm run seed     # cria os dados de exemplo em data/
npm start        # http://localhost:3000
```

Abra `http://localhost:3000` no navegador. Para desenvolver com recarga automática, use `npm run dev`. Para trocar a porta, defina a variável `PORT` antes de iniciar.

### Usuários de exemplo (criados pelo `seed`)

| Papel | E-mail | Senha |
| --- | --- | --- |
| Gerente | `gerente@restaurante.local` | `123456` |
| Garçom | `garcom@restaurante.local` | `123456` |
| Cozinheiro | `cozinha@restaurante.local` | `123456` |
| Caixa | `caixa@restaurante.local` | `123456` |

Para voltar aos dados iniciais, rode `npm run seed` de novo (ele apaga e recria a pasta `data/`).

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm start` | Inicia o servidor |
| `npm run dev` | Inicia com recarga automática |
| `npm run seed` | Recria os dados de exemplo |

## Estrutura do repositório

```text
restaurante/
  package.json
  data/                  # arquivos JSON, um por módulo (gerado pelo seed)
  docs/                  # requisitos e diagramas
  public/                # front-end: páginas HTML, css, js
  src/
    server.js  app.js  seed.js
    shared/              # jsonStore, roles, errors, allowRoles
    modules/
      identity/ tables/ menu/ orders/ kitchen/ payments/
        index.js         # interface pública do módulo
        *.routes.js  *.service.js  *.repository.js
```

## Branches

```text
Foi criada a branch "development" para ser utilizada como a branch principal de desenvolvimento.
```

## Problemas comuns

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| Erro ao iniciar com `--watch` ou módulo não encontrado | Node mais antigo que 20 ou falta de `npm install` | Atualizar o Node e rodar `npm install` |
| Login não funciona | Seed não foi executado | `npm run seed` |
| Tela pede login de novo | Servidor reiniciou (as sessões ficam em memória) | Entrar novamente |
| Porta 3000 em uso | Outro processo na porta | Fechar o processo ou definir `PORT` |
