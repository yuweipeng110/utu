import request from '@/utils/request';

//获取应用部署列表
export async function queryAppDeployList(params?: any) {
  return request('/api/v1/appPublish/list', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

//获取应用部署详情
export async function getAppStageInformation(params?: any) {
  return request('/api/v1/appPublish/getAppStageInformation', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

//应用部署（下一步）(回滚)
export async function appDeployStageHandler(params?: any) {
  return request('/api/v1/appPublish/appDeployStageHandler', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 预览
 * orderId  应用发布单ID
 * *paramList<packageId、index、version>  包列表
 */
export async function appDeployPreview(params?: any) {
  return request('/api/v1/appPublish/preview', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 查看变更diff
 * packageName  list
 * contentId    list
 * originalContentId  list
 */
export async function getStrategyPackageDiff(params?: any) {
  return request('/api/v1/package/getStrategyPackageDiff', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 打包部署
 * appOrderId  number
 * stage    number
 * appId    number
 */
export async function buildAndDeploy(params?: any) {
  return request('/api/v1/appPublish/buildAndDeploy', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 打包部署（定时调用）
 * appOrderId  number
 * stage    number
 */
export async function packDeployDetail(params?: any) {
  return request('/api/v1/appPublish/deploy/detail', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 应用发布（关闭）
 * appId  number
 * stage    number
 * orderId    number
 */
export async function closeAppDeploy(params?: any) {
  return request('/api/v1/appPublish/closeAppDeploy', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

//获取应用部署回滚列表
export async function queryappPublishRollBackList(params?: any) {
  return request('/api/v1/appPublish/rollBackList', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 应用列表（回滚）
 * appId  number
 * orderId    number
 */
export async function appDeploySnapshotRollback(params?: any) {
  return request('/api/v1/appPublish/appDeploySnapshotRollback', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 应用回滚（回滚预览）
 * orderId    number
 */
export async function rollbackDiffPreview(params?: any) {
  return request('/api/v1/appPublish/rollbackDiffPreview', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 应用回滚（回滚部署）
 * appId  number
 * appOrderId    number
 */
export async function buildAndRollback(params?: any) {
  return request('/api/v1/appPublish/buildAndRollback', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 获取当前审批流的状态
 * appId  number
 * publisherId    number
 */
 export async function getApproveFlowStatusCode(params?: any) {
  return request('/api/v1/bpms/getApproveFlowStatusCode', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 审批页面展示信息
 * appId  number
 * publisherId    number
 */
 export async function queryAndUpdateApprovelFlow(params?: any) {
  return request('/api/v1/bpms/queryAndUpdateApprovelFlow', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 创建审批流
 * appId  number
 * publisherId    number
 * orderId  number
 */
 export async function createNewApprovelFlow(params?: any) {
  return request('/api/v1/bpms/createNewApprovelFlow', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}


/**
 * 审批流（同意、拒绝）
 * appId  number
 * publisherId    number
 * execCode  number 
 *  0:取消 1:通过 2: 拒绝
 */
 export async function dealApprovelFlow(params?: any) {
  return request('/api/v1/bpms/dealApprovelFlow', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 查询最新的发布单详情
 * @param params 
 * @returns 
 */
export async function queryLastDeployDetail(params?: any) {
  return request('/api/v1/appPublish/selectLastDeployDetail', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}