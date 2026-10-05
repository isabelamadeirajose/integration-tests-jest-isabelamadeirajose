# API test automation with Jest and PactumJS

> Simple integration between JestJS and PactumJS.

## GitHub Actions

[![Node.js CI](https://github.com/isabelamadeirajose/integration-tests-jest-isabelamadeirajose/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/isabelamadeirajose/integration-tests-jest-isabelamadeirajose/actions/workflows/node.js.yml)

## SonarCloud

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=isabelamadeirajose_integration-tests-jest-isabelamadeirajose&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=isabelamadeirajose_integration-tests-jest-isabelamadeirajose)
# Getting Started

### Pactum docs:
 - [PactumJS](https://pactumjs.github.io/)

### Prerequisites:
 - NodeJS `v22`

### How to run?

Inside of the project folder run:

 1. `npm install --save-dev`
 1. `npm run ci`

After that you should see a `./output` folder with some `HTML` reports.

### Docs to Api under tests: 
 - [Dummyjson](https://dummyjson.com/docs)
 - [Gorest](https://gorest.co.in/)
 - [Toolshop API](https://api.practicesoftwaretesting.com/api/documentation)
 - [Deck of Cards](https://deckofcardsapi.com/)
 - [JSON placeholder](https://jsonplaceholder.typicode.com/)
 - [http bin](http://httpbin.org/)
 - [rick and morty api](https://rickandmortyapi.com/documentation/#rest)
 - [Petstore](https://petstore.swagger.io/#/) 
 - [ServeRest](https://serverest.dev/#/)
 - [ServeRest - Datadog](https://p.datadoghq.eu/sb/421fcfee-35ec-11ee-b87f-da7ad0900005-2aaf85264a89d11b7001bcab452a266e?refresh_mode=sliding&theme=light&tpl_var_env%5B0%5D=serverest.dev&from_ts=1699931511294&to_ts=1699932411294&live=true)

 ## API sob teste

[Restful-Booker](https://restful-booker.herokuapp.com/apidoc) — API pública de reservas de hotel com CRUD completo.

Arquivo de testes: `test/restful_booker.spec.ts`

## Cenários de teste

| # | Cenário | Método / Rota | Resultado esperado |
|---|---------|---------------|--------------------|
| 1 | Health check da API | GET `/ping` | 201 Created |
| 2 | Gerar token com credenciais inválidas | POST `/auth` | 200 com `reason: "Bad credentials"` |
| 3 | Criar reserva com dados válidos | POST `/booking` | 200, retorna `bookingid` e os dados enviados (validado com JSON Schema) |
| 4 | Listar reservas | GET `/booking` | 200, array de objetos com `bookingid` |
| 5 | Buscar reserva criada pelo id | GET `/booking/{id}` | 200, nome, sobrenome e preço iguais aos enviados |
| 6 | Atualizar reserva inteira com token | PUT `/booking/{id}` | 200, preço e `additionalneeds` alterados |
| 7 | Atualizar parcialmente com token | PATCH `/booking/{id}` | 200, `firstname` alterado |
| 8 | Atualizar sem token | PUT `/booking/{id}` | 403 Forbidden |
| 9 | Excluir reserva com token | DELETE `/booking/{id}` | 201 Created |
| 10 | Buscar reserva já excluída | GET `/booking/{id}` | 404 Not Found |

O token é gerado no `beforeAll` (POST `/auth` com as credenciais de teste da API) e enviado no header `Cookie: token=...`. Os dados da reserva são gerados com Faker a cada execução.
