export const permissionsSeed = {
  roles: {
    create: {
      keyGroup: 'Vai trò',
      name: 'create:roles',
      desc: 'Tạo vai trò',
      code: '001',
    },
    read: {
      keyGroup: 'Vai trò',
      name: 'read:roles',
      desc: 'Xem vai trò',
      code: '002',
    },
    update: {
      keyGroup: 'Vai trò',
      name: 'update:roles',
      desc: 'Cập nhật vai trò',
      code: '003',
    },
    delete: {
      keyGroup: 'Vai trò',
      name: 'delete:roles',
      desc: 'Xóa vai trò',
      code: '004',
    },
  },
  staffs: {
    create: {
      keyGroup: 'Nhân viên',
      name: 'create:staffs',
      desc: 'Tạo nhân viên',
      code: '005',
    },
    read: {
      keyGroup: 'Nhân viên',
      name: 'read:staffs',
      desc: 'Xem nhân viên',
      code: '006',
    },
    update: {
      keyGroup: 'Nhân viên',
      name: 'update:staffs',
      desc: 'Cập nhật nhân viên',
      code: '007',
    },
    delete: {
      keyGroup: 'Nhân viên',
      name: 'delete:staffs',
      desc: 'Xóa nhân viên',
      code: '008',
    },
  },
  locationRegions: {
    create: {
      keyGroup: 'Khu vực địa lý',
      name: 'create:locationRegions',
      desc: 'Tạo khu vực địa lý',
      code: '009',
    },
    read: {
      keyGroup: 'Khu vực địa lý',
      name: 'read:locationRegions',
      desc: 'Xem khu vực địa lý',
      code: '010',
    },
    update: {
      keyGroup: 'Khu vực địa lý',
      name: 'update:locationRegions',
      desc: 'Cập nhật khu vực địa lý',
      code: '011',
    },
    delete: {
      keyGroup: 'Khu vực địa lý',
      name: 'delete:locationRegions',
      desc: 'Xóa khu vực địa lý',
      code: '012',
    },
  },
  stores: {
    create: {
      keyGroup: 'Cửa hàng',
      name: 'create:stores',
      desc: 'Tạo cửa hàng',
      code: '013',
    },
    read: {
      keyGroup: 'Cửa hàng',
      name: 'read:stores',
      desc: 'Xem cửa hàng',
      code: '014',
    },
    update: {
      keyGroup: 'Cửa hàng',
      name: 'update:stores',
      desc: 'Cập nhật cửa hàng',
      code: '015',
    },
    delete: {
      keyGroup: 'Cửa hàng',
      name: 'delete:stores',
      desc: 'Xóa cửa hàng',
      code: '016',
    },
  },
  permissions: {
    view: {
      keyGroup: 'Quyền',
      name: 'view:permissions',
      desc: 'Xem quyền',
      code: '017',
    },
    update: {
      keyGroup: 'Quyền',
      name: 'update:permissions',
      desc: 'Cập nhật quyền',
      code: '018',
    },
  },
  category: {
    create: {
      keyGroup: 'Danh mục',
      name: 'create:categories',
      desc: 'Tạo danh mục',
      code: '019',
    },
    read: {
      keyGroup: 'Danh mục',
      name: 'read:categories',
      desc: 'Xem danh mục',
      code: '020',
    },
    update: {
      keyGroup: 'Danh mục',
      name: 'update:categories',
      desc: 'Cập nhật danh mục',
      code: '021',
    },
    delete: {
      keyGroup: 'Danh mục',
      name: 'delete:categories',
      desc: 'Xóa danh mục',
      code: '022',
    },
  },
};
