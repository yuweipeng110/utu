import request from '@/utils/request';

/**
 * 获取规则master分支
 * @param params { appId, sceneId }
 */
export async function getMasterRuleBranch(params: any) {
  return request(`/api/v1/ruleBranch/getMasterBranch`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 初始化规则master分支
 * @param params { appId, sceneId }
 */
export async function addMasterRuleBranch(params: any) {
  return request(`/api/v1/ruleBranch/addMaster`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/*
 * --------------------------------------------
 * RuleBrnach related Service
 */

export async function queryRuleBranch(params?: any) {
  return request(`/api/v1/ruleBranch/list`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function queryRuleBranchOnline(params?: any) {
  return request(`/api/v1/ruleBranch/listOnline`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取分支详情
export async function getBranchDetail(params?: any) {
  return request(`/api/v1/ruleBranch/get`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 点击分支详情，（实验入口，开发视图，线上视图）
export async function getBranchLatestStableInformation(params?: any) {
  return request(`/api/v1/ruleBranch/getBranchLatestStableInformation`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 点击分支详情，（发布单）
export async function getPublishOrderBranchInformation(params?: any) {
  return request(`/api/v1/ruleBranch/getPublishOrderBranchInformation`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 编辑分支
export async function editBranch(params?: any) {
  return request(`/api/v1/ruleBranch/editBranch`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 编辑分支
export async function getOnlineContent(params?: any) {
  return request(`/api/v1/ruleBranch/getOnlineContent`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}



// 保存规则分组的规则内容
export async function saveRuleContent(params: any) {
  return request(`/api/v1/ruleBranch/saveContent`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 规则关闭
export async function closeRuleBranch(params: any) {
  return request(`/api/v1/ruleBranch/closeBranch`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 分支内容diff版本
export async function branchDifferentVersionDiffWith(params: any) {
  return request(`/api/v1/ruleBranch/branchDifferentVersionDiffWith`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}


// 分支内容diff
export async function branchDiffWith(params: any) {
  return request(`/api/v1/ruleBranch/diffWith`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 修改规则分支的基本信息
export async function updateRuleBranch(params: any) {
  return request(`/api/v1/ruleBranch/update`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/*
 * --------------------------------------------
 * RuleBrnach State related Service
 */

export async function addRuleBranch(params: any) {
  return request(`/api/v1/ruleBranchState/add`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// fork规则分支
export async function cloneRuleBranch(params: any) {
  return request(`/api/v1/ruleBranch/clone`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 加载最新版本规则分支
export async function loadLatestVersionRuleBranch(params: any) {
  return request(`/api/v1/ruleBranch/loadLatestVersion`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 保存稳定版本规则分支
export async function saveStableRuleBranch(params: any) {
  return request(`/api/v1/ruleBranch/saveStable`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}


// 删除规则分支
export async function deleteRuleBranch(params: any) {
  return request(`/api/v1/ruleBranchState/delete`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 规则分支申请进入发布阶段
export async function goPublish(params: any) {
  return request(`/api/v1/ruleBranchState/goPublishState`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 终止规则分支进入发布阶段的申请
export async function abortPublishRequest(params: any) {
  return request(`/api/v1/ruleBranchState/abortPublishRequest`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 规则分支申请取消发布
export async function cancelPublishState(params: any) {
  return request(`/api/v1/ruleBranchState/cancelPublishState`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 终止规则分支取消发布的申请
export async function abortCancelPublishRequest(params: any) {
  return request(`/api/v1/ruleBranchState/abortCancelPublishRequest`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 规则分支MergeRequest请求
export async function mergeRequestState(params: any) {
  return request(`/api/v1/ruleBranchState/mergeRequest`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 终止规则分支取消MergeRequest
export async function abortMergeRequest(params: any) {
  return request(`/api/v1/ruleBranchState/abortMergeRequest`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/*
 * --------------------------------------------
 * RuleBranch Publish related Service
 */

// 获取Libra实验列表（供前端Libra选择框选择）
export async function fetchLibraSug(params: any) {
  return request(`/api/v1/publish/libraSug`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取规则分支的发布配置 step3调用
export async function fetchPublishDetail(params: any) {
  return request(`/api/v1/publish/detail`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 发布该规则分支的线发布上
export async function publishStart(params: {
  appId: number;
  sceneId: number;
  branchId: number;
  runType: number;
  libra: { conditionValue: string };
  branchType: number;
}) {
  return request(`/api/v1/publish/start`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 终止“该规则分支的发布发布请求”
export async function abortPublishStartRequest(params: any) {
  return request(`/api/v1/publish/abortStartRequest`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 停止该规则分支的线发布上
export async function publishStop(params: any) {
  return request(`api/v1/publish/stop`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取线上索引列表
export async function queryPublishIndexList(params: any) {
  return request(`api/v1/publish/index/list`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
