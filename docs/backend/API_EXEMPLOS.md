# Exemplos da API - UrbanLink Flow

## 1. Convenções

Base local:

```text
http://localhost:3333/api
```

Documentação interativa:

```text
http://localhost:3333/api/docs
```

Os exemplos usam UUIDs ilustrativos. Substitua-os pelos IDs retornados pelo seed
ou pelas requisições de criação. Em PowerShell, use `curl.exe` para evitar o alias
histórico de `Invoke-WebRequest`.

Cabeçalhos para rotas privadas:

```http
Authorization: Bearer <JWT>
Content-Type: application/json
Accept: application/json
```

A API devolve `X-Request-Id` em todas as respostas. O cliente pode enviar esse
cabeçalho para manter um identificador próprio ou usar o UUID gerado pelo servidor.

Envelope de sucesso:

```json
{
  "success": true,
  "data": {}
}
```

Coleções paginadas incluem:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

Nos agregados que preservam histórico, `DELETE` é semântico: usuários e veículos
são inativados, entregas e rotas são canceladas. Centros e simulações sem bloqueio
de integridade podem ser removidos fisicamente.

## 2. Preparar variáveis para os exemplos

Bash, Git Bash ou WSL:

```bash
export API_URL="http://localhost:3333/api"
export TOKEN="<cole-o-token-do-login>"
export VEHICLE_ID="<uuid-do-veiculo>"
export CENTER_ID="<uuid-do-centro>"
export DELIVERY_ID="<uuid-da-entrega>"
export ROUTE_ID="<uuid-da-rota>"
export STOP_ID="<uuid-da-parada>"
export SIMULATION_ID="<uuid-da-simulacao>"
```

PowerShell:

```powershell
$env:API_URL = "http://localhost:3333/api"
$env:TOKEN = "<cole-o-token-do-login>"
$env:VEHICLE_ID = "<uuid-do-veiculo>"
$env:CENTER_ID = "<uuid-do-centro>"
$env:DELIVERY_ID = "<uuid-da-entrega>"
$env:ROUTE_ID = "<uuid-da-rota>"
$env:STOP_ID = "<uuid-da-parada>"
$env:SIMULATION_ID = "<uuid-da-simulacao>"
```

## 3. Autenticação

### Login

`POST /auth/login`

```bash
curl -sS -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@urbanlink.local",
    "password": "UrbanLink@2026"
  }'
```

Resposta `200 OK`:

```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "expiresIn": "8h",
    "user": {
      "id": "b6da7a62-b8c8-47e7-b6f3-a7aa7bc55528",
      "name": "Administrador UrbanLink",
      "email": "admin@urbanlink.local",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  }
}
```

### Usuário autenticado

`GET /auth/me`

```bash
curl -sS "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

O objeto retornado nunca contém `passwordHash`.

### Sessão do site (cookie)

O login também grava o token no cookie `urbanlink_session` (httpOnly, SameSite=Lax).
O site usa só o cookie; com `curl`, dá pra guardar e reusar com `-c` e `-b`:

```bash
curl -sS -c sessao.txt -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@urbanlink.local","password":"UrbanLink@2026","remember":true}'

curl -sS -b sessao.txt "$API_URL/auth/me"

curl -sS -b sessao.txt -c sessao.txt -X POST "$API_URL/auth/logout" -i
```

`remember: true` faz o cookie durar até o token vencer; sem ele, o cookie some ao
fechar o navegador. `POST /auth/logout` responde `204` e apaga o cookie.

### Recuperar senha

```bash
curl -sS -X POST "$API_URL/auth/password-reset/request" \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@urbanlink.local"}'
```

Responde `202` exista ou não a conta. Fora de produção, o link aparece no terminal
da API:

```text
[recuperar senha] Link de senha nova pra manager@urbanlink.local (vale 30 min): http://localhost:5173/nova-senha/<token>
```

```bash
curl -sS -X POST "$API_URL/auth/password-reset/confirm" \
  -H "Content-Type: application/json" \
  -d '{"token":"<token>","password":"SenhaNova@2026"}' -i
```

`204` troca a senha e queima o link. Link inexistente, usado ou vencido dá
`400 INVALID_RESET_TOKEN`.

### Site público: rastreio e contato

Sem autenticação:

```bash
curl -sS "$API_URL/public/tracking/ULF-2026-0009"

curl -sS -X POST "$API_URL/public/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana Souza","email":"ana@example.com","subject":"ORCAMENTO","message":"Quero um orçamento pra 40 entregas por dia.","consent":true}'
```

O rastreio devolve o estado, o prazo e o histórico (`events`, com a cidade de cada
etapa); o contato devolve `201` com o `protocol` gerado pelo banco (ex.:
`ULS20260001`).

## 4. CRUD de veículos

### Listar, buscar e filtrar

`GET /vehicles?page=1&pageSize=20&search=ABC&status=AVAILABLE&sortBy=plate&sortOrder=asc`

```bash
curl -sS \
  "$API_URL/vehicles?page=1&pageSize=20&search=ABC&status=AVAILABLE&sortBy=plate&sortOrder=asc" \
  -H "Authorization: Bearer $TOKEN"
```

### Criar

`POST /vehicles`

```bash
curl -sS -X POST "$API_URL/vehicles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plate": "TCC2A26",
    "model": "Van elétrica urbana",
    "type": "VAN",
    "capacityKg": 1200,
    "averageSpeedKmh": 32,
    "fuelConsumption": 9.5,
    "status": "AVAILABLE",
    "currentLatitude": -23.55052,
    "currentLongitude": -46.633308
  }'
```

Resposta: `201 Created`, com o veículo em `data`.

### Consultar e alterar

```bash
curl -sS "$API_URL/vehicles/$VEHICLE_ID" \
  -H "Authorization: Bearer $TOKEN"

curl -sS -X PATCH "$API_URL/vehicles/$VEHICLE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "averageSpeedKmh": 30,
    "status": "MAINTENANCE"
  }'
```

### Remover

```bash
curl -sS -X DELETE "$API_URL/vehicles/$VEHICLE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Uma referência histórica pode fazer a API rejeitar a exclusão com `409`; nesse
caso, altere o estado para `INACTIVE`.

## 5. Centros de distribuição

### Criar

`POST /distribution-centers`

```bash
curl -sS -X POST "$API_URL/distribution-centers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Centro Vila Leopoldina",
    "address": "Av. Imperatriz Leopoldina, São Paulo - SP",
    "latitude": -23.53057,
    "longitude": -46.73089,
    "operatingHours": "Seg-Sáb 06:00-22:00"
  }'
```

CRUD padrão:

```text
GET    /distribution-centers
POST   /distribution-centers
GET    /distribution-centers/:id
PATCH  /distribution-centers/:id
DELETE /distribution-centers/:id
```

## 6. Entregas

### Criar

`POST /deliveries`

```bash
curl -sS -X POST "$API_URL/deliveries" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"trackingCode\": \"ULF-2026-0099\",
    \"originCenterId\": \"$CENTER_ID\",
    \"destinationAddress\": \"Av. Paulista, 1578, São Paulo - SP\",
    \"destinationLatitude\": -23.561414,
    \"destinationLongitude\": -46.655881,
    \"weightKg\": 42.5,
    \"priority\": \"URGENT\",
    \"serviceDeadline\": \"2026-07-20T18:00:00.000Z\"
  }"
```

### Listar com filtros

```bash
curl -sS \
  "$API_URL/deliveries?page=1&pageSize=20&status=PENDING&priority=URGENT&search=ULF" \
  -H "Authorization: Bearer $TOKEN"
```

### Atribuir a um veículo

`POST /deliveries/:id/assign`

```bash
curl -sS -X POST "$API_URL/deliveries/$DELIVERY_ID/assign" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"vehicleId\": \"$VEHICLE_ID\"
  }"
```

A API retorna `409 Conflict` se o veículo estiver indisponível ou se
a soma de pesos ultrapassar sua capacidade.

### Atualizar estado

`PATCH /deliveries/:id/status`

```bash
curl -sS -X PATCH "$API_URL/deliveries/$DELIVERY_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_TRANSIT"
  }'
```

Após `IN_TRANSIT`, a entrega pode ir para `DELIVERED` ou `FAILED`. Transições
inválidas são rejeitadas sem mudança parcial.

## 7. Rotas

### Criar rota com paradas

`POST /routes`

```bash
curl -sS -X POST "$API_URL/routes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Rota Centro - Manhã\",
    \"vehicleId\": \"$VEHICLE_ID\",
    \"deliveryIds\": [
      \"$DELIVERY_ID\",
      \"9d8a3f28-8b35-4d76-a951-df39c3513251\"
    ],
    \"optimize\": true
  }"
```

### Reordenar paradas manualmente

`PUT /routes/:id/stops/order`

```bash
curl -sS -X PUT "$API_URL/routes/$ROUTE_ID/stops/order" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderedStopIds": [
      "9d8a3f28-8b35-4d76-a951-df39c3513251",
      "6a90bc75-d4f5-45c9-8d10-1a9804035ee2"
    ],
    "trafficLevel": "MODERATE",
    "fuelPrice": 6.19,
    "co2Factor": 2.31,
    "serviceMinutesPerStop": 8
  }'
```

### Otimizar

`POST /routes/:id/optimize`

```bash
curl -sS -X POST "$API_URL/routes/$ROUTE_ID/optimize" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trafficLevel": "MODERATE",
    "fuelPrice": 6.19,
    "co2Factor": 2.31,
    "serviceMinutesPerStop": 8
  }'
```

Resposta resumida:

```json
{
  "success": true,
  "data": {
    "id": "a9d731da-e4f0-4ba1-9981-ef96fa67cbbb",
    "name": "Rota Centro - Manhã",
    "status": "PLANNED",
    "totalDistanceKm": 18.42,
    "estimatedDurationMinutes": 67,
    "estimatedCost": 11.98,
    "estimatedCo2Kg": 4.47,
    "stops": [
      {
        "deliveryId": "9d8a3f28-8b35-4d76-a951-df39c3513251",
        "sequence": 1
      }
    ]
  }
}
```

### Iniciar e concluir

```bash
curl -sS -X POST "$API_URL/routes/$ROUTE_ID/start" \
  -H "Authorization: Bearer $TOKEN"

curl -sS -X PATCH "$API_URL/routes/$ROUTE_ID/stops/$STOP_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED"
  }'

curl -sS -X POST "$API_URL/routes/$ROUTE_ID/complete" \
  -H "Authorization: Bearer $TOKEN"
```

Repita a atualização para todas as paradas. A conclusão só ocorre quando todas
estiverem concluídas ou justificadas (`SKIPPED`/`FAILED`).

## 8. Simulações

### Criar cenário

`POST /simulations`

```bash
curl -sS -X POST "$API_URL/simulations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Pico da tarde - frota reduzida\",
    \"trafficLevel\": \"HIGH\",
    \"availableVehicles\": 4,
    \"averageSpeedKmh\": 24,
    \"fuelPrice\": 6.19,
    \"co2Factor\": 2.31,
    \"parameters\": {
      \"deliveryIds\": [
        \"$DELIVERY_ID\",
        \"9d8a3f28-8b35-4d76-a951-df39c3513251\"
      ],
      \"capacityKgPerVehicle\": 1200,
      \"serviceMinutesPerStop\": 10,
      \"fuelConsumptionKmPerLiter\": 9.5,
      \"returnToOrigin\": false
    }
  }"
```

Resposta: `201 Created`, com estado inicial `DRAFT`.

### Executar

`POST /simulations/:id/run`

```bash
curl -sS -X POST "$API_URL/simulations/$SIMULATION_ID/run" \
  -H "Authorization: Bearer $TOKEN"
```

Resposta:

```json
{
  "success": true,
  "data": {
    "id": "07ace55d-3048-4a9c-a95c-ec7d3ce55fd8",
    "status": "COMPLETED",
    "result": {
      "originalDistanceKm": 54.6,
      "optimizedDistanceKm": 42.2,
      "originalDurationMinutes": 184,
      "optimizedDurationMinutes": 151,
      "originalCost": 35.52,
      "optimizedCost": 27.45,
      "originalCo2Kg": 13.27,
      "optimizedCo2Kg": 10.25,
      "onTimeDeliveryRate": 88.9,
      "serviceLevel": 88.9,
      "improvementPercentage": 22.71,
      "routeData": {
        "mode": "SIMULATION",
        "origin": {
          "id": "c7c88bda-30a8-4a7d-9ea2-55f527ca7d4c",
          "latitude": -23.55052,
          "longitude": -46.633308
        },
        "originalOrder": [],
        "optimizedOrder": [],
        "selectedDeliveries": 9,
        "requestedDeliveries": 10,
        "availableVehicles": 4
      }
    }
  }
}
```

### Consultar resultado

```bash
curl -sS "$API_URL/simulations/$SIMULATION_ID" \
  -H "Authorization: Bearer $TOKEN"
```

## 9. Dashboard e relatórios

### Resumo

```bash
curl -sS "$API_URL/dashboard/summary" \
  -H "Authorization: Bearer $TOKEN"
```

Exemplo:

```json
{
  "success": true,
  "data": {
    "metrics": {
      "pendingDeliveries": 7,
      "inTransitDeliveries": 5,
      "completedDeliveries": 9,
      "lateDeliveries": 2,
      "totalDistanceKm": 148.4,
      "averageDeliveryMinutes": 52,
      "onTimeDeliveryRate": 88.9,
      "serviceLevel": 90,
      "fleetUtilization": 37.5,
      "availableVehicles": 4,
      "estimatedCost": 96.46,
      "estimatedCo2Kg": 36.02,
      "optimizationSavings": 21.8
    },
    "deliveriesByStatus": [
      {
        "status": "PENDING",
        "count": 7
      }
    ],
    "fleetByStatus": [
      {
        "status": "AVAILABLE",
        "count": 4
      }
    ],
    "recentAlerts": []
  }
}
```

### Séries, mapa e cidade

```bash
curl -sS "$API_URL/dashboard/timeseries?days=7" \
  -H "Authorization: Bearer $TOKEN"

curl -sS "$API_URL/dashboard/map" \
  -H "Authorization: Bearer $TOKEN"

curl -sS "$API_URL/dashboard/city" \
  -H "Authorization: Bearer $TOKEN"
```

### SSE demonstrativo

Com `curl`:

```bash
curl -N "$API_URL/dashboard/live" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: text/event-stream"
```

Exemplo de evento:

```text
event: snapshot
data: {"mode":"DEMO","tick":4,"generatedAt":"2026-07-19T18:00:10.000Z","vehicles":[{"id":"...","routeId":"...","latitude":-23.55,"longitude":-46.63,"progress":0.04,"status":"IN_ROUTE"}]}
```

O stream envia um snapshot a cada 2 segundos, encerra após 61 ticks e é uma
simulação operacional determinística, não GPS real.

### Relatórios

Os relatórios exigem perfil `ADMIN` ou `MANAGER`.

```bash
curl -sS "$API_URL/reports/operations?from=2026-07-01T00%3A00%3A00.000Z&to=2026-08-01T00%3A00%3A00.000Z" \
  -H "Authorization: Bearer $TOKEN"

curl -sS "$API_URL/reports/performance?from=2026-07-01T00%3A00%3A00.000Z&to=2026-08-01T00%3A00%3A00.000Z" \
  -H "Authorization: Bearer $TOKEN"
```

## 10. Health check

`GET /health`

```bash
curl -sS "$API_URL/health"
```

Resposta esperada:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "urbanlink-api",
    "database": "connected",
    "databaseLatencyMs": 2,
    "uptimeSeconds": 120,
    "timestamp": "2026-07-19T18:00:00.000Z"
  }
}
```

`GET /health/live` verifica apenas o processo e não depende do banco.

## 11. Erros

### Payload inválido - `422 Unprocessable Entity`

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos.",
    "details": {
      "errors": [],
      "properties": {
        "capacityKg": {
          "errors": ["Deve ser maior que zero."]
        }
      }
    }
  }
}
```

### Não autenticado - `401 Unauthorized`

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Autenticação necessária."
  }
}
```

### Sem permissão - `403 Forbidden`

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Você não possui permissão para esta operação."
  }
}
```

### Não encontrado - `404 Not Found`

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Veículo não encontrado."
  }
}
```

### Conflito - `409 Conflict`

```json
{
  "success": false,
  "error": {
    "code": "UNIQUE_CONSTRAINT",
    "message": "Já existe um registro com o identificador informado."
  }
}
```

### Regra de negócio - `409 Conflict`

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Capacidade excedida: 1222.50 kg para 1200.00 kg disponíveis."
  }
}
```

### Rate limit - `429 Too Many Requests`

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Muitas requisições. Tente novamente mais tarde."
  }
}
```

## 12. Fluxo equivalente no Postman ou Insomnia

1. Crie o ambiente `UrbanLink Local`.
2. Defina `baseUrl = http://localhost:3333/api`.
3. Crie a requisição `POST {{baseUrl}}/auth/login`.
4. No script pós-resposta, salve `data.token` como variável `token`.
5. Configure nas demais requisições Bearer Token `{{token}}`.
6. Salve os IDs criados em `vehicleId`, `centerId`, `deliveryId`, `routeId`,
   `stopId` e `simulationId`.
7. Execute na ordem: login -> criar/selecionar veículo -> criar entrega -> atribuir
   -> criar rota -> otimizar -> iniciar -> atualizar paradas -> concluir -> criar e
   executar simulação -> consultar dashboard.
8. Compare o contrato real com o Swagger em `/api/docs`, que é a referência
   executável para campos opcionais e respostas.

## 13. Matriz rápida de endpoints

| Grupo       | Endpoints principais                                            |
| ----------- | --------------------------------------------------------------- |
| Auth        | `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`, `POST /auth/password-reset/request` e `/confirm` |
| Public      | `GET /public/tracking/:code`, `POST /public/contact`, `GET /public/inquiries` |
| Users       | CRUD `/users`                                                   |
| Vehicles    | CRUD `/vehicles`                                                |
| Centers     | CRUD `/distribution-centers`                                    |
| Deliveries  | CRUD `/deliveries`, `POST /:id/assign`, `PATCH /:id/status`     |
| Routes      | CRUD `/routes`, reordenar paradas, otimizar, iniciar e concluir |
| Simulations | CRUD `/simulations`, `POST /:id/run`                            |
| Dashboard   | `/summary`, `/timeseries`, `/map`, `/city`, `/live`             |
| Reports     | `/operations`, `/performance`                                   |
| Platform    | `/health`, `/health/live`, `/docs`, `/openapi.json`             |
