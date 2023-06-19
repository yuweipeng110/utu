import request from '@/utils/request';

//获取配置列表
export async function queryDeployConfigList(params?: any) {
  return request('/api/v1/deployConfig/list', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

//添加配置
export async function addDeployConfig(params?: any) {
  return request('/api/v1/deployConfig/addConfig', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

//修改配置
export async function updateDeployConfig(params?: any) {
  return request('/api/v1/deployConfig/updateConfig', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

//获取Aone分组信息
export async function getAoneGroup(params?: any) {
  return request('/api/v1/skyline/app/group', {
    method: 'GET',
    data: {
      ...params,
    },
  });
}

