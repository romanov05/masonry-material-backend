import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasonryMaterialModule } from './masonry-material/masonry-material.module';
import { MasonryMaterialUserModule } from './masonry-material-user/masonry-material-user.module';
import { MasonryMaterialAuthModule } from './masonry-material-auth/masonry-material-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 5432)),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    MasonryMaterialAuthModule,
    MasonryMaterialModule,
    MasonryMaterialUserModule,
  ],
})
export class AppModule {}
