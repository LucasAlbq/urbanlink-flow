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
