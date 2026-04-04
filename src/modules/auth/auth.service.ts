import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { IJwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { StaffEntity } from '../staffs/entities/staff.entity';
import { StaffsService } from '../staffs/staffs.service';

@Injectable()
export class AuthService {
  constructor(
    private staffsService: StaffsService,
    private configService: ConfigService,
  ) {}

  // Validate staff credentials (local)
  async validateStaff(email: string, password: string) {
    // Find staff by email
    const staff = await this.staffsService.findByEmail(email);
    if (!staff) throw new UnauthorizedException('Invalid credentials');

    // Check status of staff
    // ...

    // Compare password
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return staff;
  }

  // Sign in a staff handle logic when staff is authenticated successfully (local - facebook - google)
  signIn(staff: StaffEntity) {
    // Generate JWT token
    const token = this.generateJwtToken({ userId: staff.id, type: 'access' });

    // Return staff data and token
    return { user: staff, token };
  }

  // Sign out a staff (clear session or invalidate token)
  generateJwtToken(payload: IJwtPayload): string {
    // In a real application, use environment variables for the secret and consider token expiration
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return sign(payload, this.configService.get('JWT_SECRET') || 'key-secret', {
      expiresIn: '8h',
    });
  }
}
