import request from '@/utils/request';
import { StrategyRuleInfo } from '@/models/strategy';

// 策略列表
export async function queryStrategyList(params?: any) {
  return request('/api/v1/strategyInfo/list', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 策略列表
export async function queryExistStrategyList(params?: any) {
  return request(`/api/v1/strategyInfo/getExistStableContentStrategyList`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 策略列表（策略包）
export async function getStrategyStableVersion(params?: any) {
  return request(`/api/v1/strategyInfo/getStrategyStableVersion`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 策略详情
export async function getStrategyDetail(params: any) {
  return request(`/api/v1/strategyInfo/getStrategyDetails`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 编辑策略详情
export async function editStrategyDetail(params: any) {
  return request(`/api/v1/strategyInfo/editStrategyDetails`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 添加策略
export async function addStrategy(params: any) {
  return request(`/api/v1/strategyInfo/add`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 策略-保存草稿
export async function saveStrategyDraft(params: any) {
  return request(`/api/v1/strategyContent/saveDraft`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 策略保存稳定版
export async function saveStrategyStable(params: any) {
  return request(`/api/v1/strategyContent/saveStable`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 策略重置
export async function resetStrategyContent(params: any) {
  return request(`/api/v1/strategyContent/resetStrategyContent`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 删除策略
export async function deleteStrategy(params: any) {
  return request(`/api/v1/strategy/deleted`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 策略版本列表
export async function queryStrategyVersionList(params?: any) {
  return request(`/api/v1/strategyVersion/list`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 规则列表
export async function queryStrategyRuleList(params?: any) {
  return request(`/api/v1/strategyRule/list`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 添加规则
export async function addRule(params: StrategyRuleInfo) {
  return request(`/api/v1/ruleInfo/add`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 修改规则
export async function editRule(params: StrategyRuleInfo) {
  return request(`/api/v1/ruleInfo/update`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

//左变量
export async function searchFeature(params?: any) {
  return request('/api/v1/feature/likeForQuery', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 删除规则
export async function deleteRule(params: any) {
  return request(`/api/v1/ruleInfo/deleted`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 关闭策略
export async function strageyClose(params: any) {
  return request(`/api/v1/strategyContent/close`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 加载最新版本
export async function getNewVersion(params: any) {
  return request(`/api/v1/strategyContent/loadLatestVersion`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 预览规则
export async function previewRule(params: any) {
  return request(`/api/v1/strategyInfo/previewRule`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
