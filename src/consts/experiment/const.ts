/*
 * --------------------------------------------
 * Experiment consts
 */

export const ExperimentStatus = {
  0: '待提交',
  200: '实验中',
  400: '已全量',
  600: '已下线',
  // 800: { text: '已删除', status: 'Default' },
};

export const ExperimentType = {
  0: '分支实验',
  // 1: '策略实验',
}

export const ExperimentWhitelistType = {
  0: '分流ID'
}

/*
 * --------------------------------------------
 * ExperimentGroup consts
 */

export const ExperimentGroupType = {
  0: '分支',
  1: '策略',
};

export const ExperimentGroupMark = {
  0: '实验组',
  1: '对照组',
};

export const ExperimentGroupRelationBranch = {
  0: '基于基线分支创建',
}
