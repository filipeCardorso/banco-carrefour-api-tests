# Banco Carrefour — Automação de Testes de API

![API Tests](https://github.com/filipeCardorso/banco-carrefour-api-tests/actions/workflows/api-tests.yml/badge.svg)

Testes automatizados para a API ServeRest, cobrindo CRUD de usuários, autenticação JWT, validação de contrato, segurança e idempotência.

## Stack Tecnológica

| Componente | Ferramenta |
|---|---|
| Linguagem | JavaScript (ES6+) |
| Framework de Testes | Jest |
| HTTP Client | SuperTest |
| Dados Fake | @faker-js/faker |
| Validação de Contrato | jest-json-schema |
| Relatórios | jest-html-reporters + jest-junit |
| CI/CD | GitHub Actions |
| Ambiente Local | Docker Compose |

## Pré-requisitos

- Node.js 20+
- npm 9+
- Docker e Docker Compose (opcional, para ambiente local)

## Instalação

```bash
git clone https://github.com/filipeCardorso/banco-carrefour-api-tests.git
cd banco-carrefour-api-tests
npm install
cp .env.example .env
```

## Execução dos Testes

### Modo 1 — API pública (padrão)

```bash
npm test
```

Executa contra `https://serverest.dev`.

### Modo 2 — Ambiente local isolado (Docker)

```bash
docker-compose up --abort-on-container-exit
```

Sobe a ServeRest localmente e executa os testes em containers isolados. Zero dependência de API externa.

### Executar suites específicas

```bash
npm run test:login        # Testes de autenticação
npm run test:users        # Testes CRUD de usuários
npm run test:contracts    # Testes de validação de contrato
npm run test:security     # Testes de segurança e autenticação
npm run test:idempotency  # Testes de idempotência
```

## Estrutura do Projeto

```
├── src/
│   ├── config/           # Variáveis de ambiente e constantes
│   ├── services/         # Service Objects (encapsulam chamadas HTTP)
│   ├── factories/        # Factory Pattern (geração de dados de teste)
│   ├── schemas/          # JSON Schemas (validação de contrato)
│   └── utils/            # Request wrapper e helpers de cleanup
├── tests/
│   ├── auth/             # Testes de login
│   ├── users/            # Testes CRUD (criar, listar, buscar, atualizar, deletar)
│   ├── contracts/        # Testes de contrato (validação de schema)
│   ├── security/         # Testes de autenticação e método HTTP
│   └── idempotency/      # Testes de idempotência (DELETE e PUT)
├── reports/              # Relatórios gerados (HTML + JUnit XML)
├── .github/workflows/    # Pipeline CI/CD
├── docker-compose.yml    # Ambiente local com ServeRest
└── Dockerfile
```

## Cenários de Teste

### POST /login (7 cenários)
- Login válido, email não cadastrado, senha incorreta, campos obrigatórios, formato de email inválido

### POST /usuarios (13 cenários)
- Criação, validação de campos, email duplicado, SQL injection, XSS, payload gigante, Content-Type inválido

### GET /usuarios (4 cenários)
- Listagem completa, filtros por query params, query param desconhecido

### GET /usuarios/{_id} (3 cenários)
- Busca por ID, ID inexistente, ID com formato inválido

### PUT /usuarios/{_id} (10 cenários)
- Atualização, criação via PUT, email duplicado, próprio email, segurança (SQL injection, XSS)

### DELETE /usuarios/{_id} (3 cenários)
- Exclusão, ID inexistente, usuário com carrinho ativo

### Contrato (9 cenários)
- Validação de JSON Schema para todas as respostas de sucesso e erro

### Autenticação (3 cenários)
- Token ausente, token inválido, token expirado (via endpoint /carrinhos)

### Idempotência (2 cenários)
- DELETE e PUT consecutivos no mesmo recurso

### Segurança (1 cenário)
- Método HTTP não suportado (PATCH → 405)

**Total: 55 cenários de teste**

## Padrões de Projeto

- **Service Object** — encapsula chamadas HTTP por recurso
- **Factory Pattern** — gera payloads de teste com dados dinâmicos
- **Data-Driven Testing** — `describe.each` para cenários parametrizados
- **Constantes Centralizadas** — mensagens da API definidas em um único lugar

## Relatórios

Após execução, os relatórios ficam em `reports/`:
- `report.html` — relatório visual HTML
- `junit.xml` — formato JUnit para integração com CI

Na pipeline do GitHub Actions, os relatórios são enviados como artefato e exibidos inline no PR via test-reporter.

## Pipeline CI/CD

A pipeline executa automaticamente em:
- Push para `main` ou `develop`
- Pull requests para `main`
- Execução manual (workflow_dispatch)

## Decisões Técnicas

- **`--runInBand`**: Testes executam em série para evitar interferência entre specs que criam/deletam dados na mesma API compartilhada.
- **Endpoints `/usuarios` não requerem token JWT**: Descoberto durante exploração da API. Testes de autenticação foram direcionados ao endpoint `/carrinhos` que de fato exige token.
- **Testes de segurança validam ausência de efeito colateral**: A ServeRest aceita payloads com SQL injection e XSS (201). Os testes verificam que a API continua íntegra após a injeção.
- **Rate limiting não implementado**: A ServeRest não implementa rate limiting na API pública, portanto testes de rate limit foram intencionalmente omitidos.
