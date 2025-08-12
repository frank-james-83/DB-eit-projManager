// 项目管理的本地 mock 数据
export const mockProjects = [
  {
    id: 1,
    projectId: 'EIT-2023-001',
    name: '智能工厂系统开发',
    manager: '张三',
    startDate: '2023-01-15',
    endDate: '2023-06-30',
    startPosition: 10,
    duration: 30,
    color: '#42b983',
    plannedHours: 2400,
    usedHours: 1800,
    progress: 75,
    status: 'inProgress',
    budget: 500000,
    spent: 350000,
    estimatedCost: 480000,
    costVariance: -20000,
    description: '为某汽车制造企业开发智能工厂管理系统，实现生产流程自动化与数据可视化',
    milestones: [
      { name: '需求分析完成', date: '2023-02-10', completed: true },
      { name: '系统设计完成', date: '2023-03-15', completed: true },
      { name: '核心模块开发', date: '2023-05-20', completed: false },
      { name: '系统上线', date: '2023-06-30', completed: false }
    ],
    timeRecords: [
      { date: '2023-05-01', user: '张三', hours: 8, task: '系统架构优化' },
      { date: '2023-05-02', user: '李四', hours: 6, task: '数据库设计' },
      { date: '2023-05-03', user: '王五', hours: 7, task: '前端界面开发' },
      { date: '2023-05-04', user: '赵六', hours: 8, task: '后端接口开发' }
    ]
  },
  {
    id: 2,
    projectId: 'EIT-2023-002',
    name: '数据分析平台建设',
    manager: '李四',
    startDate: '2023-03-01',
    endDate: '2023-09-30',
    startPosition: 20,
    duration: 40,
    color: '#f39c12',
    plannedHours: 3600,
    usedHours: 1500,
    progress: 40,
    status: 'inProgress',
    budget: 800000,
    spent: 400000,
    estimatedCost: 820000,
    costVariance: 20000,
    description: '构建企业级数据分析平台，整合多源数据，提供实时分析与决策支持',
    milestones: [
      { name: '数据调研完成', date: '2023-03-20', completed: true },
      { name: '数据仓库搭建', date: '2023-05-30', completed: false },
      { name: '分析模型开发', date: '2023-08-15', completed: false },
      { name: '平台验收', date: '2023-09-30', completed: false }
    ],
    timeRecords: [
      { date: '2023-05-01', user: '李四', hours: 8, task: '数据模型设计' },
      { date: '2023-05-02', user: '王五', hours: 7, task: 'ETL流程开发' },
      { date: '2023-05-03', user: '赵六', hours: 6, task: '可视化组件开发' }
    ]
  },
  {
    id: 3,
    projectId: 'EIT-2023-003',
    name: '移动应用开发',
    manager: '王五',
    startDate: '2023-05-01',
    endDate: '2023-11-30',
    startPosition: 40,
    duration: 35,
    color: '#e74c3c',
    plannedHours: 1800,
    usedHours: 450,
    progress: 25,
    status: 'inProgress',
    budget: 300000,
    spent: 80000,
    estimatedCost: 290000,
    costVariance: -10000,
    description: '开发面向最终用户的移动应用，支持iOS和Android平台，提供便捷的业务操作功能',
    milestones: [
      { name: '原型设计完成', date: '2023-05-20', completed: false },
      { name: 'iOS版本开发', date: '2023-08-30', completed: false },
      { name: 'Android版本开发', date: '2023-09-30', completed: false },
      { name: '应用发布', date: '2023-11-30', completed: false }
    ],
    timeRecords: [
      { date: '2023-05-02', user: '王五', hours: 8, task: 'UI设计评审' },
      { date: '2023-05-03', user: '赵六', hours: 8, task: 'API接口对接' },
      { date: '2023-05-04', user: '张三', hours: 6, task: '前端框架搭建' }
    ]
  }
];
