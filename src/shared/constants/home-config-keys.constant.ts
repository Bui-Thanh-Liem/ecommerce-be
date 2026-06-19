import { IDetailHomeConfig } from '../interfaces/models/store-front/store-front-config.interface';

export const DETAIL_HOME_CONFIG_KEYS = [
  'topBanner',
  'header',
  'menu',
  'mainBanner',
  'listCategories',
  'historyProducts',
  'marketingProgram01',
  'marketingProgram02',
  'suggestForYou',
  'marketingProgram03',
  'marketingProgram04',
  'marketingProgram05',
  'marketingProgram06',
  'popularSearch',
] as (keyof IDetailHomeConfig)[];
