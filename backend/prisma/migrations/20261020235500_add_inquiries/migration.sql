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
