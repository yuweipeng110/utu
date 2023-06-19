import request from '@/utils/request';

/*
 * --------------------------------------------
 * BPMS related Service
 */

export async function queryListBPMS(params?: any) {
  return request(`/api/v1/bpms/list`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function getBPMSDetail(params?: any) {
  return request(`/api/v1/bpms/getByRuleBranchId`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
