import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceRecordDto } from './dto/create-maintenance-record.dto';
import { UpdateMaintenanceRecordDto } from './dto/update-maintenance-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('maintenance')
@ApiBearerAuth('JWT-auth')
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  @ApiOperation({
    summary: 'List all maintenance records across assets, with filters',
  })
  @ApiResponse({ status: 200, description: 'List of maintenance records' })
  findAll(
    @Query('assetId') assetId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('departmentId') departmentId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.maintenanceService.findAll({
      assetId,
      status,
      type,
      departmentId,
      from,
      to,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a maintenance record' })
  @ApiResponse({ status: 201, description: 'Maintenance record created' })
  create(@Body() dto: CreateMaintenanceRecordDto, @Req() req: any) {
    const createdByUserId: string | undefined = req.user?.id ?? req.user?.sub;
    return this.maintenanceService.create({ ...dto, createdByUserId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get maintenance record details' })
  @ApiResponse({ status: 200, description: 'Maintenance record details' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a maintenance record' })
  @ApiResponse({ status: 200, description: 'Maintenance record updated' })
  update(@Param('id') id: string, @Body() dto: UpdateMaintenanceRecordDto) {
    return this.maintenanceService.update(id, dto);
  }
}
