import type { Request } from 'express';
import type { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';

interface AuditInput {
  request: Request;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
}

export async function recordAudit(input: AuditInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: input.request.auth?.id,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      metadata: input.metadata,
      ipAddress: input.request.ip,
      userAgent: input.request.get('user-agent')?.slice(0, 255),
    },
  });
}
