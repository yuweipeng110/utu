export type PackageInfo = {
  id: number;
  name: string;
  createUser: string;
  createTime: string;
  modifyUser: string;
  modifyTime: string;
  appId: number;
  packageId: number;
  version: number;
  strategyContentList: PackageStrategyContent[];
  flowContentList: PackageFlowContent[];
}

export type PackageContentInfo = {
  index?: number;
  packageId: number;
  name: string;
  description: string;
  versionMap: [];
  editable?: boolean;
}

export type PackageStrategyContent = {
  index?: number;
  strategyId: number;
  name: string;
  description: string;
  updateUser: string;
  updateTime: string;
  stableVersion: number;
  stableVersionList: [];
  editable?: boolean;
}

export type PackageFlowContent = {
  index?: number;
  flowId: number;
  name: string;
  description: string;
  updateUser: string;
  updateTime: string;
  version: number;
  versionList: [];
  editable?: boolean;
}
