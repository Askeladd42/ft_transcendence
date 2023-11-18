import { Module } from '@nestjs/common';
import { RelationController } from './relation.controller';
import { RelationService } from './relation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [PrismaModule, AuthModule],
  	providers: [PrismaModule, RelationService],
	controllers: [RelationController],
  	exports: [RelationService],
})
export class RelationModule {}
