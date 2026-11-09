import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AssetTransfer,
  TransferStatus,
} from './entities/asset-transfer.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(AssetTransfer)
    private readonly transferRepo: Repository<AssetTransfer>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll() {
    return this.transferRepo.find();
  }

  async findById(id: string) {
    const tr = await this.transferRepo.findOne({ where: { id } });
    if (!tr) throw new NotFoundException(`Transfer ${id} not found`);
    return tr;
  }

  async create(dto: Partial<AssetTransfer>) {
    const tr = this.transferRepo.create({
      ...dto,
      status: TransferStatus.PENDING,
    });
    return this.transferRepo.save(tr);
  }

  async approve(id: string, approverUserId: string) {
    const tr = await this.findById(id);
    if (tr.status !== TransferStatus.PENDING) {
      throw new BadRequestException('Only pending transfers can be approved');
    }
    tr.status = TransferStatus.APPROVED;
    tr.approvedByUserId = approverUserId;
    const saved = await this.transferRepo.save(tr);

    // Notify the requester
    this.notificationsService.create({
      userId: tr.requestedByUserId,
      title: 'Transfer Approved',
      message: `Your transfer request for asset ${tr.assetId} has been approved.`,
      type: 'INFO' as any,
    }).catch(() => {/* non-blocking */});

    return saved;
  }

  async reject(id: string, reason: string) {
    const tr = await this.findById(id);
    if (tr.status !== TransferStatus.PENDING) {
      throw new BadRequestException('Only pending transfers can be rejected');
    }
    tr.status = TransferStatus.REJECTED;
    tr.rejectionReason = reason;
    const saved = await this.transferRepo.save(tr);

    // Notify the requester
    this.notificationsService.create({
      userId: tr.requestedByUserId,
      title: 'Transfer Rejected',
      message: reason
        ? `Your transfer request was rejected: ${reason}`
        : `Your transfer request for asset ${tr.assetId} was rejected.`,
      type: 'WARNING' as any,
    }).catch(() => {/* non-blocking */});

    return saved;
  }
}
