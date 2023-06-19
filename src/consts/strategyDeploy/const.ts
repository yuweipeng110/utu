export const StrategyDeployStage = {
  0: '选择包',
  200: '包diff',
  300: '策略审批',
  350: '泰坦变更',
  400: '编译构建',
  600: '测试验证',
  699: '部署日常',
  700: '部署预发',
  701: '部署线上',
  800: '灰度部署',
  1000: '正式部署',
  1099: '回滚日常',
  1100: '回滚预发',
  1101: '回滚线上',
  1200: '结束',
};

export const StrategyDeployAction = {
  0: '无变化',
  1: '新增',
  2: '变更',
  3: '删除',
};

export const StrategyDeployStatus = {
  0: '初始化',
  100: '测试中',
  102: '测试通过',
  104: '测试不通过',
  200: '编译中',
  202: '编译成功',
  204: '编译失败',
  300: '打包中',
  302: '打包成功',
  304: '打包失败',
  355: '部署日常成功',
  357: '部署日常失败',
  359: '部署日常超时',
  361: '部署预发成功',
  363: '部署预发失败',
  365: '部署预发超时',
  367: '部署线上成功',
  369: '部署线上失败',
  371: '部署线上超时',
  400: '灰度部署中',
  402: '灰度部署成功',
  404: '灰度部署失败',
  500: '正式部署中',
  502: '正式部署成功',
  504: '正式部署失败',
  594: '回滚日常中',
  596: '回滚日常成功',
  598: '回滚日常失败',
  600: '回滚预发中',
  602: '回滚预发成功',
  604: '回滚预发失败',
  606: '回滚线上中',
  608: '回滚线上成功',
  610: '回滚线上失败',
  800: '关闭',
};

export const StrategyDeployType = {
  0: '策略部署',
  1: '策略回滚',
};

export const StrategyDeployRiskLevel = {
  1: '高',
  2: '中',
  3: '低',
};

export const StrategyDeployTestResult = {
  1: '研发自测通过',
  2: 'QA测试通过',
};

export const StrategyDeployChecklist = {
  1: '存储变更已确认',
  2: '配置变更已确认',
  3: '上下游依赖已确认',
};

export const StrategyDeployUpdateType = {
  1: '应用发布',
  2: '配置变更',
  3: '数据库变更',
  4: '切流',
  5: '压测',
  6: '其他',
};

export const StrategyDeployIsDingNotice = {
  0: '不发送',
  1: '发送',
};

export const StrategyDeployNeedPolicy = {
  0: '不需要',
  1: '需要',
};

export const StrategyDeployApproveStatus = {
  0: '审批中',
  1: '同意',
  2: '拒绝',
}