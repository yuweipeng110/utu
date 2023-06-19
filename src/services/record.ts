import request from '@/utils/request';
export async function searchRecord(params: any) {
  return request('/api/vi/recording/search', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
