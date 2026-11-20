-- UrbanLink Flow: cria as tabelas, enums, índices, chaves, funções e o trigger.
--
-- Rode dentro do banco vazio:
--   psql -U postgres -d urbanlink -f 02-criar-tabelas.sql
--
-- É a junção, em ordem, das 6 migrations de backend/prisma/migrations/: o mesmo banco que o
-- "npm run db:deploy" do back-end cria. Use um caminho ou o outro, não os dois: num banco criado por
-- este script, não rode o db:deploy depois (as tabelas já existem).
--
-- Gerado em 2026-11-20 a partir das migrations.

BEGIN;

-- ============================================================
-- Migration 20260719183000_init
-- ============================================================

CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'OPERATOR');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE "VehicleType" AS ENUM ('MOTORCYCLE', 'VAN', 'TRUCK', 'BICYCLE');
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'IN_ROUTE', 'MAINTENANCE', 'INACTIVE');
CREATE TYPE "DeliveryPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELED');
CREATE TYPE "RouteStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELED');
CREATE TYPE "RouteStopStatus" AS ENUM ('PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED', 'FAILED');
CREATE TYPE "TrafficLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');
CREATE TYPE "SimulationStatus" AS ENUM ('DRAFT', 'RUNNING', 'COMPLETED', 'FAILED');
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(120) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'OPERATOR',
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "plate" VARCHAR(10) NOT NULL,
  "model" VARCHAR(120) NOT NULL,
  "type" "VehicleType" NOT NULL,
  "capacity_kg" DOUBLE PRECISION NOT NULL,
  "average_speed_kmh" DOUBLE PRECISION NOT NULL,
  "fuel_consumption" DOUBLE PRECISION NOT NULL,
  "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
  "current_latitude" DOUBLE PRECISION,
  "current_longitude" DOUBLE PRECISION,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "distribution_centers" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(160) NOT NULL,
  "address" VARCHAR(255) NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "operating_hours" VARCHAR(120) NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "distribution_centers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "deliveries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tracking_code" VARCHAR(40) NOT NULL,
  "origin_center_id" UUID NOT NULL,
  "destination_address" VARCHAR(255) NOT NULL,
  "destination_latitude" DOUBLE PRECISION NOT NULL,
  "destination_longitude" DOUBLE PRECISION NOT NULL,
  "weight_kg" DOUBLE PRECISION NOT NULL,
  "priority" "DeliveryPriority" NOT NULL DEFAULT 'NORMAL',
  "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "service_deadline" TIMESTAMPTZ(3) NOT NULL,
  "assigned_vehicle_id" UUID,
  "estimated_arrival" TIMESTAMPTZ(3),
  "delivered_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "routes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "vehicle_id" UUID NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "status" "RouteStatus" NOT NULL DEFAULT 'PLANNED',
  "total_distance_km" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "estimated_duration_minutes" INTEGER NOT NULL DEFAULT 0,
  "actual_duration_minutes" INTEGER,
  "estimated_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "estimated_co2_kg" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "started_at" TIMESTAMPTZ(3),
  "completed_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "route_stops" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "route_id" UUID NOT NULL,
  "delivery_id" UUID NOT NULL,
  "sequence" INTEGER NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "planned_arrival" TIMESTAMPTZ(3),
  "actual_arrival" TIMESTAMPTZ(3),
  "status" "RouteStopStatus" NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "simulations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "traffic_level" "TrafficLevel" NOT NULL,
  "available_vehicles" INTEGER NOT NULL,
  "average_speed_kmh" DOUBLE PRECISION NOT NULL,
  "fuel_price" DOUBLE PRECISION NOT NULL,
  "co2_factor" DOUBLE PRECISION NOT NULL,
  "parameters" JSONB NOT NULL,
  "status" "SimulationStatus" NOT NULL DEFAULT 'DRAFT',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "simulations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "simulation_results" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "simulation_id" UUID NOT NULL,
  "original_distance_km" DOUBLE PRECISION NOT NULL,
  "optimized_distance_km" DOUBLE PRECISION NOT NULL,
  "original_duration_minutes" INTEGER NOT NULL,
  "optimized_duration_minutes" INTEGER NOT NULL,
  "original_cost" DOUBLE PRECISION NOT NULL,
  "optimized_cost" DOUBLE PRECISION NOT NULL,
  "original_co2_kg" DOUBLE PRECISION NOT NULL,
  "optimized_co2_kg" DOUBLE PRECISION NOT NULL,
  "on_time_delivery_rate" DOUBLE PRECISION NOT NULL,
  "service_level" DOUBLE PRECISION NOT NULL,
  "improvement_percentage" DOUBLE PRECISION NOT NULL,
  "route_data" JSONB NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "simulation_results_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "alerts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "severity" "AlertSeverity" NOT NULL,
  "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
  "title" VARCHAR(160) NOT NULL,
  "message" TEXT NOT NULL,
  "vehicle_id" UUID,
  "route_id" UUID,
  "delivery_id" UUID,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolved_at" TIMESTAMPTZ(3),
  CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID,
  "action" VARCHAR(80) NOT NULL,
  "entity" VARCHAR(80) NOT NULL,
  "entity_id" VARCHAR(80),
  "metadata" JSONB,
  "ip_address" VARCHAR(64),
  "user_agent" VARCHAR(255),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");
CREATE INDEX "vehicles_type_idx" ON "vehicles"("type");
CREATE INDEX "distribution_centers_name_idx" ON "distribution_centers"("name");
CREATE UNIQUE INDEX "deliveries_tracking_code_key" ON "deliveries"("tracking_code");
CREATE INDEX "deliveries_status_priority_idx" ON "deliveries"("status", "priority");
CREATE INDEX "deliveries_origin_center_id_idx" ON "deliveries"("origin_center_id");
CREATE INDEX "deliveries_assigned_vehicle_id_idx" ON "deliveries"("assigned_vehicle_id");
CREATE INDEX "deliveries_service_deadline_idx" ON "deliveries"("service_deadline");
CREATE INDEX "routes_vehicle_id_status_idx" ON "routes"("vehicle_id", "status");
CREATE INDEX "routes_status_idx" ON "routes"("status");
CREATE UNIQUE INDEX "route_stops_route_id_sequence_key" ON "route_stops"("route_id", "sequence");
CREATE UNIQUE INDEX "route_stops_route_id_delivery_id_key" ON "route_stops"("route_id", "delivery_id");
CREATE INDEX "route_stops_delivery_id_idx" ON "route_stops"("delivery_id");
CREATE INDEX "route_stops_status_idx" ON "route_stops"("status");
CREATE INDEX "simulations_user_id_status_idx" ON "simulations"("user_id", "status");
CREATE INDEX "simulations_created_at_idx" ON "simulations"("created_at");
CREATE UNIQUE INDEX "simulation_results_simulation_id_key" ON "simulation_results"("simulation_id");
CREATE INDEX "simulation_results_created_at_idx" ON "simulation_results"("created_at");
CREATE INDEX "alerts_status_severity_idx" ON "alerts"("status", "severity");
CREATE INDEX "alerts_vehicle_id_idx" ON "alerts"("vehicle_id");
CREATE INDEX "alerts_route_id_idx" ON "alerts"("route_id");
CREATE INDEX "alerts_delivery_id_idx" ON "alerts"("delivery_id");
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

ALTER TABLE "deliveries"
  ADD CONSTRAINT "deliveries_origin_center_id_fkey"
  FOREIGN KEY ("origin_center_id") REFERENCES "distribution_centers"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "deliveries"
  ADD CONSTRAINT "deliveries_assigned_vehicle_id_fkey"
  FOREIGN KEY ("assigned_vehicle_id") REFERENCES "vehicles"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "routes"
  ADD CONSTRAINT "routes_vehicle_id_fkey"
  FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "route_stops"
  ADD CONSTRAINT "route_stops_route_id_fkey"
  FOREIGN KEY ("route_id") REFERENCES "routes"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "route_stops"
  ADD CONSTRAINT "route_stops_delivery_id_fkey"
  FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "simulations"
  ADD CONSTRAINT "simulations_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "simulation_results"
  ADD CONSTRAINT "simulation_results_simulation_id_fkey"
  FOREIGN KEY ("simulation_id") REFERENCES "simulations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "alerts"
  ADD CONSTRAINT "alerts_vehicle_id_fkey"
  FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "alerts"
  ADD CONSTRAINT "alerts_route_id_fkey"
  FOREIGN KEY ("route_id") REFERENCES "routes"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "alerts"
  ADD CONSTRAINT "alerts_delivery_id_fkey"
  FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Migration 20260719231500_persist_route_calculation_parameters
-- ============================================================

ALTER TABLE "routes"
ADD COLUMN "traffic_level" "TrafficLevel" NOT NULL DEFAULT 'MODERATE',
ADD COLUMN "fuel_price" DOUBLE PRECISION NOT NULL DEFAULT 6.19,
ADD COLUMN "co2_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.31,
ADD COLUMN "service_minutes_per_stop" INTEGER NOT NULL DEFAULT 8;

-- ============================================================
-- Migration 20261020235500_add_inquiries
-- ============================================================

CREATE TABLE "inquiries" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "company" VARCHAR(160) NOT NULL DEFAULT '',
    "phone" VARCHAR(30) NOT NULL DEFAULT '',
    "subject" VARCHAR(80) NOT NULL,
    "message" VARCHAR(3000) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "inquiries_created_at_idx" ON "inquiries"("created_at");

-- ============================================================
-- Migration 20261120190000_add_delivery_events
-- ============================================================

-- Histórico de status das entregas, pro rastreio público mostrar a data e a cidade de cada etapa.
-- Quem grava é o trigger deliveries_record_event, no próprio banco: qualquer caminho da API que
-- troque o status de uma entrega (atribuir, iniciar rota, concluir parada, cancelar) já fica
-- registrado, sem depender de cada serviço lembrar de inserir o evento.

-- CreateTable
CREATE TABLE "delivery_events" (
    "id" SERIAL NOT NULL,
    "delivery_id" UUID NOT NULL,
    "status" "DeliveryStatus" NOT NULL,
    "location" VARCHAR(120),
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "delivery_events_delivery_id_occurred_at_idx" ON "delivery_events"("delivery_id", "occurred_at");

-- AddForeignKey
ALTER TABLE "delivery_events" ADD CONSTRAINT "delivery_events_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Do endereço, só "Cidade, UF" (ex.: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP" vira
-- "São Paulo, SP"). Endereço fora desse formato devolve NULL: rua e número nunca saem daqui.
CREATE FUNCTION "delivery_event_location"(address TEXT) RETURNS VARCHAR(120)
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  parts TEXT[];
BEGIN
  parts := regexp_match(address, ',\s*([^,]+?)\s*-\s*([A-Z]{2})\s*$');
  IF parts IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN left(parts[1] || ', ' || parts[2], 120);
END
$$;

-- Grava um evento quando a entrega nasce e a cada troca de status.
-- Local: postada, atribuída e cancelada ficam na cidade do centro de origem; em rota, entregue e
-- falhou ficam na cidade do destino.
-- Hora: na criação, created_at; entregue, delivered_at; nas outras trocas, o updated_at que a API
-- acabou de gravar (ou a hora atual, se ele não mudou).
CREATE FUNCTION "record_delivery_event"() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  origin_location VARCHAR(120);
  event_location VARCHAR(120);
  happened_at TIMESTAMPTZ(3);
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  SELECT "delivery_event_location"(c.address) INTO origin_location
  FROM "distribution_centers" c
  WHERE c.id = NEW.origin_center_id;

  IF NEW.status IN ('PENDING', 'ASSIGNED', 'CANCELED') THEN
    event_location := origin_location;
  ELSE
    event_location := "delivery_event_location"(NEW.destination_address);
  END IF;

  IF TG_OP = 'INSERT' THEN
    happened_at := NEW.created_at;
    -- Criada já atribuída a um veículo: também fica registrado que ela foi postada.
    IF NEW.status <> 'PENDING' THEN
      INSERT INTO "delivery_events" ("delivery_id", "status", "location", "occurred_at")
      VALUES (NEW.id, 'PENDING', origin_location, happened_at);
    END IF;
  ELSIF NEW.status = 'DELIVERED' AND NEW.delivered_at IS NOT NULL THEN
    happened_at := NEW.delivered_at;
  ELSIF NEW.updated_at IS DISTINCT FROM OLD.updated_at THEN
    happened_at := NEW.updated_at;
  ELSE
    happened_at := now();
  END IF;

  INSERT INTO "delivery_events" ("delivery_id", "status", "location", "occurred_at")
  VALUES (NEW.id, NEW.status, event_location, happened_at);
  RETURN NEW;
END
$$;

CREATE TRIGGER "deliveries_record_event"
AFTER INSERT OR UPDATE OF "status" ON "deliveries"
FOR EACH ROW EXECUTE FUNCTION "record_delivery_event"();

-- Entregas que já existiam: o banco não sabe quando passaram pelas etapas do meio, então ficam só
-- a postagem (created_at) e o status atual (delivered_at ou updated_at). Nada é inventado.
INSERT INTO "delivery_events" ("delivery_id", "status", "location", "occurred_at")
SELECT d.id, 'PENDING', "delivery_event_location"(c.address), d.created_at
FROM "deliveries" d
JOIN "distribution_centers" c ON c.id = d.origin_center_id;

INSERT INTO "delivery_events" ("delivery_id", "status", "location", "occurred_at")
SELECT
  d.id,
  d.status,
  CASE
    WHEN d.status IN ('ASSIGNED', 'CANCELED') THEN "delivery_event_location"(c.address)
    ELSE "delivery_event_location"(d.destination_address)
  END,
  CASE WHEN d.status = 'DELIVERED' THEN COALESCE(d.delivered_at, d.updated_at) ELSE d.updated_at END
FROM "deliveries" d
JOIN "distribution_centers" c ON c.id = d.origin_center_id
WHERE d.status <> 'PENDING';

-- ============================================================
-- Migration 20261120193000_add_inquiry_protocol
-- ============================================================

-- Protocolo das mensagens do Fale com a gente, que o site mostra na tela de mensagem enviada.
-- Formato: "ULS" + ano + número de uma sequência com pelo menos 4 dígitos (ULS20260001).
-- Quem gera é o banco, pelo valor padrão da coluna: dois envios ao mesmo tempo nunca repetem.

CREATE SEQUENCE "inquiry_protocol_seq";

CREATE FUNCTION "next_inquiry_protocol"() RETURNS VARCHAR(20)
LANGUAGE sql VOLATILE AS $$
  SELECT 'ULS'
    || to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'YYYY')
    || lpad(n::text, greatest(4, length(n::text)), '0')
  FROM nextval('inquiry_protocol_seq') AS n
$$;

-- Mensagens que já existiam ganham um protocolo cada, pelo mesmo valor padrão.
-- AlterTable
ALTER TABLE "inquiries" ADD COLUMN     "protocol" VARCHAR(20) NOT NULL DEFAULT next_inquiry_protocol();

-- CreateIndex
CREATE UNIQUE INDEX "inquiries_protocol_key" ON "inquiries"("protocol");

-- ============================================================
-- Migration 20261120200000_add_password_reset_tokens
-- ============================================================

-- Pedidos de senha nova (recuperar senha do site). O link leva o token; aqui fica só o SHA-256
-- dele. Cada pedido vale uma vez (used_at) e até expires_at. Apagar o usuário apaga os pedidos.

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "used_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
