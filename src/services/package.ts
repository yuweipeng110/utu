import request from "@/utils/request";

/**
 * 获取策略包列表(带包版本、策略、策略版本)
 * appId  number
 * name?   string
 *  名称（模糊搜索）
 */
export async function getAllPackage(params?: any) {
  return request('/api/v1/package/getAllPackage', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}


// 获取策略包列表
export async function queryPackageList(params?: any) {
  return request('/api/v1/package/list', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取策略包详情
export async function getPackageDetail(params: any) {
  return request(`/api/v1/package/get`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 添加策略包
export async function addPackage(params: any) {
  return request(`/api/v1/package/addPackage`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 添加策略包内容版本
export async function addStrategyPackageContent(params: any) {
  return request(`/api/v1/package/addStrategyPackageContent`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 删除策略包
export async function deletePackage(params: any) {
  return request(`/api/v1/package/deleted`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 策略包列表（带版本）
export async function getPackageVersion(params: any) {
  return request(`/api/v1/package/getPackageVersion`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 获取策略包
 * appId  number
 * name   string
 */
export async function getStrategyPackage(params: any) {
  return request(`/api/v1/package/getStrategyPackage`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 策略包列表（带版本）
export async function getPackageList(params: any) {
  return request(`/api/v1/appPublish/getPackageList`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 策略包预览
export async function previewPackage(params: any) {
  return request(`/api/v1/package/preview`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

