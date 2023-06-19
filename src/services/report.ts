import request from '@/utils/request';

/*
 * --------------------------------------------
 * Status Report related Service
 */

export async function queryReportList(params?: any) {
  return request(`/api/v1/report/list`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
