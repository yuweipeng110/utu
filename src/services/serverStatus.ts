import request from '@/utils/request';

//获取应用版本列表
export async function queryAppVersionList(params?: any) {
    return request('/api/v1/serverState/query', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  }