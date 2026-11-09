import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../assets/entities/asset.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
  ) {}

  async getSummary(from?: string, to?: string) {
    const qb = this.assetRepo
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('asset.department', 'department')
      .where('asset.deletedAt IS NULL');

    if (from) qb.andWhere('asset.createdAt >= :from', { from });
    if (to) qb.andWhere('asset.createdAt <= :to', { to: `${to}T23:59:59` });

    const assets = await qb.getMany();

    const total = assets.length;

    // By status
    const byStatus: Record<string, number> = {};
    for (const a of assets) {
      byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
    }

    // By category
    const catMap = new Map<string, number>();
    for (const a of assets) {
      const name = a.category?.name ?? 'Uncategorised';
      catMap.set(name, (catMap.get(name) ?? 0) + 1);
    }
    const byCategory = Array.from(catMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    // By department
    const deptMap = new Map<string, number>();
    for (const a of assets) {
      const name = a.department?.name ?? 'Unassigned';
      deptMap.set(name, (deptMap.get(name) ?? 0) + 1);
    }
    const byDepartment = Array.from(deptMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    // Recent (last 10, sorted by createdAt desc)
    const recent = [...assets]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 10)
      .map((a) => ({
        id: a.id,
        assetId: a.assetTag,
        name: a.name,
        status: a.status,
        createdAt: a.createdAt,
        category: a.category ? { name: a.category.name } : null,
        department: a.department ? { name: a.department.name } : null,
      }));

    return { total, byStatus, byCategory, byDepartment, recent };
  }
}
