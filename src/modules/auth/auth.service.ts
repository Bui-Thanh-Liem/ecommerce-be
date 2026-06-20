import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { StaffTokensService } from '../management/staff-tokens/staff-tokens.service';
import { TokenType } from '@/shared/enums/token-type.enum';
import { StaffsService } from '../management/staffs/staffs.service';
import { StaffEntity } from '../management/staffs/entities/staff.entity';
import { IJwtPayload } from '@/shared/interfaces/common/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger();

  constructor(
    private staffsService: StaffsService,
    private staffTokensService: StaffTokensService,
  ) {}

  // Validate staff credentials (local)
  async validateStaff(phone: string, password: string) {
    // Find staff by phone
    const staff = await this.staffsService.findByPhone(phone);
    if (!staff) throw new UnauthorizedException('Invalid credentials');

    // Check status of staff
    if (staff.isActive === false) throw new UnauthorizedException('Your account has been deactivated');

    // Compare password
    const isMatch = await compare(password, staff.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return staff;
  }

  // Sign in a staff handle logic when staff is authenticated successfully (local - facebook - google)
  async signIn(staff: StaffEntity) {
    //

    // Generate JWT access token
    const { access, refresh } = await this.staffTokensService.updateAuthToken(staff.id);

    // Return staff data and token
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...staffData } = staff;

    //
    return { staff: staffData, accessToken: access, refreshToken: refresh };
  }

  //
  async refreshToken(refreshToken: string, jwtPayload: IJwtPayload) {
    try {
      return await this.staffTokensService.refreshAuthToken(refreshToken, jwtPayload);
    } catch (error) {
      this.logger.error('Refresh token fail :::', error);
      return false;
    }
  }

  // Sign out a staff by revoking the token
  async signOut(staffId: string) {
    await this.staffTokensService.delete(staffId, TokenType.REFRESH);
  }
}
