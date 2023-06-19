export type DeployConfigInfo = {
  id: number;
  aoneAppId: number;
  aoneAppName: string;
  modifyUser: string;
  modifyTime: string;
  remark: string;
  appId: number;
  groupList?: GrayGroupType[];
  configId?: number;
};

export type GrayGroupType = {
  index: number;
  name: string;
};
