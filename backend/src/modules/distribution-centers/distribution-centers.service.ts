import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';
import { conflict, notFound } from '../../shared/errors.js';
import { paginationMeta } from '../../shared/http.js';
import type {
  CreateCenterInput,
  ListCentersQuery,
  UpdateCenterInput,
} from './distribution-centers.schemas.js';

export async function listCenters(query: ListCentersQuery) {
  const where: Prisma.DistributionCenterWhereInput =
    query.search === undefined
      ? {}
      : {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { address: { contains: query.search, mode: 'insensitive' } },
          ],
        };
  const [items, total] = await prisma.$transaction([
    prisma.distributionCenter.findMany({
      where,
      orderBy: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.distributionCenter.count({ where }),
  ]);
  return { items, meta: paginationMeta(query.page, query.pageSize, total) };
}

export async function getCenter(id: string) {
  const center = await prisma.distributionCenter.findUnique({
    where: { id },
    include: { _count: { select: { deliveries: true } } },
  });
  if (center === null) throw notFound('Centro de distribuição');
  return center;
}

export const createCenter = (input: CreateCenterInput) =>
  prisma.distributionCenter.create({ data: input });

export async function updateCenter(id: string, input: UpdateCenterInput) {
  await getCenter(id);
  return prisma.distributionCenter.update({ where: { id }, data: input });
}

export async function deleteCenter(id: string) {
  const center = await getCenter(id);
  if (center._count.deliveries > 0) {
    throw conflict('Centro com entregas vinculadas não pode ser excluído.');
  }
  await prisma.distributionCenter.delete({ where: { id } });
}
