import type { Effect, Reducer } from '@@/plugin-dva/connect';

export type BranchStage = {
  name: string;
  priority: number;
  executor: string;
  desc: string;
  rules: BranchRule[];
  id?: number;
  packageName?: string;
};

export type BranchRule = {
  name: string;
  priority: number;
  exec: string;
  desc: string;
  collapsed?: boolean;
};

export type BranchDetail = {
  branchId: number;
  branchName: string;
  channel?: string;
  branchType: number;
  branchStatus: number;
  publishUser: string;
  publishTime: string;
  branchPriority: number;
  deleted?: number;
  createUser?: string;
  createTime?: number;
  updateUser?: string;
  updateTime?: number;
  archiveUser?: string;
  archiveTime?: number;
  branchDescription?: string;
  ruleContent: string;
  publishContent: string;
  ruleGroups: BranchStage[];
  publishState: number;
  publishStatus: number;
  appId: number;
  sceneId: number;
  srcBranchId?: number;
  flowRatio: number;
  experimentId?: number;
  version?: number;
  branchVersionId?: any;
  publishVersion?: number;
  baseVersion?: number;
  type?: number;
  isOnline?: number;
  upgradedInfo: any;
  upgradedFeatureList: any;
};

export type BPMSItem = {
  flowId: number;
  flowStatus: number;
  flowUrl: string;
  ruleBranchId: number;
  ruleBranchStatus: string;
  updateTime: string;
  updateUser: string;
  alipmcProcInstId?: string;
  createTime?: string;
  createUser?: string;
  deleted?: string;
};

export type TableListPagination = {
  total: number;
  pageSize: number;
  current: number;
};

export type TableListData = {
  list: BranchDetail[];
  pagination: Partial<TableListPagination>;
};

export type TableListParams = {
  status?: string;
  name?: string;
  desc?: string;
  key?: number;
  pageSize?: number;
  currentPage?: number;
  filter?: Record<string, any[]>;
  sorter?: Record<string, any>;
};

export type BranchDiffStruct = {
  currentBranchId: number;
  targetBranchId: number;
  currentContent: string;
  targetContent: string;
};

export type PublishIndex = {
  content: string;
  createTime: string;
  createUser: string;
  dataId: string;
  dataType: number;
  deleted: string;
  id: number;
  md5: string;
  ruleBranchStatus: number;
  updateTime: string;
  updateUser: string;
  version: number;
};

export type RuleModelState = {
  listTabActiveKey?: '';
};

export type RuleModelType = {
  namespace: 'rule';
  state: RuleModelState;
  effects: {
    listTabEffect: Effect;
  };
  reducers: {
    selectTabRule: Reducer<RuleModelState>;
  };
};

const RuleModel: RuleModelType = {
  namespace: 'rule',

  state: {
    listTabActiveKey: '',
  },

  effects: {
    *listTabEffect(action, { put }) {
      yield put({
        type: 'selectTabRule',
        payload: action.payload,
      });
    },
  },

  reducers: {
    selectTabRule(state, action) {
      return {
        ...state,
        listTabActiveKey: action.payload || {},
      };
    },
  },
};

export default RuleModel;
