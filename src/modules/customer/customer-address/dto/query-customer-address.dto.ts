import { createQueryDto } from '@/shared/dtos/req/query.dto';

class CustomerAddressFilterDto {}

export class CustomerAddressQueryDto extends createQueryDto(CustomerAddressFilterDto) {}
