// 项目管理的本地 mock 数据
export const mockProjects = [
  {
    id: 1,
    projectId: 'EIT-2023-001',
    name: '智能工厂系统开发',
    manager: '张三',
    startDate: '2023-01-15',
    endDate: '2023-03-10',
    periods: [
  { start: '2023-01-15', end: '2023-01-30', hours: 120, user: '张三', comment: '前期需求梳理' },
  { start: '2023-02-10', end: '2023-02-20', hours: 80, user: '李四', comment: '系统设计与评审' },
  { start: '2026-03-01', end: '2026-03-10', hours: 100, user: '王五', comment: '开发与测试' }
    ],
    color: '#42b983',
    budgetHours: 2400,
    status: 'inProgress',
    budget: 500000,
    spent: 350000,
    estimatedCost: 480000,
    costVariance: -20000,
    description: '为某汽车制造企业开发智能工厂管理系统，实现生产流程自动化与数据可视化',
    milestones: [
      { name: '需求分析完成', date: '2023-02-10', completed: true, tag: 'KO' },
      { name: '系统设计完成', date: '2023-03-01', completed: true, tag: 'DL' },
      { name: '核心模块开发', date: '2023-03-05', completed: false, tag: 'P' },
      { name: '系统上线', date: '2023-03-10', completed: false, tag: 'FSB' }
    ],
    timeRecords: [
      { date: '2023-02-01', user: '张三', hours: 8, task: '系统架构优化' },
      { date: '2023-02-02', user: '李四', hours: 6, task: '数据库设计' },
      { date: '2023-02-03', user: '王五', hours: 7, task: '前端界面开发' },
      { date: '2026-02-04', user: '赵六', hours: 8, task: '后端接口开发' }
    ],
    equipments: [
      {
        id: 1,
        localName: '吹瓶机',
        englishName: 'Combi-blower',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'SBO22M#220086 COMBI C5 SBMXGM220086',
        ipAddress: '',
        plcType: 'B&R',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      },
      {
        id: 2,
        localName: '灌装机',
        englishName: 'Combi-filler',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'Combi Predis FMa 22/100/30T #1542',
        ipAddress: '',
        plcType: 'SIEMENS',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      },
      {
        id: 3,
        localName: '上盖机',
        englishName: 'cap feeder',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'Aidlin 24-24',
        ipAddress: '',
        plcType: 'SIEMENS',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      }
    ]
  },
  {
    id: 2,
    projectId: 'EIT-2023-002',
    name: '数据分析平台建设',
    manager: '李四',
    startDate: '2023-02-20',
    endDate: '2023-05-15',
    periods: [
  { start: '2023-02-20', end: '2023-03-05', hours: 90, user: '李四', comment: '数据采集' },
  { start: '2023-04-01', end: '2023-04-10', hours: 60, user: '王五', comment: '数据仓库搭建' },
  { start: '2023-05-01', end: '2023-05-15', hours: 110, user: '赵六', comment: '平台开发' }
    ],
    color: '#f39c12',
    budgetHours: 3600,
    status: 'inProgress',
    budget: 800000,
    spent: 400000,
    estimatedCost: 820000,
    costVariance: 20000,
    description: '构建企业级数据分析平台，整合多源数据，提供实时分析与决策支持',
    milestones: [
      { name: '数据调研完成', date: '2023-03-01', completed: true, tag: 'KO' },
      { name: '数据仓库搭建', date: '2023-04-01', completed: false, tag: 'DL' },
      { name: '分析模型开发', date: '2023-05-01', completed: false, tag: 'P' },
      { name: '平台验收', date: '2023-05-15', completed: false, tag: 'CAV' }
    ],
    timeRecords: [
      { date: '2023-03-01', user: '李四', hours: 8, task: '数据模型设计' },
      { date: '2023-03-02', user: '王五', hours: 7, task: 'ETL流程开发' },
      { date: '2023-03-03', user: '赵六', hours: 6, task: '可视化组件开发' }
    ],
    equipments: [
      {
        id: 1,
        localName: '吹瓶机',
        englishName: 'Combi-blower',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'SBO22M#220086 COMBI C5 SBMXGM220086',
        ipAddress: '',
        plcType: 'B&R',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      },
      {
        id: 2,
        localName: '灌装机',
        englishName: 'Combi-filler',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'Combi Predis FMa 22/100/30T #1542',
        ipAddress: '',
        plcType: 'SIEMENS',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      },
      {
        id: 3,
        localName: '上盖机',
        englishName: 'cap feeder',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'Aidlin 24-24',
        ipAddress: '',
        plcType: 'SIEMENS',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      }
    ]
  },
  {
    id: 3,
    projectId: 'EIT-2023-003',
    name: '移动应用开发',
    manager: '王五',
    startDate: '2023-04-10',
    endDate: '2023-06-25',
    periods: [
  { start: '2023-04-10', end: '2023-04-25', hours: 50, user: '王五', comment: '原型设计' },
  { start: '2023-05-10', end: '2023-05-20', hours: 60, user: '赵六', comment: 'iOS开发' },
  { start: '2023-06-01', end: '2023-06-25', hours: 70, user: '张三', comment: 'Android开发' }
    ],
    color: '#e74c3c',
    budgetHours: 1200,
    status: 'inProgress',
    budget: 300000,
    spent: 80000,
    estimatedCost: 290000,
    costVariance: -10000,
    description: '开发面向最终用户的移动应用，支持iOS和Android平台，提供便捷的业务操作功能',
    milestones: [
      { name: '原型设计完成', date: '2023-04-20', completed: false, tag: 'KO' },
      { name: 'iOS版本开发', date: '2023-05-30', completed: false, tag: 'FSB' },
      { name: 'Android版本开发', date: '2023-06-10', completed: false, tag: 'DL' },
      { name: '应用发布', date: '2023-06-25', completed: false, tag: 'CAV' }
    ],
    timeRecords: [
      { date: '2023-05-02', user: '王五', hours: 8, task: 'UI设计评审' },
      { date: '2023-05-03', user: '赵六', hours: 8, task: 'API接口对接' },
      { date: '2023-05-04', user: '张三', hours: 6, task: '前端框架搭建' }
    ],
    equipments: [
      {
        id: 1,
        localName: '吹瓶机',
        englishName: 'Combi-blower',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'SBO22M#220086 COMBI C5 SBMXGM220086',
        ipAddress: '',
        plcType: 'B&R',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      },
      {
        id: 2,
        localName: '灌装机',
        englishName: 'Combi-filler',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'Combi Predis FMa 22/100/30T #1542',
        ipAddress: '',
        plcType: 'SIEMENS',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      },
      {
        id: 3,
        localName: '上盖机',
        englishName: 'cap feeder',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'Aidlin 24-24',
        ipAddress: '',
        plcType: 'SIEMENS',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      }
    ]
  },

  // mock 跨月、跨周项目
  {
    id: 4,
    projectId: 'EIT-2023-004',
    name: 'ERP系统升级',
    manager: '赵六',
    startDate: '2023-03-25',
    endDate: '2023-04-15',
    periods: [
  { start: '2023-03-25', end: '2023-03-28', hours: 30, user: '赵六', comment: '调研与准备' },
  { start: '2023-04-05', end: '2023-04-15', hours: 60, user: '张三', comment: '系统升级实施' }
    ],
    color: '#8e44ad',
    budgetHours: 1200,
    status: 'inProgress',
    budget: 200000,
    spent: 100000,
    estimatedCost: 210000,
    costVariance: 10000,
    description: '企业ERP系统升级，提升业务流程自动化水平',
    milestones: [
      { name: '需求调研', date: '2023-03-28', completed: true, tag: 'KO' },
      { name: '系统开发', date: '2023-04-10', completed: false, tag: 'P' },
      { name: '上线验收', date: '2023-04-15', completed: false, tag: 'CAV' }
    ],
    timeRecords: [
      { date: '2023-03-26', user: '赵六', hours: 8, task: '需求分析' },
      { date: '2023-04-01', user: '张三', hours: 7, task: '系统开发' }
    ],
    equipments: [
      {
        id: 1,
        localName: '吹瓶机',
        englishName: 'Combi-blower',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'SBO22M#220086 COMBI C5 SBMXGM220086',
        ipAddress: '',
        plcType: 'B&R',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      },
      {
        id: 2,
        localName: '灌装机',
        englishName: 'Combi-filler',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'Combi Predis FMa 22/100/30T #1542',
        ipAddress: '',
        plcType: 'SIEMENS',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      },
      {
        id: 3,
        localName: '上盖机',
        englishName: 'cap feeder',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'Aidlin 24-24',
        ipAddress: '',
        plcType: 'SIEMENS',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      }
    ]
  },
  {
    id: 5,
    projectId: 'EIT-2023-005',
    name: '新产品推广',
    manager: '李四',
    startDate: '2023-05-29',
    endDate: '2023-06-05',
    periods: [
  { start: '2023-05-29', end: '2023-05-31', hours: 20, user: '李四', comment: '活动策划' },
  { start: '2023-06-03', end: '2023-06-05', hours: 15, user: '王五', comment: '执行与总结' }
    ],
    color: '#16a085',
    budgetHours: 1200,
    status: 'notStarted',
    budget: 100000,
    spent: 20000,
    estimatedCost: 95000,
    costVariance: -5000,
    description: '新产品市场推广活动，覆盖多渠道',
    milestones: [
      { name: '活动策划', date: '2023-05-30', completed: false, tag: 'KO' },
      { name: '渠道对接', date: '2023-06-02', completed: false, tag: 'DL' },
      { name: '推广执行', date: '2023-06-05', completed: false, tag: 'FSB' }
    ],
    timeRecords: [
      { date: '2023-05-29', user: '李四', hours: 8, task: '活动策划' }
    ],
    equipments: [
      {
        id: 1,
        localName: '吹瓶机',
        englishName: 'Combi-blower',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'SBO22M#220086 COMBI C5 SBMXGM220086',
        ipAddress: '',
        plcType: 'B&R',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      },
      {
        id: 2,
        localName: '灌装机',
        englishName: 'Combi-filler',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'Combi Predis FMa 22/100/30T #1542',
        ipAddress: '',
        plcType: 'SIEMENS',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      },
      {
        id: 3,
        localName: '上盖机',
        englishName: 'cap feeder',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'Aidlin 24-24',
        ipAddress: '',
        plcType: 'SIEMENS',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      }
    ],
    ecos: [
      {
        id: 1,
        consumptionNameChinese: '贴标机电能',
        consumptionNameEnglish: 'Labeller Power',
        unit: 'kWh',
        unitPrice: '24$/kWh'
      },
      {
        id: 2,
        consumptionNameChinese: '灌装机双氧水',
        consumptionNameEnglish: 'Filler H2O2',
        unit: 'm³',
        unitPrice: '12$/m3'
      }
    ]
  }
];