import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { StaffTokensService } from '../staff-tokens/staff-tokens.service';
import { StaffEntity } from '../staffs/entities/staff.entity';
import { StaffsService } from '../staffs/staffs.service';
import { StaffTokenType } from 'src/shared/enums/staff-token-type.enum';

@Injectable()
export class AuthService {
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
    const { access } = await this.staffTokensService.updateAuthToken(staff.id);

    // Return staff data and token
    return { staff, token: access };
  }

  // Sign out a staff by revoking the token
  async signOut(userId: string) {
    await this.staffTokensService.delete(userId, StaffTokenType.REFRESH);
  }
}
