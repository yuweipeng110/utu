export const AddAppPubSubId = 'd806a360-21aa-406e-9e5f-7f375087514f';
export const DeleteAppPubSubId = 'd806a360-21aa-406e-9e5f-7f375087514g';
export const ChangeAppPubSubId = 'be76ee9c-9ea7-4fd7-84a8-79f07196177b';

export const AppDeploy = {
  1: '张北中心',
  2: '三机房(张北&深圳&上海)',
};

export const RuleBranchState = {
  100: '开发阶段',
  300: '提交发布（待审批）',
  400: '线上发布',
  500: '取消发布（待审批）',
  600: '合并至基线（待审批）',
  700: '归档',
};

export const RuleBranchType = {
  0: '基线分支',
  1: 'Feature分支',
  2: '实验分支',
  3: '对照分支',
};

export const RunType = {
  0: '实跑',
  1: '陪跑',
};

export const ApprovalFlowState = {
  0: '审批中',
  1: '通过',
  2: '拒绝',
};

export const PublishAction = {
  0: '待发布',
  1: '待发布', // 发布待审批
  2: '已发布',
  3: '已发布', // 暂停待审批
  4: '已发布', // 已发布有更新待审批
};
