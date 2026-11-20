# Modelagem lógica

Cada tabela com suas colunas, tipos e chaves, como estão no banco. Nomes de tabelas e colunas em inglês e `snake_case`; o nome em português de cada entidade está entre parênteses.

Legenda: **PK** chave primária; **FK** chave estrangeira, com a regra ao apagar o registro de origem; **única** não repete na tabela. Todas as datas são `timestamptz(3)`, com fuso horário e milissegundos.

## Identidade e segurança

### `users` (Usuário)

Pessoa que entra na plataforma, com perfil ADMIN, MANAGER ou OPERATOR.

| Coluna | Tipo | Obrigatória | Chave | Padrão |
| --- | --- | :---: | --- | --- |
| `id` | uuid | sim | PK | UUID gerado pelo banco |
| `name` | varchar(120) | sim |  |  |
| `email` | varchar(255) | sim | única |  |
| `password_hash` | varchar(255) | sim |  |  |
| `role` | enum Role | sim |  | OPERATOR |
| `status` | enum UserStatus | sim |  | ACTIVE |
| `created_at` | timestamptz(3) | sim |  | hora atual |
| `updated_at` | timestamptz(3) | sim |  |  |

### `password_reset_tokens` (Pedido de senha nova)

Link de senha nova: guarda só o hash do token, vale uma vez e até vencer.

| Coluna | Tipo | Obrigatória | Chave | Padrão |
| --- | --- | :---: | --- | --- |
| `id` | uuid | sim | PK |  |
| `user_id` | uuid | sim | FK → `users.id` (CASCADE) |  |
| `token_hash` | char(64) | sim | única |  |
| `expires_at` | timestamptz(3) | sim |  |  |
| `used_at` | timestamptz(3) | não |  |  |
| `created_at` | timestamptz(3) | sim |  | hora atual |

### `audit_logs` (Registro de auditoria)

Quem fez o quê e quando (login, mudanças de estado, cadastros).

| Coluna | Tipo | Obrigatória | Chave | Padrão |
| --- | --- | :---: | --- | --- |
| `id` | uuid | sim | PK | UUID gerado pelo banco |
| `user_id` | uuid | não | FK → `users.id` (SET NULL) |  |
| `action` | varchar(80) | sim |  |  |
| `entity` | varchar(80) | sim |  |  |
| `entity_id` | varchar(80) | não |  |  |
| `metadata` | jsonb | não |  |  |
| `ip_address` | varchar(64) | não |  |  |
| `user_agent` | varchar(255) | não |  |  |
| `created_at` | timestamptz(3) | sim |  | hora atual |

## Frota e distribuição

### `vehicles` (Veículo)

Veículo da frota, com capacidade, velocidade média, consumo e posição.

| Coluna | Tipo | Obrigatória | Chave | Padrão |
| --- | --- | :---: | --- | --- |
| `id` | uuid | sim | PK | UUID gerado pelo banco |
| `plate` | varchar(10) | sim | única |  |
| `model` | varchar(120) | sim |  |  |
| `type` | enum VehicleType | sim |  |  |
| `capacity_kg` | double precision | sim |  |  |
| `average_speed_kmh` | double precision | sim |  |  |
| `fuel_consumption` | double precision | sim |  |  |
| `status` | enum VehicleStatus | sim |  | AVAILABLE |
| `current_latitude` | double precision | não |  |  |
| `current_longitude` | double precision | não |  |  |
| `created_at` | timestamptz(3) | sim |  | hora atual |
| `updated_at` | timestamptz(3) | sim |  |  |

### `distribution_centers` (Centro de distribuição)

Galpão de onde as entregas saem.

| Coluna | Tipo | Obrigatória | Chave | Padrão |
| --- | --- | :---: | --- | --- |
| `id` | uuid | sim | PK | UUID gerado pelo banco |
| `name` | varchar(160) | sim |  |  |
| `address` | varchar(255) | sim |  |  |
| `latitude` | double precision | sim |  |  |
| `longitude` | double precision | sim |  |  |
| `operating_hours` | varchar(120) | sim |  |  |
| `created_at` | timestamptz(3) | sim |  | hora atual |
| `updated_at` | timestamptz(3) | sim |  |  |

### `deliveries` (Entrega)

Pedido a entregar, com código de rastreio, destino, peso, prioridade, prazo e estado.

| Coluna | Tipo | Obrigatória | Chave | Padrão |
| --- | --- | :---: | --- | --- |
| `id` | uuid | sim | PK | UUID gerado pelo banco |
| `tracking_code` | varchar(40) | sim | única |  |
| `origin_center_id` | uuid | sim | FK → `distribution_centers.id` (RESTRICT) |  |
| `destination_address` | varchar(255) | sim |  |  |
| `destination_latitude` | double precision | sim |  |  |
| `destination_longitude` | double precision | sim |  |  |
| `weight_kg` | double precision | sim |  |  |
| `priority` | enum DeliveryPriority | sim |  | NORMAL |
| `status` | enum DeliveryStatus | sim |  | PENDING |
| `service_deadline` | timestamptz(3) | sim |  |  |
| `assigned_vehicle_id` | uuid | não | FK → `vehicles.id` (SET NULL) |  |
| `estimated_arrival` | timestamptz(3) | não |  |  |
| `delivered_at` | timestamptz(3) | não |  |  |
| `created_at` | timestamptz(3) | sim |  | hora atual |
| `updated_at` | timestamptz(3) | sim |  |  |

### `delivery_events` (Evento da entrega)

Histórico de estados da entrega, gravado pelo trigger deliveries_record_event.

| Coluna | Tipo | Obrigatória | Chave | Padrão |
| --- | --- | :---: | --- | --- |
| `id` | integer | sim | PK | automático (sequência) |
| `delivery_id` | uuid | sim | FK → `deliveries.id` (CASCADE) |  |
| `status` | enum DeliveryStatus | sim |  |  |
| `location` | varchar(120) | não |  |  |
| `occurred_at` | timestamptz(3) | sim |  | hora atual |

## Rotas

### `routes` (Rota)

Percurso de um veículo, com distância, duração, custo e CO2 estimados.

| Coluna | Tipo | Obrigatória | Chave | Padrão |
| --- | --- | :---: | --- | --- |
| `id` | uuid | sim | PK | UUID gerado pelo banco |
| `vehicle_id` | uuid | sim | FK → `vehicles.id` (RESTRICT) |  |
| `name` | varchar(160) | sim |  |  |
| `status` | enum RouteStatus | sim |  | PLANNED |
| `total_distance_km` | double precision | sim |  | 0 |
| `estimated_duration_minutes` | integer | sim |  | 0 |
| `actual_duration_minutes` | integer | não |  |  |
| `estimated_cost` | double precision | sim |  | 0 |
| `estimated_co2_kg` | double precision | sim |  | 0 |
| `started_at` | timestamptz(3) | não |  |  |
| `completed_at` | timestamptz(3) | não |  |  |
| `created_at` | timestamptz(3) | sim |  | hora atual |
| `updated_at` | timestamptz(3) | sim |  |  |
| `traffic_level` | enum TrafficLevel | sim |  | MODERATE |
| `fuel_price` | double precision | sim |  | 6.19 |
| `co2_factor` | double precision | sim |  | 2.31 |
| `service_minutes_per_stop` | integer | sim |  | 8 |

### `route_stops` (Parada)

Uma entrega dentro de uma rota, na ordem da visita.

| Coluna | Tipo | Obrigatória | Chave | Padrão |
| --- | --- | :---: | --- | --- |
| `id` | uuid | sim | PK | UUID gerado pelo banco |
| `route_id` | uuid | sim | FK → `routes.id` (CASCADE) |  |
| `delivery_id` | uuid | sim | FK → `deliveries.id` (RESTRICT) |  |
| `sequence` | integer | sim |  |  |
| `latitude` | double precision | sim |  |  |
| `longitude` | double precision | sim |  |  |
| `planned_arrival` | timestamptz(3) | não |  |  |
| `actual_arrival` | timestamptz(3) | não |  |  |
| `status` | enum RouteStopStatus | sim |  | PENDING |
| `created_at` | timestamptz(3) | sim |  | hora atual |
| `updated_at` | timestamptz(3) | sim |  |  |

Únicas compostas: `(route_id, delivery_id)`, `(route_id, sequence)`.

## Simulações

### `simulations` (Simulação)

Cenário de teste: tráfego, frota, combustível e entregas escolhidas.

| Coluna | Tipo | Obrigatória | Chave | Padrão |
| --- | --- | :---: | --- | --- |
| `id` | uuid | sim | PK | UUID gerado pelo banco |
| `user_id` | uuid | sim | FK → `users.id` (RESTRICT) |  |
| `name` | varchar(160) | sim |  |  |
| `traffic_level` | enum TrafficLevel | sim |  |  |
| `available_vehicles` | integer | sim |  |  |
| `average_speed_kmh` | double precision | sim |  |  |
| `fuel_price` | double precision | sim |  |  |
| `co2_factor` | double precision | sim |  |  |
| `parameters` | jsonb | sim |  |  |
| `status` | enum SimulationStatus | sim |  | DRAFT |
| `created_at` | timestamptz(3) | sim |  | hora atual |
| `updated_at` | timestamptz(3) | sim |  |  |

### `simulation_results` (Resultado da simulação)

Comparação entre a ordem original e a otimizada.

| Coluna | Tipo | Obrigatória | Chave | Padrão |
| --- | --- | :---: | --- | --- |
| `id` | uuid | sim | PK | UUID gerado pelo banco |
| `simulation_id` | uuid | sim | FK → `simulations.id` (CASCADE), única |  |
| `original_distance_km` | double precision | sim |  |  |
| `optimized_distance_km` | double precision | sim |  |  |
| `original_duration_minutes` | integer | sim |  |  |
| `optimized_duration_minutes` | integer | sim |  |  |
| `original_cost` | double precision | sim |  |  |
| `optimized_cost` | double precision | sim |  |  |
| `original_co2_kg` | double precision | sim |  |  |
| `optimized_co2_kg` | double precision | sim |  |  |
| `on_time_delivery_rate` | double precision | sim |  |  |
| `service_level` | double precision | sim |  |  |
| `improvement_percentage` | double precision | sim |  |  |
| `route_data` | jsonb | sim |  |  |
| `created_at` | timestamptz(3) | sim |  | hora atual |

## Monitoramento

### `alerts` (Alerta)

Aviso operacional ligado a um veículo, uma rota ou uma entrega.

| Coluna | Tipo | Obrigatória | Chave | Padrão |
| --- | --- | :---: | --- | --- |
| `id` | uuid | sim | PK | UUID gerado pelo banco |
| `severity` | enum AlertSeverity | sim |  |  |
| `status` | enum AlertStatus | sim |  | OPEN |
| `title` | varchar(160) | sim |  |  |
| `message` | text | sim |  |  |
| `vehicle_id` | uuid | não | FK → `vehicles.id` (CASCADE) |  |
| `route_id` | uuid | não | FK → `routes.id` (CASCADE) |  |
| `delivery_id` | uuid | não | FK → `deliveries.id` (CASCADE) |  |
| `created_at` | timestamptz(3) | sim |  | hora atual |
| `resolved_at` | timestamptz(3) | não |  |  |

## Site público

### `inquiries` (Mensagem do site)

Mensagem do Fale com a gente, com protocolo gerado pelo banco.

| Coluna | Tipo | Obrigatória | Chave | Padrão |
| --- | --- | :---: | --- | --- |
| `id` | uuid | sim | PK |  |
| `name` | varchar(120) | sim |  |  |
| `email` | varchar(255) | sim |  |  |
| `company` | varchar(160) | sim |  | texto vazio |
| `phone` | varchar(30) | sim |  | texto vazio |
| `subject` | varchar(80) | sim |  |  |
| `message` | varchar(3000) | sim |  |  |
| `created_at` | timestamptz(3) | sim |  | hora atual |
| `protocol` | varchar(20) | sim | única | next_inquiry_protocol() |
## Enums

| Enum | Valores |
| --- | --- |
| `AlertSeverity` | `INFO`, `WARNING`, `CRITICAL` |
| `AlertStatus` | `OPEN`, `ACKNOWLEDGED`, `RESOLVED` |
| `DeliveryPriority` | `LOW`, `NORMAL`, `HIGH`, `URGENT` |
| `DeliveryStatus` | `PENDING`, `ASSIGNED`, `IN_TRANSIT`, `DELIVERED`, `FAILED`, `CANCELED` |
| `Role` | `ADMIN`, `MANAGER`, `OPERATOR` |
| `RouteStatus` | `PLANNED`, `ACTIVE`, `COMPLETED`, `CANCELED` |
| `RouteStopStatus` | `PENDING`, `ARRIVED`, `COMPLETED`, `SKIPPED`, `FAILED` |
| `SimulationStatus` | `DRAFT`, `RUNNING`, `COMPLETED`, `FAILED` |
| `TrafficLevel` | `LOW`, `MODERATE`, `HIGH`, `CRITICAL` |
| `UserStatus` | `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| `VehicleStatus` | `AVAILABLE`, `IN_ROUTE`, `MAINTENANCE`, `INACTIVE` |
| `VehicleType` | `MOTORCYCLE`, `VAN`, `TRUCK`, `BICYCLE` |

## Recursos do PostgreSQL

| Recurso | Tipo | O que faz |
| --- | --- | --- |
| `deliveries_record_event` | trigger em `deliveries` (depois de inserir ou mudar `status`) | Grava um evento em `delivery_events` quando a entrega nasce e a cada troca de estado |
| `record_delivery_event()` | função do trigger | Decide a hora e a cidade do evento |
| `delivery_event_location(address)` | função | Tira só "Cidade, UF" do fim do endereço; rua e número nunca saem |
| `inquiry_protocol_seq` e `next_inquiry_protocol()` | sequência e função | Valor padrão de `inquiries.protocol`: `ULS` + ano + número (ex.: `ULS20260001`) |

## Normalização

As tabelas estão na terceira forma normal: cada coluna depende só da chave da sua tabela. As três colunas JSON (`simulations.parameters`, `simulation_results.route_data` e `audit_logs.metadata`) são fotos de um momento, não cadastro, e ficam assim de propósito. Os detalhes estão em [MODELO_DADOS.md](../backend/MODELO_DADOS.md#5-normalização).
