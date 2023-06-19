import request from "@/utils/request";

// 获取决策流列表
export async function queryFlowList(params?: any) {
  return request('/api/v1/flow/list', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取决策流详情
export async function getFlowDetail(params: any) {
  return request(`/api/v1/flow/get`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 添加决策流
export async function addFlow(params: any) {
  return request(`/api/v1/flow/addRuleFlow`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 添加决策流内容版本
export async function addFlowContent(params: any) {
  return request(`/api/v1/flow/addFlowContent`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 删除决策流
export async function deleteFlow(params: any) {
  return request(`/api/v1/flow/deleted`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 决策流列表（包）
export async function getFlowVersion(params?: any) {
  return request(`/api/v1/flow/getFlowVersion`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 预览决策流UTRL
export async function previewFlowUtrl(params: any) {
  return request(`/api/v1/flow/previewFlowUtrl`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取决策流版本列表
export async function getFlowVersionList(params: any) {
  return request(`/api/v1/flow/getFlowVersionList `, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}


