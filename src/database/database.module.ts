import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { appConfig } from '../config/app.config';

@Module({
    imports: [
        MongooseModule.forRoot(appConfig.MONGODB_URI, {
            autoIndex: true,
        }),
    ],
})
export class DatabaseModule { }