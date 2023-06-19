import request from "@/utils/request";
import type { ExperimentInfo } from "@/models/experiment";

/**
 * 实验列表
 * appId  number
 * sceneId  number
 */
export async function queryExperimentList(params?: any) {
  return request(`/api/v1/experiment/list`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 实验列表
 * appId  number
 */
 export async function queryAppExperimentList(params?: any) {
  return request(`/api/v1/app/experiment/list`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 添加实验
export async function addExperiment(params: ExperimentInfo) {
  return request(`/api/v1/ruleExperimentState/add`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 修改实验
export async function updateExperiment(params: ExperimentInfo) {
  return request(`/api/v1/ruleExperimentState/update`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取应用实验详情
export async function getAppExperimentDetail(params: any) {
  return request(`/api/v1/app/experiment/info`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取实验详情
export async function getExperimentDetail(params: any) {
  return request(`/api/v1/experiment/get`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 删除实验
export async function deleteExperiment(params: any) {
  return request(`/api/v1/experiment/deleted`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取场景下剩余流量
export async function getSurplusFlowRatio(params: any) {
  return request(`/api/v1/experiment/getSurplusFlowRatio`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 修改实验下白名单：修改
export async function updateWhitelist(params: any) {
  return request(`/api/v1/whitelist/updateWhitelist`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 修改实验下白名单：保存并提交
export async function updateWhitelistAndSubmit(params: any) {
  return request(`/api/v1/whitelist/updateWhitelistAndSubmit`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 修改实验下流量：修改
export async function updateFlowRatio(params: any) {
  return request(`/api/v1/experiment/updateFlowRatio`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 修改实验下流量：保存并提交
export async function updateFlowRatioAndSubmit(params: any) {
  return request(`/api/v1/experiment/updateFlowRatioAndSubmit`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

//流量列表
export async function flowList(params?: any) {
  return request('/api/v1/experiment/flow/list', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}
