import request from '@/utils/request';
import type { AppScene } from '@/models/app';

export async function queryAppList(params?: any) {
  return request('/api/v1/app/list', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function getAppList(params?: any) {
  return request('/api/v1/app/getAppList', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function addApp(params?: any) {
  return request('/api/v1/app/add', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 编辑应用
export async function editApp(params?: any) {
  return request('/api/v1/app/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 删除应用
export async function deleteApp(params?: any) {
  return request('/api/v1/app/deleted', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function queryAppSecret(params?: any) {
  return request('/api/v1/app/getAppSecret', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function queryScene(params?: any) {
  return request(`/api/v1/app/scene`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function querySceneList(params?: any) {
  return request(`/api/v1/app/scene/list`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function addScene(params?: AppScene) {
  return request(`/api/v1/app/scene/add`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function editScene(params?: any) {
  return request(`/api/v1/app/scene/edit`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}



// 删除场景
export async function deleteScene(params?: any) {
  return request('/api/v1/app/scene/deleted', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取场景决策流明细
export async function getSceneUseFlowDetail(params?: any) {
  return request('/api/v1/app/scene/getSceneUseFlowDetail', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 添加场景白名单
export async function addSceneWhitelist(params?: any) {
  return request('/api/v1/app/addSceneWhitelist', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取场景白名单
export async function getSceneWhitelist(params?: any) {
  return request('/api/v1/app/getSceneWhitelist', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 获取应用下场景（搜索）
export async function getSceneLikeForQuery(params?: any) {
  return request('/api/v1/app/scene/likeForQuery', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function editAuthority(params?: AppScene) {
  return request(`/api/v1/role/admin/update`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function queryBucUserList(params: any) {
  return request('/api/v1/buc/info', {
    method: 'GET',
    params,
  });
}

/**
 * 是否为超级管理员
 */
export async function checkCurrentUserIsSuperAdministrator() {
  return request(`/api/v1/app/checkCurrentUserIsSuperAdministrator`, {
    method: 'POST',
  });
}
