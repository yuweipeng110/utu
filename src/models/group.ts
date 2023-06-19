import { BucUser } from "./app";

export type GroupInfo = {
  groupId: number;
  groupCode: string;
  groupDesc: string;
  groupName: string;
  updateTime: string;
  updateUser: string;
  userList: BucUser[];
  roleType: number;
};

