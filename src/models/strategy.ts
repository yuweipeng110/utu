export type StrategyInfo = {
  id: number;
  name: string;
  description: string;
  type: number;
  appId: number;
  // packageId: number;
  contentType: number;
  params?: any;
  strategyDetail: string;
  stableVersion: number;
  contentId: number;
  contentVersion: number;
  baseVersion: number;
  contentCreateUser: string;
  packageId: number;
  packageName: string;
  packageDescription: string;
  upgradedFeature: any;
  strategyId: number;
  sType: number;
  dispatchSetting: string;
  jobId: number;
  status: number;
  shortCircuitEnable: number;
};

export type StrategyVersionInfo = {
  id: number;
  strategyId: number;
  version: number;
  executor: string;
  priority: number;
  whens: string;
  content: string;
  appId: number;
};

export type StrategyRuleInfo = {
  id: number;
  name: string;
  description: string;
  type: number;
  open: number;
  priority: number;
  conditions: string;
  content: string;
  action: string;
  elseAction: string;
  appId: number;
  ruleContents: any;
  scriptContent: string;
  // actionParams?: any;
  leftActionParams?: any;
  rightActionParams?: any;
  latestId?: number;
  latestVersion?: number;
  ruleId?: number;
  index?: number;
};

export type StrategyRuleRelation = {
  id?: number;
  strategyId: number;
  strategyVersionId?: number;
  ruleId?: number;
  ruleVersionId?: number;
  name?: string;
  appId?: number;
  strategyIndex?: number;
  strategyContentId?: number;
  strategyVersion?: number;
};

export type StrategyRuleItem = {
  index: number;
  placeholder: string;
  leftVal: string;
  option: string;
  rightVal: string;
};

export type StrategyRunCountType = {
  jobId: number;
  startTime: string;
  endTime: string;
  execTime: number;
  executor: string;
  jobType: number;
  dealCnt: number;
  hitCnt: number;
  status: number;
};
