import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SalesModule } from './sales/sales.module';
import { CustomersModule } from './customers/customers.module';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WhatsappApiModule } from './whatsapp-api/whatsapp-api.module';
import { CreditsModule } from './credits/credits.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_CONN_STRING),
    MulterModule.register({
      storage: memoryStorage(),
    }),
    ProductsModule,
    UsersModule,
    AuthModule,
    SalesModule,
    CustomersModule,
    CategoriesModule,
    SubcategoriesModule,
    OrdersModule,
    NotificationsModule,
    WhatsappApiModule,
    CreditsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
