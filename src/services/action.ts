import request from "@/utils/request";

// 获取动作列表
export async function queryActionList(params?: any) {
  return request('/api/v1/action/list', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取动作详情
export async function getActionDetail(params: any) {
  return request(`/api/v1/action/get`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 添加动作
export async function addAction(params: any) {
  return request(`/api/v1/action/add`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 修改动作
export async function editAction(params: any) {
  return request(`/api/v1/action/update`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 删除动作
export async function deleteAction(params: any) {
  return request(`/api/v1/action/deleted`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
