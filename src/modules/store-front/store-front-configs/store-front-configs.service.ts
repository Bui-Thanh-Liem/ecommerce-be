import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateStoreFrontConfigDto } from './dto/create-store-front-config.dto';
import { UpdateStoreFrontConfigDto } from './dto/update-store-front-config.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreFrontConfigEntity } from './entities/store-front-config.entity';
import { Repository } from 'typeorm';
import { IConfigHome } from '@/shared/interfaces/models/store-front/store-front-config.interface';
import { DETAIL_HOME_CONFIG_KEYS } from '@/shared/constants/home-config-keys.constant';
import { TopBannersService } from '../top-banners/top-banners.service';
import { MenuService } from '../menu/menu.service';

@Injectable()
export class StoreFrontConfigsService implements OnModuleInit {
  constructor(
    @InjectRepository(StoreFrontConfigEntity)
    private readonly repo: Repository<StoreFrontConfigEntity>,

    private readonly topBannersService: TopBannersService,
    private readonly menuService: MenuService,
  ) {}

  async onModuleInit() {
    await this.initializeConfig();
  }

  async create(dto: CreateStoreFrontConfigDto) {
    const storeFrontConfig = this.repo.create(dto);
    return this.repo.save(storeFrontConfig);
  }

  async findConfig() {
    const storeFrontConfigs = await this.repo.find();
    return storeFrontConfigs[0];
  }

  async update(id: string, dto: UpdateStoreFrontConfigDto) {
    const storeFrontConfig = await this.repo.findOneBy({ id });
    if (!storeFrontConfig) {
      throw new NotFoundException('StoreFrontConfig not found');
    }

    //
    const newHomeConfig: IConfigHome = {
      ...storeFrontConfig.homeConfig,
      order: [...storeFrontConfig.homeConfig.order, ...(dto.homeConfig?.order || [])],
      config: {
        ...storeFrontConfig.homeConfig.config,
        ...dto.homeConfig?.config,
      },
    };

    //
    const updatedConfig = this.repo.merge(storeFrontConfig, { homeConfig: newHomeConfig });
    return await this.repo.save(updatedConfig);
  }

  async initializeConfig() {
    const [existingConfigs, topBanner, menu] = await Promise.all([
      this.repo.exists(),
      this.topBannersService.findForConfig(),
      this.menuService.findForConfig(),
    ]);

    //
    if (!existingConfigs) {
      const homeConfig: IConfigHome = {
        order: DETAIL_HOME_CONFIG_KEYS,
        config: {
          topBanner: topBanner,
          header: '',
          menu: menu,
          mainBanner: [],
          listCategories: [],
          historyProducts: [],
          mktSessionOne: { title: '', mktPrograms: [] },
          mktSessionTwo: { title: '', mktPrograms: [] },
          suggestForYou: [],
          mktSessionThree: { title: '', campaign: {} },
          mktSessionFour: { title: '', campaign: {} },
          mktSessionFive: { title: '', campaigns: [] },
          topic: { title: '', topics: [] },
        },
      };

      //
      const defaultConfig = this.repo.create({
        homeConfig,
      });

      //
      await this.repo.save(defaultConfig);
    }
  }
}
