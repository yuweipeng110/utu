export type historyItem = {
  releaseVersion: string;
  releaseTime: number;
  publishContent: string;
  operator: string;
  id: string;
  version: number;
  baselineVersion: number;
  updateEnvironment: string;
  deploymentOrder: string;
  releaseList: releaseList[];
};
export type releaseList = {
  id: string;
  branchName: string;
  branchType: string;
  currentStage: string;
  postStatus: string;
  publisher: string;
  releaseTime: number;
  description: string;
};
