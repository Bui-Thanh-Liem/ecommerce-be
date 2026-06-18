import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateStoreFrontConfigDto } from './dto/create-store-front-config.dto';
import { UpdateStoreFrontConfigDto } from './dto/update-store-front-config.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreFrontConfigEntity } from './entities/store-front-config.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { IConfigHome } from '@/shared/interfaces/models/store-front/store-front-config.interface';
import { DETAIL_HOME_CONFIG_KEYS } from '@/shared/constants/home-config-keys.constant';
import { mergeWith } from 'lodash';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class StoreFrontConfigsService implements OnModuleInit {
  constructor(
    @InjectRepository(StoreFrontConfigEntity)
    private readonly repo: Repository<StoreFrontConfigEntity>,
  ) {}

  async onModuleInit() {
    await this.initializeConfig();
  }

  async create(dto: CreateStoreFrontConfigDto) {
    const storeFrontConfig = this.repo.create(dto);
    return this.repo.save(storeFrontConfig);
  }

  async findConfig() {
    const config = await this.repo.findOne({ where: { id: Not(IsNull()) } });
    console.log('Found config:', config?.homeConfig?.config.marketingProgram01.mktPrograms);
    return config;
  }

  async update(id: string, dto: UpdateStoreFrontConfigDto) {
    console.log('Updating store front config:', dto.homeConfig?.config);

    // 1. Tìm entity từ DB
    const storeFrontConfig = await this.repo.findOneBy({ id });
    if (!storeFrontConfig) {
      throw new NotFoundException('StoreFrontConfig not found');
    }

    // 2. Tạo bản sao sâu dữ liệu hiện tại từ DB
    const currentHomeConfig = JSON.parse(JSON.stringify(storeFrontConfig.homeConfig)) as IConfigHome;

    // 3. Sử dụng mergeWith để xử lý ghi đè mảng thay vì trộn index
    if (dto.homeConfig) {
      // Chuyển Class Instance thành Plain Object chuẩn của NestJS/class-transformer
      // (An toàn hơn JSON.parse(JSON.stringify) đối với Class Instance)
      const plainHomeConfig = instanceToPlain(dto.homeConfig) as IConfigHome;

      mergeWith(currentHomeConfig, plainHomeConfig, (objValue, srcValue) => {
        // Nếu giá trị đang merge là một Mảng, trả về mảng mới luôn chứ không merge từng phần tử
        if (Array.isArray(srcValue)) {
          return srcValue as unknown[];
        }
      });
    }

    // 4. Merge object cấu hình mới vào entity
    this.repo.merge(storeFrontConfig, { homeConfig: currentHomeConfig });

    // 5. Lưu lại xuống DB
    return await this.repo.save(storeFrontConfig);
  }

  async initializeConfig() {
    const existingConfigs = await this.repo.exists();

    //
    if (!existingConfigs) {
      const homeConfig: IConfigHome = {
        order: DETAIL_HOME_CONFIG_KEYS,
        config: {
          topBanner: null,
          header: '',
          menu: [],
          mainBanner: [],
          listCategories: [],
          historyProducts: '',
          marketingProgram01: { title: '', mktPrograms: [] },
          marketingProgram02: { campaign: [] },
          marketingProgram03: { title: '', mktPrograms: [] },
          suggestForYou: '',
          marketingProgram04: { title: '', campaign: null },
          marketingProgram05: { title: '', campaign: null },
          marketingProgram06: { title: '', campaigns: [] },
          topic: { title: '', topics: [] },
        },
      };

      //
      const defaultConfig = this.repo.create({ homeConfig });

      //
      await this.repo.save(defaultConfig);
    }
  }
}
