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
