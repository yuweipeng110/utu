export type FlowInfo = {
  id: number;
  ruleFlowId: number;
  appId: number;
  packageId: number;
  name: string;
  description: string;
  createUser: string;
  createTime: string;
  modifyUser: string;
  modifyTime: string;
  version: number;
  graphJSON: string;
  content: string;
  flowLightData: string[] | null;
};
