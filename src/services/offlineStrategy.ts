import request from '@/utils/request';

// 离线策略列表
export async function queryOfflineStrategyList(params?: any) {
  return request('/api/v1/offlineStrategy/list', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 离线策略详情
export async function getOfflineStrategyDetail(params: any) {
  return request(`/api/v1/offlineStrategy/getStrategyDetails`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 编辑离线策略详情
export async function editOfflineStrategyDetail(params: any) {
  return request(`/api/v1/offlineStrategy/editStrategyDetails`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 添加离线策略
export async function addOfflineStrategy(params: any) {
  return request(`/api/v1/offlineStrategy/add`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 执行离线策略
export async function execJobOfflineStrategy(params: any) {
  return request(`/api/v1/offlineStrategy/execJob`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 禁用离线策略
export async function disableJobOfflineStrategy(params: any) {
  return request(`/api/v1/offlineStrategy/disableJob`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 启用离线策略
export async function enableJobOfflineStrategy(params: any) {
  return request(`/api/v1/offlineStrategy/enableJob`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 离线策略-保存草稿
export async function saveOfflineStrategyDraft(params: any) {
  return request(`/api/v1/offlineStrategy/saveDraft`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 离线策略保存稳定版
export async function saveOfflineStrategyStable(params: any) {
  return request(`/api/v1/offlineStrategy/saveStable`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 离线策略重置
export async function resetOfflineStrategyContent(params: any) {
  return request(`/api/v1/offlineStrategy/resetStrategyContent`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 关闭离线策略
export async function offlineStrageyClose(params: any) {
  return request(`/api/v1/offlineStrategy/close`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 加载最新版本
export async function getOfflineNewVersion(params: any) {
  return request(`/api/v1/offlineStrategy/loadLatestVersion`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取离线执行记录详情
export async function getOfflineJobInstanceDetail(params: any) {
  return request(`/api/v1/offlineStrategy/getOfflineJobInstanceDetail`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取策略运行统计
export async function getStrategyRunCount(params: any) {
  return request(`/api/v1/offlineStrategy/getStrategyRunCount`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 离线抽样接口
 *
 * @param number  objId
 * @param number  number
 */
export async function offlineStrategyGetSample(params: any) {
  return request(`/api/v1/offlineStrategy/getSample`, {
    method: 'POST',
    responseType: 'blob',
    data: {
      ...params,
    },
  });
}
