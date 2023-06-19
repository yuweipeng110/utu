import request from '@/utils/request';
export async function queryReleaseList(params?: any) {
  return request('/api/v1/publish/order/list', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
