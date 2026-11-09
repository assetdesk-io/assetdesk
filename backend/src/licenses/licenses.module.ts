import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { License } from './entities/license.entity';
import { LicenseSeatAssignment } from './entities/license-seat-assignment.entity';
import { LicensesService } from './licenses.service';
import { LicensesController } from './licenses.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([License, LicenseSeatAssignment]),
    NotificationsModule,
  ],
  providers: [LicensesService],
  controllers: [LicensesController],
  exports: [LicensesService],
})
export class LicensesModule {}
