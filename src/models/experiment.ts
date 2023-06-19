import type { BranchDetail } from '@/models/rule';

/**
 * 实验
 */
export type ExperimentInfo = {
  id: number;
  appId: number;
  sceneId: number;
  name: string;
  type: number;
  flowRatio: number;
  publishStatus: number;
  createUser: string;
  createTime: string;
  publishUser: string;
  publishTime: string;
  experimentBranchs: Partial<BranchDetail[]>;
  experimentGroups: Partial<ExperimentGroup[]>;
  whitelistValues: string;
  groupName: string;
  flowId: number;
  experimentSnapshot: string;
  isNoFlowAndWhitelist: boolean;
};

/**
 * 实验组
 */
export type ExperimentGroup = {
  id: number;
  name: string;
  type: number;
  objId: number;
  mark: string;
  flowRatio: number;
  experimentId: number;
  relationBranch?: number;
};

export type TrafficListInfo = {
  currentPage: number;
  pageSize: number;
  pages: number;
  totalCount: number;
  datas: datasInfo[];
};
export type datasInfo = {
  id: number;
  appId: number;
  sceneId: number;
  name: string;
  diversionType: number;
  diversionId: string;
  flowRatio: number;
  publishStatus: number;
  createUser: string;
  createTime: string;
  publishTime: string;
  ruleBranchList: ruleBranchInfo[];
};
export type ruleBranchInfo = {
  branchId: number;
  appId: number;
  sceneId: number;
  branchName: string;
  branchType: number;
  flowRatio: number;
  branchDesc: string;
};
