export type AppDeployInfo = {
  id: number;
  appId: number;
  name: string;
  createUser: string;
  createTime: string;
  modifyUser: string;
  modifyTime: string;
  stage: number;
  status: number;
  deployRemark: string;
  orderName?: string;
  submitter?: string;
  submitTime?: string;
  packageList?: [];
  originalStage: number;
  originalOrderId: number;
  orderId: number;
  flag: number;
  type: number;
  stageList: number[];
  isAllIpOk: number;
  rollBackOrderId: number;
};

export type AppDeployDiffInfo = {
  action: number;
  contentId: number;
  contentVersion: number;
  packageId: number;
  packageName: string;
  originalContentId: number;
  originalVersion: number;
  originalStrategyList: [];
  strategyList: [];
}