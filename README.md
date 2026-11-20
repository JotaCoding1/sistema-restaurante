# Restaurante: Monolito Modular por Domínio - Trabalho Arquitetura de Software: Estilos arquiteturais

Sistema de atendimento de salão para restaurante, desenvolvido como trabalho da disciplina de Arquitetura de Software. O objetivo não é a quantidade de funcionalidades, e sim demonstrar o estilo arquitetural **Monolito Modular por Domínio**: um único processo, dividido em módulos com fronteiras explícitas.

## O que o sistema faz

O garçom abre a mesa e lança pedidos, a cozinha prepara, o caixa recebe o pagamento e a mesa é liberada.

| Papel | O que faz |
| --- | --- |
| `WAITER` (garçom) | Abre mesas, cria pedidos, vê pedidos prontos e marca como entregues |
| `COOK` (cozinheiro) | Vê a fila e marca pedidos como preparando e prontos |
| `CASHIER` (caixa) | Vê a conta da mesa e registra o pagamento |

## Arquitetura

O back-end é um único processo Node.js dividido em módulos por domínio. Cada módulo é dono do seu próprio arquivo JSON em `data/` e só é acessado pelos outros através do seu `index.js`.

| Módulo | Responsabilidade | Depende de |
| --- | --- | --- |
| `identity` | Funcionários, login simples, papéis | nenhum |
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
| Garçom (Lucas Ferreira) | `garcom@restaurante.local` | `123456` |
| Cozinha (Ana Ribeiro) | `cozinha@restaurante.local` | `123456` |
| Caixa (Beatriz Lima) | `caixa@restaurante.local` | `123456` |

O seed também cria 12 mesas, 8 itens no cardápio e um cenário de demonstração:
a Mesa 02 tem dois pedidos entregues (subtotal de cada pedido x total da conta)
e as mesas 04, 05, 08 e 09 têm pedidos em etapas diferentes da cozinha.

Para voltar aos dados iniciais, rode `npm run seed` de novo (ele apaga e recria a pasta `data/`).

As rotas da API usam uma autenticação simples. Envie o e-mail do usuário no header `X-User-Email`. Todos os usuários usam a senha fixa
`123456` no login.

## API principal

Todas as rotas abaixo, exceto `/api/login`, exigem o header `X-User-Email`.

### Menu

| Método | Rota | Permissão | Descrição |
| --- | --- | --- | --- |
| `GET` | `/api/menu` | autenticado | Lista os itens do cardápio |
| `GET` | `/api/menu/:id` | autenticado | Consulta um item |
| `POST` | `/api/menu` | `COOK`, `CASHIER` | Cria um item |

O corpo da criação de um item deve conter `name` e `price`:

```json
{
  "name": "Pizza Margherita",
  "price": 42.9
}
```

### Pedidos

| Método | Rota | Permissão | Descrição |
| --- | --- | --- | --- |
| `GET` | `/api/orders` | autenticado | Lista pedidos; aceita `?status=PENDING` |
| `GET` | `/api/orders/:id` | autenticado | Consulta um pedido |
| `POST` | `/api/orders` | `WAITER` | Cria um pedido para uma mesa aberta |
| `POST` | `/api/orders/:id/deliver` | `WAITER` | Marca um pedido pronto como entregue |

Para criar um pedido, informe a mesa e os itens do cardápio:

```json
{
  "tableId": 1,
  "items": [
    {
      "itemId": 1,
      "quantity": 2
    }
  ]
}
```

Os pedidos seguem os status `PENDING`, `PREPARING`, `READY`, `DELIVERED` e
`CANCELLED`. A cozinha altera os status de preparo pelas rotas do módulo
`kitchen`; o garçom pode entregar somente pedidos com status `READY`.

## Front-end: Monolito Modular

O front-end segue o mesmo estilo do back-end: uma única aplicação (HTML, CSS e
JavaScript puro com módulos ES nativos, sem build), dividida em **módulos por
domínio** com fronteiras explícitas.

O front-end fica em **duas pastas**, servidas pelo Express no mesmo endereço
(`src/app.js`). Por isso os caminhos no navegador continuam `/app/...`, e um
arquivo de `telas` importa um de `base` normalmente.

```text
public/
  base/                  # parte 1 — fundação (funciona sozinha: login)
    index.html
    img/
    app/
      shared/            # infraestrutura sem regra de negócio
        http.js  events.js  dom.js  format.js  icons.js  layout.js
        styles/base.css
      modules/
        identity/  tables/  menu/      # módulos sem dependências
      pages/login.page.js
  telas/                 # parte 2 — domínios dependentes e telas dos perfis
    garcom.html  cozinha.html  caixa.html
    app/
      modules/
        reservations/  orders/  kitchen/  payments/
      pages/             # salao, cozinha e caixa (+ CSS de layout)
```

Cada módulo segue o mesmo formato: `index.js` (interface pública),
`<módulo>.api.js` (único arquivo que chama `/api/<módulo>`), `.model.js`,
`.view.js` e `.css`.

| Módulo | Pasta | Responsabilidade | Depende de |
| --- | --- | --- | --- |
| `identity` | `base` | Sessão, login, papéis, topo do usuário | nenhum |
| `tables` | `base` | Mesas, status Livre/Ocupada, cartões de mesa | nenhum |
| `menu` | `base` | Cardápio, preços, cadastro de itens | nenhum |
| `reservations` | `telas` | Reservas do dia (dados de demonstração) | `tables` |
| `orders` | `telas` | Pedidos, subtotais, novo pedido, entrega | `menu` |
| `kitchen` | `telas` | Fila Pendente → Em preparo → Enviado | `orders`, `tables` |
| `payments` | `telas` | Conta da mesa, forma de pagamento, fechamento | `orders`, `tables` |

| Página | Perfil | Compõe |
| --- | --- | --- |
| `login.page.js` | todos | `identity` |
| `salao.page.js` | Garçom | `identity`, `tables`, `reservations`, `orders` |
| `cozinha.page.js` | Cozinha | `identity`, `kitchen`, `menu` |
| `caixa.page.js` | Caixa | `identity`, `payments` |

Regras da arquitetura do front-end:

1. Um módulo só importa outro pelo `index.js` dele; páginas também.
2. Só o `*.api.js` de cada módulo chama a API, e apenas as rotas do próprio domínio.
3. `shared` não importa módulos nem páginas (a autenticação é injetada por `identity` via `configureHttp`).
4. Não há dependências circulares; páginas não são importadas por ninguém.
5. Módulos avisam o que aconteceu por eventos (`orders:created`, `payments:paid`…); a página decide o que recarregar.
6. Cada módulo é dono do próprio CSS; a página carrega o CSS dos módulos que usa.
7. `base` nunca depende de `telas`: a parte 1 funciona sozinha.

As regras são verificadas automaticamente:

```bash
npm run check:front
```

### Commit em duas partes

```bash
# Parte 1 — fundação: shared, identity, tables, menu, login
git rm public/index.html public/css/style.css public/js/api.js
git add public/base src/app.js src/seed.js src/modules/menu/menu.routes.js \
        scripts/check-front-architecture.js package.json package-lock.json
git commit -m "Front-end parte 1: base do monolito modular (shared, identity, tables, menu e login)"

# Parte 2 — domínios dependentes e telas de garçom, cozinha e caixa
git rm public/garcom.html public/cozinha.html public/caixa.html
git add public/telas README.md
git commit -m "Front-end parte 2: reservations, orders, kitchen, payments e telas dos perfis"
```

O caixa só fecha a mesa quando todos os pedidos estão entregues: o garçom
confirma a entrega dos pedidos marcados como *Enviado* pela cozinha. As telas se
atualizam a cada 5 s, então o que um perfil faz aparece nos outros.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm start` | Inicia o servidor |
| `npm run dev` | Inicia com recarga automática |
| `npm run seed` | Recria os dados de exemplo |
| `npm run check:front` | Verifica as regras de arquitetura do front-end |

## Estrutura do repositório

```text
restaurante/
  package.json
  data/                  # arquivos JSON, um por módulo (gerado pelo seed)
  docs/                  # requisitos e diagramas
  public/                # front-end: base/ (parte 1) e telas/ (parte 2)
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
| API retorna 401 | O header `X-User-Email` não foi enviado ou não corresponde a um usuário | Enviar o e-mail de um usuário criado pelo seed |
| Porta 3000 em uso | Outro processo na porta | Fechar o processo ou definir `PORT` |
| Página em branco ao abrir o HTML com duplo clique | Módulos ES só rodam servidos por HTTP | Rodar `npm start` e abrir `http://localhost:3000` |
