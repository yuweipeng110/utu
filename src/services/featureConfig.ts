import request from '@/utils/request';
import type { DataSourceInfo, MetadataInfo, FeatureInfo } from '@/models/featureConfig';

export async function queryDataSourceList(params?: any) {
  return request(`/api/v1/featureConfig/dataSource/list`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function addDataSource(params: DataSourceInfo) {
  return request(`/api/v1/featureConfig/dataSource/add`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function editDataSource(params: DataSourceInfo) {
  return request(`/api/v1/featureConfig/dataSource/edit`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function queryMetadataList(params?: any) {
  return request(`/api/v1/featureConfig/metadata/list`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function addMetadata(params: MetadataInfo) {
  return request(`/api/v1/featureConfig/metadata/add`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function editMetadata(params: MetadataInfo) {
  return request(`/api/v1/featureConfig/metadata/edit`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function queryFeatureList(params?: any) {
  return request(`/api/v1/feature/list`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function addFeature(params: FeatureInfo) {
  return request(`/api/v1/feature/add`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 删除特征
export async function deleteFeature(params: any) {
  return request(`/api/v1/feature/deleted`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function editFeature(params: FeatureInfo) {
  return request(`/api/v1/feature/update`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function queryTagsList(params?: any) {
  return request(`/api/v1/feature/tags/list`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 获取特征白名单
 */
export async function getFeatureWhitelist(params?: any) {
  return request(`/api/v1/feature/getFeatureWhitelist`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 添加特征白名单
 */
export async function addFeatureWhitelist(params?: any) {
  return request(`/api/v1/feature/addFeatureWhitelist`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 获取应用下所有特征
 * appId number
 *  应用id
 * keywords? string
 */
export async function getFeatureListByLike(params?: any) {
  return request(`/api/v1/feature/getFeatureListByLike`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
