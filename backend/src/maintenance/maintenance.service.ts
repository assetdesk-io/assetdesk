import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceRecord } from './entities/maintenance-record.entity';
import { CreateMaintenanceRecordDto } from './dto/create-maintenance-record.dto';
import { UpdateMaintenanceRecordDto } from './dto/update-maintenance-record.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

export interface MaintenanceQuery {
  assetId?: string;
  status?: string;
  type?: string;
  departmentId?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceRecord)
    private readonly maintenanceRepo: Repository<MaintenanceRecord>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(query?: MaintenanceQuery) {
    const qb = this.maintenanceRepo.createQueryBuilder('record');

    if (query?.departmentId) {
      qb.innerJoin('assets', 'asset', 'asset.id = record.assetId').andWhere(
        'asset.departmentId = :departmentId',
        { departmentId: query.departmentId },
      );
    }
    if (query?.assetId)
      qb.andWhere('record.assetId = :assetId', { assetId: query.assetId });
    if (query?.status)
      qb.andWhere('record.status = :status', { status: query.status });
    if (query?.type) qb.andWhere('record.type = :type', { type: query.type });
    if (query?.from)
      qb.andWhere('record.scheduledDate >= :from', { from: query.from });
    if (query?.to) qb.andWhere('record.scheduledDate <= :to', { to: query.to });

    qb.orderBy('record.scheduledDate', 'ASC');
    return qb.getMany();
  }

  async findById(id: string) {
    const record = await this.maintenanceRepo.findOne({ where: { id } });
    if (!record)
      throw new NotFoundException(`Maintenance record ${id} not found`);
    return record;
  }

  async create(dto: CreateMaintenanceRecordDto, assetIdFromParam?: string) {
    const assetId = assetIdFromParam ?? dto.assetId;
    if (!assetId) throw new BadRequestException('assetId is required');

    const record = this.maintenanceRepo.create({
      ...dto,
      assetId,
      title: dto.title || dto.description || 'Maintenance',
      scheduledDate: dto.scheduledDate
        ? new Date(dto.scheduledDate)
        : undefined,
    });
    const saved = await this.maintenanceRepo.save(record);

    // If scheduled date is already in the past, fire an overdue alert for the creator
    if (saved.scheduledDate && saved.scheduledDate < new Date() && dto.createdByUserId) {
      this.notificationsService
        .create({
          userId: dto.createdByUserId,
          title: 'Maintenance overdue',
          message: `Maintenance "${saved.title}" for asset ${assetId} was scheduled in the past and is already overdue.`,
          type: NotificationType.ALERT,
        })
        .catch(() => {/* non-blocking */});
    }

    return saved;
  }

  async update(id: string, dto: UpdateMaintenanceRecordDto) {
    const record = await this.findById(id);
    Object.assign(record, dto, {
      scheduledDate: dto.scheduledDate
        ? new Date(dto.scheduledDate)
        : record.scheduledDate,
      completedDate: dto.completedDate
        ? new Date(dto.completedDate)
        : record.completedDate,
    });
    return this.maintenanceRepo.save(record);
  }

  async updateStatus(id: string, status: string) {
    const record = await this.findById(id);
    record.status = status as MaintenanceRecord['status'];
    if (status === 'COMPLETED' && !record.completedDate) {
      record.completedDate = new Date();
    }
    return this.maintenanceRepo.save(record);
  }
}
