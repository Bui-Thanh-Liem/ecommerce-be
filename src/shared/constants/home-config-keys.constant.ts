import { IDetailHomeConfig } from '../interfaces/models/store-front/store-front-config.interface';

export const DETAIL_HOME_CONFIG_KEYS = [
  'topBanner',
  'header',
  'menu',
  'mainBanner',
  'listCategories',
  'historyProducts',
  'mktSessionOne',
  'mktSessionTwo',
  'suggestForYou',
  'mktSessionThree',
  'mktSessionFour',
  'mktSessionFive',
  'topic',
] as (keyof IDetailHomeConfig)[];
