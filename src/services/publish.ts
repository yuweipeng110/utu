import request from "@/utils/request";

// 提交发布单
export async function submitPublishOrder(params: any) {
  return request(`/api/v1/publish/order/generatePublishList`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 发布单详情
export async function queryPublishOrder(params?: any) {
    return request(`/api/v1/publish/order/queryPublishData`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 发布单:发布
export async function startPublishOrder(params?: any) {
  return request(`/api/v1/publish/order/publish`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 发布单:关闭
export async function closePublishOrder(params?: any) {
  return request(`/api/v1/publish/order/closePublishOrder`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 发布列表(线上版本,历史版本)
export async function getRollbackList(params: any) {
  return request('/api/v1/snapshot/querySnapshotData', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 回滚
export async function fallbackVersion(params: any) {
  return request('/api/v1/publish/order/rollBackPublishVersion', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 分支diff
export async function publishOrderDiffWith(params: any) {
  return request('/api/v1/publish/order/diffWith', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
