export default [
  {
    path: '/',
    component: '../layouts/BlankLayout',
    routes: [
      {
        path: '/error',
        component: './error',
      },
      {
        path: '/',
        component: '../layouts/SecurityLayout',
        routes: [
          {
            path: '/',
            redirect: 'app/scene',
          },
          {
            path: '/scene',
            component: '../layouts/SceneLayout',
            authority: ['user'],
            routes: [
              {
                path: '/scene/experiment',
                name: '实验列表',
                icon: 'experiment',
                component: './experiment/ExperimentList',
              },
              {
                hideInMenu: true,
                name: '实验详情',
                path: '/scene/experiment/update',
                component: './experiment/Update',
              },
              {
                hideInMenu: true,
                name: '发布单',
                path: '/scene/publish/detail',
                component: './publish/PublishDetails',
              },
              {
                hideInMenu: true,
                path: '/scene/publish/rollback',
                name: '回滚',
                component: './publish/PublishList',
              },
              {
                path: '/scene/rule',
                name: '分支列表',
                icon: 'edit',
                component: './rule/DevelopHome',
              },
              // {
              //   path: '/scene/publish',
              //   name: '线上发布',
              //   icon: 'rocket',
              //   component: './rule/PublishHome',
              // },
              // {
              //   path: '/scene/archive',
              //   name: '历史归档',
              //   icon: 'history',
              //   component: './rule/ArchiveHome',
              // },
              {
                hideInMenu: true,
                name: '基线分支',
                path: '/scene/rule/master',
                component: './rule/MasterView',
              },
              {
                hideInMenu: true,
                name: '分支详情',
                path: '/scene/rule/detail',
                component: './rule/Detail',
              },
              {
                hideInMenu: true,
                name: '编辑分支',
                path: '/scene/rule/update',
                component: './rule/NewUpdate',
              },
              {
                path: '/scene/publish',
                name: '发布列表',
                icon: 'history',
                component: './rule/ReleaseList',
              },
              // {
              //   path: '/scene/auditRule',
              //   name: '审批列表',
              //   icon: 'audit',
              //   component: './bpms/AuditList',
              // },
              {
                path: '/scene/report',
                name: '状态列表',
                icon: 'smile',
                component: './report/ReportList',
              },
              {
                hideInMenu: true,
                path: '/scene/releasehistory/historydetails',
                name: '发布列表',
                component: './rule/HistoryDetails',
              },
              {
                hideInMenu: true,
                path: '/scene/rule/diff',
                name: '规则对比',
                component: './rule/RuleDiff',
              },
              {
                component: './404',
              },
              {
                component: './error',
              },
            ],
          },
          {
            path: '/',
            component: '../layouts/HomeLayout',
            authority: ['user'],
            routes: [
              {
                path: '/unselected',
                component: './unselected',
              },
              {
                path: 'app',
                name: '应用中心',
                icon: 'appstore',
                routes: [
                  {
                    path: '/app/scene',
                    name: '场景管理',
                    component: './app/SceneList',
                  },
                  {
                    hideInMenu: true,
                    path: '/app/scene/strategy',
                    name: '场景管理',
                    component: './scene/SceneStrategyList',
                  },
                  {
                    path: '/app/strategyDeploy',
                    name: '策略部署',
                    component: './strategyDeploy/StrategyDeployList',
                  },
                  {
                    path: '/app/strategyVersion',
                    name: '控制台',
                    component: './strategyDeploy/StrategyVersionList',
                  },
                  {
                    path: '/app/experiment',
                    name: '实验室',
                    component: './experiment/AppExperimentList',
                  },
                  {
                    hideInMenu: true,
                    path: '/app/experiment/detail',
                    name: '实验详情',
                    component: './experiment/components/AppExperimentDetail',
                  },
                  {
                    hideInMenu: true,
                    path: '/app/strategyDeploy/diffPackageVersion',
                    name: '包版本Diff',
                    component: './app/components/DiffPackageVersion',
                  },
                  {
                    hideInMenu: true,
                    path: '/app/strategyDeploy/update',
                    name: '策略发布详情',
                    component: './strategyDeploy/components/EditStrategyDeploy',
                  },
                  {
                    hideInMenu: true,
                    path: '/app/strategyDeploy/rollback',
                    name: '策略发布回滚',
                    component: './strategyDeploy/components/RollbackStrategyDeploy',
                  },
                ],
              },
              {
                path: 'knowledge',
                name: '知识管理',
                icon: 'book',
                routes: [
                  {
                    path: '/knowledge/shop/feature',
                    name: '特征管理',
                    component: './featureConfig/feature/FeatureList',
                  },
                  {
                    path: '/knowledge/action',
                    name: '动作管理',
                    component: './app/ActionList',
                  },
                  {
                    path: '/knowledge/package',
                    name: '包管理',
                    component: './app/PackageList',
                  },
                  {
                    path: '/knowledge/strategy',
                    name: '策略管理',
                    component: './app/StrategyList',
                  },
                  {
                    hideInMenu: true,
                    path: '/knowledge/offlineStrategy',
                    name: '离线策略管理',
                    component: './offlineStrategy/OfflineStrategyList',
                  },
                  {
                    path: '/knowledge/flow',
                    name: '决策流管理',
                    component: './decisionFlow/DecisionFlowList',
                  },
                  {
                    hideInMenu: true,
                    path: '/knowledge/package/update',
                    name: '管理包内容',
                    component: './app/components/EditPackage',
                  },
                  {
                    hideInMenu: true,
                    path: '/knowledge/strategy/update',
                    name: '编辑策略',
                    component: './app/components/EditStrategy',
                  },
                  {
                    hideInMenu: true,
                    path: '/knowledge/strategy/detail',
                    name: '策略详情',
                    component: './app/components/DetailStrategy',
                  },
                  {
                    hideInMenu: true,
                    path: '/knowledge/offlineStrategy/update',
                    name: '编辑离线策略',
                    component: './offlineStrategy/components/EditOfflineStrategy',
                  },
                  {
                    hideInMenu: true,
                    path: '/knowledge/offlineStrategy/detail',
                    name: '离线策略详情',
                    component: './offlineStrategy/components/DetailOfflineStrategy',
                  },
                  {
                    hideInMenu: true,
                    path: '/knowledge/offlineStrategy/job',
                    name: '执行记录',
                    component: './offlineStrategy/components/JobOfflineStrategy',
                  },
                  {
                    hideInMenu: true,
                    path: '/knowledge/offlineStrategy/runCount',
                    name: '策略运行统计',
                    component: './offlineStrategy/components/StrategyRunCount',
                  },
                  {
                    hideInMenu: true,
                    path: '/knowledge/flow/update',
                    name: '编辑决策流',
                    component: './decisionFlow/components/EditDecisionFlow',
                  },
                ],
              },
              {
                path: 'statistics',
                name: '决策分析',
                icon: 'dashboard',
                routes: [
                  // {
                  //   path: '/statistics/deploy',
                  //   name: '发布统计',
                  //   component: './statistics/Deploy',
                  // },
                  // {
                  //   path: '/statistics/touch',
                  //   name: '触达统计',
                  //   component: './statistics/Touch',
                  // },
                  {
                    path: '/statistics/strategy',
                    name: '策略效果',
                    component: './statistics/Strategy',
                  },
                  {
                    path: '/statistics/experiment',
                    name: '实验效果',
                    component: './statistics/Experiment',
                  },
                ],
              },
              {
                path: 'system',
                name: '系统管理',
                icon: 'setting',
                routes: [
                  {
                    path: '/system/group',
                    name: '组管理',
                    component: './group/GroupList',
                  },
                  {
                    path: '/system/app',
                    name: '应用管理',
                    component: './app/AppList',
                  },
                  // {
                  //   path: '/system/deployConfig',
                  //   name: '发布配置管理',
                  //   component: './system/DeployConfigList',
                  // },
                ],
              },
              {
                component: './404',
              },
              {
                component: './error',
              },
            ],
          },
          {
            component: './404',
          },
          {
            component: './error',
          },
        ],
      },
    ],
  },
  {
    component: './404',
  },
  {
    component: './error',
  },
];
