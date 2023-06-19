export type PublishInfo = {
  id: number;
  name: string;
  version: number;
  source: number;
  createTime: number;
  createUser: string;
  status: number;
  result: number;
  appId: number;
  sceneId: number;
  remark: string;
  onlineList?: any;
  currentList?: any;
}

export type PublishDetail = {
  id: number;
  orderId: number;
  branchId: number;
  action: number;
  branchVersionId: number;
  createTime: number;
  createUser: string;
  version: number;
  baseVersion:any;
  status: number;
  flowStatus: number;
  flowUrl: string;
}

export type RollBack = {
  createTime: string;
  createUser: string;
  deleted: string;
  id: number;
  indexView: string;
  orderId: number;
  sceneId: number;
  updateTime: string;
  updateUser: string;
  version: number;
};

export type RoolBackInfo = {
    online: RollBack;
    historyList: RollBack[];
};

