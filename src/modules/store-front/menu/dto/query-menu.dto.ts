import { createQueryDto } from '@/shared/dtos/req/query.dto';

class MenuFilterDto {}

export class MenuQueryDto extends createQueryDto(MenuFilterDto) {}
