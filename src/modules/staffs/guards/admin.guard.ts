import { CanActivate, ExecutionContext, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { StaffsService } from '../staffs.service';

/**
 * @desc Guard này sẽ được sử dụng để bảo vệ các route chỉ dành cho Super/Sub Admin.
 * @desc Nó sẽ kiểm tra xem staff hiện tại có phải là Super Admin hay không trước khi cho phép truy cập vào route.
 * @desc Nó sẽ kiểm tra route staff/:id
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  constructor(private readonly staffService: StaffsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const staffId = req.params.id as string;
    const currentStaff = req.staff;

    if (!currentStaff || !staffId) return true;

    // Nạp targetStaff kèm theo quan hệ directManager để check cấp bậc
    const targetStaff = await this.staffService.findOne(staffId);

    if (!targetStaff) throw new NotFoundException('Staff not found');
    req.targetStaff = targetStaff;

    // --- KIỂM TRA PHÂN CẤP QUYỀN HẠN ---

    // 1. Thao tác với chính mình
    if (currentStaff.id === targetStaff.id) return true;

    // 2. Super Admin: Toàn quyền
    if (currentStaff.isSuperAdmin) return true;

    // 3. Kiểm tra Quan hệ Quản lý Trực tiếp (Cấp trên - Cấp dưới)
    // Nếu người đăng nhập là quản lý trực tiếp của người bị thao tác
    if (targetStaff.directManager?.id === currentStaff.id) {
      return true;
    }

    // 4. Sub Admin:
    if (currentStaff.isSubAdmin) {
      // Sub Admin không được đụng vào Super Admin hoặc Sub Admin khác
      // (trừ khi đã thỏa mãn điều kiện quản lý trực tiếp ở bước 3)
      if (targetStaff.isSuperAdmin || targetStaff.isSubAdmin) {
        return false;
      }
      return true; // Được thao tác với Staff thường
    }

    // 5. Staff thường:
    // Nếu đã xuống đến đây nghĩa là:
    // - Không phải tự sửa mình
    // - Không phải quản lý trực tiếp của targetStaff
    // -> Không có quyền
    this.logger.warn(`Staff ${currentStaff.id} denied access to ${targetStaff.id}`);
    return false;
  }
}
