import React from 'react';
import { history } from 'umi';
import { Tag, Button } from 'antd';
import { ReleaseListInfo } from '@/models/releaseList';
import { getPageQuery } from '@/utils/utils';
import { queryReleaseList } from '@/services/releaseList';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PublishFlowStatus, PublishSource, PublishStatus } from "@/consts/publish/const";

const ReleaseList: React.FC = () => {
  const queryParams = getPageQuery();

  const columns: ProColumns<ReleaseListInfo>[] = [
    {
      title: '发布名称',
      dataIndex: 'name',
    },
    {
      title: '发布单版本',
      dataIndex: 'version',
      render: (text) => {
        return <Tag>{text}</Tag>;
      },
    },
    {
      title: '来源',
      dataIndex: 'source',
      valueEnum: PublishSource,
      render: (text: any, record) => {
        return record.source === 3 ? <div style={{ color: 'red' }}>{text}</div> : text;
      },
    },
    {
      title: '修改人',
      dataIndex: 'updateUser',
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      valueType: 'dateTime',
    },
    {
      title: '审批状态',
      dataIndex: 'flowStatus',
      valueEnum: PublishFlowStatus,
      render: (dom, record) => {
        if (record.flowStatus === '0') {
          return (
            <a href={record.flowUrl} target="_blank">
              {PublishFlowStatus[record.flowStatus]}
            </a>
          );
        }
        if (record.flowStatus === 'CHECK_HOLD') {
          return (
            <a href={record.flowUrl} target="_blank">
              {PublishFlowStatus[record.flowStatus]}
            </a>
          );
        }
        if (record.flowStatus === 'CHECK_WAIT') {
          return (
            <a href={record.flowUrl} target="_blank">
              {PublishFlowStatus[record.flowStatus]}
            </a>
          );
        }
        if (record.flowStatus === 'CHECK_CANCEL') {
          return (
            <a href={record.flowUrl} target="_blank">
              {PublishFlowStatus[record.flowStatus]}
            </a>
          );
        }
        if (record.flowStatus === 'CHECK_UNKNOWN') {
          return (
            <a href={record.flowUrl} target="_blank">
              {PublishFlowStatus[record.flowStatus]}
            </a>
          );
        }
        if (record.flowStatus === 'ORDER_APPROVING') {
          return (
            <a href={record.flowUrl} target="_blank">
              {PublishFlowStatus[record.flowStatus]}
            </a>
          );
        }
        return PublishFlowStatus[record.flowStatus];
      }
    },
    {
      title: '发布单状态',
      dataIndex: 'status',
      valueEnum: PublishStatus,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'option',
      valueType: 'option',
      render: (_, record) => {
        return (
          <a
            key="detail"
            onClick={() => {
              record.experimentId
                ? history.push(
                `/scene/publish/detail?app_id=${queryParams.app_id}&scene_id=${queryParams.scene_id}&publish_order_id=${record.id}&source=${record.source}&experiment_id=${record.experimentId}`,
                )
                : history.push(
                `/scene/publish/detail?app_id=${queryParams.app_id}&scene_id=${queryParams.scene_id}&publish_order_id=${record.id}&source=${record.source}`,
                );
            }}
          >
            详情
          </a>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<ReleaseListInfo>
        columns={columns}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          const result = await queryReleaseList({
            pageIndex: current - 1,
            pageSize,
            appId: queryParams.app_id,
            sceneId: queryParams.scene_id,
            ...other,
          });
          return {
            data: result.datas,
            success: true,
            total: result.totalCount,
          };
        }}
        pagination={{
          pageSize: 10,
        }}
        rowKey="id"
        search={false}
        dateFormatter="string"
        headerTitle="发布列表"
        toolBarRender={() => [
          <Button
            type="primary"
            danger
            onClick={() => {
              history.replace(
                `/scene/publish/rollback?app_id=${queryParams.app_id}&scene_id=${queryParams.scene_id}`,
              );
            }}
          >
            回滚
          </Button>,
        ]}
        options={false}
      />
    </PageContainer>
  );
};

export default ReleaseList;
