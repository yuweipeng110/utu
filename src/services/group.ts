import request from '@/utils/request';

// 获取组列表
export async function queryGroupList(params?: any) {
  return request('/api/v1/group/list', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取组列表
export async function queryAppGroupList(params?: any) {
    return request('/api/v1/group/groupList', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  }

// 添加组
export async function addGroup(params?: any) {
  return request('/api/v1/group/add', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 修改组
export async function editGroup(params?: any) {
  return request('/api/v1/group/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 删除组
export async function deleteGroup(params?: any) {
  return request('/api/v1/group/deleted', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 编辑组权限
export async function editRoleGroup(params?: any) {
  return request('/api/v1/group/role/admin/update', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
