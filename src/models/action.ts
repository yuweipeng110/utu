export type ActionInfo = {
  id: number;
  name: string;
  type: number;
  funcName: string;
  param: any;
  // paramList: ActionParam[];
}

export type ActionParam = {
  index: React.Key;
  name: string;
  type: number;
}
