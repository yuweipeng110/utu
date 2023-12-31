import request from '@/utils/request';

export async function queryCurrent(): Promise<any> {
  return request('/api/v1/user/currentUser');
}

export async function queryNotices(): Promise<any> {
  return request('/api/notices');
}
