import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private bucket: any = null;
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
    const storageBucket = this.configService.get<string>('FIREBASE_STORAGE_BUCKET');

    if (projectId && clientEmail && privateKey && storageBucket && !admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
          storageBucket,
        });
        this.bucket = admin.storage().bucket();
        this.isConfigured = true;
        this.logger.log(`Firebase Storage initialized with bucket: ${storageBucket}`);
      } catch (err: any) {
        this.logger.warn(`Firebase Storage init error: ${err.message}. Operating in mock/local fallback mode.`);
      }
    } else {
      this.logger.warn('Firebase credentials not set in .env. Storage operating in local/mock mode.');
    }
  }

  async uploadFile(buffer: Buffer, destination: string, contentType: string): Promise<string> {
    if (this.isConfigured && this.bucket) {
      const file = this.bucket.file(destination);
      await file.save(buffer, {
        metadata: { contentType },
        resumable: false,
      });
      // Generate signed URL valid for 7 days
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });
      return url;
    }
    // Mock local disk write fallback
    try {
      const fs = require('fs');
      const path = require('path');
      const localFilePath = path.resolve(process.cwd(), '.data/uploads', destination);
      fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
      fs.writeFileSync(localFilePath, buffer);
      this.logger.log(`[Storage Mock] Saved ${buffer.length} bytes to local disk: ${localFilePath}`);
    } catch (e: any) {
      this.logger.warn(`[Storage Mock] Could not persist to disk: ${e.message}`);
    }
    return `/storage-mock/${destination}`;
  }

  async getDownloadUrl(filePath: string): Promise<string> {
    if (this.isConfigured && this.bucket) {
      const file = this.bucket.file(filePath);
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });
      return url;
    }
    return `/storage-mock/${filePath}`;
  }
}
