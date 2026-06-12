import { TeamCategoryCode } from '@/shared/enums/team-category-code.enum';
import { TeamType } from '@/shared/enums/team-type.enum';
import { ITeamCategory } from '@/shared/interfaces/models/management/team-category.interface';

export const teamCategorySeed: Pick<ITeamCategory, 'code' | 'name' | 'type'>[] = [
  {
    name: 'Administration',
    type: TeamType.HEADQUARTER,
    code: TeamCategoryCode.ADMINISTRATION,
  },
  {
    name: 'Strategic Planning',
    type: TeamType.HEADQUARTER,
    code: TeamCategoryCode.STRATEGIC_PLANNING,
  },
  {
    name: 'Central Purchasing',
    type: TeamType.HEADQUARTER,
    code: TeamCategoryCode.CENTRAL_PURCHASING,
  },
  {
    name: 'Sales',
    type: TeamType.STORE,
    code: TeamCategoryCode.SALES,
  },
  {
    name: 'Marketing',
    type: TeamType.STORE,
    code: TeamCategoryCode.MARKETING,
  },
  {
    name: 'Customer Service',
    type: TeamType.STORE,
    code: TeamCategoryCode.CUSTOMER_SERVICE,
  },
  {
    name: 'Warehouse',
    type: TeamType.STORE,
    code: TeamCategoryCode.WAREHOUSE,
  },
  {
    name: 'Delivery',
    type: TeamType.STORE,
    code: TeamCategoryCode.DELIVERY,
  },
  {
    name: 'Technical Fix',
    type: TeamType.STORE,
    code: TeamCategoryCode.TECHNICAL_FIX,
  },
  {
    name: 'Accounting',
    type: TeamType.HEADQUARTER,
    code: TeamCategoryCode.ACCOUNTING,
  },
];
