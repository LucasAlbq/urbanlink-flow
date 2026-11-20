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
