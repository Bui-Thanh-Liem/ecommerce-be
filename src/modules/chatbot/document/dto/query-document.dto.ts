import { createQueryDto } from '@/shared/dtos/req/query.dto';

class DocumentFilterDto {}

export class DocumentQueryDto extends createQueryDto(DocumentFilterDto) {}
