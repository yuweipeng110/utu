import React from 'react';
import { history } from 'umi';
import { Tag } from 'antd';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { historyItem } from '@/models/releaseHistory';
import { getRollbackList } from '@/services/publish';
import { getPageQuery } from '@/utils/utils';
import { PublishSource, PublishStatus } from "@/consts/publish/const";

const HistoryDetails: React.FC = () => {

  const queryParams = getPageQuery();

  const columns: ProColumns<historyItem>[] = [
    {
      title: '发布名称',
      dataIndex: 'name',
    },
    {
      title: '发布单版本',
      dataIndex: 'version',
      key: 'version',
      render: (text) => {
        return <Tag>{text}</Tag>;
      },
    },
    {
      title: '来源',
      dataIndex: 'source',
      valueEnum: PublishSource,
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
      title: '发布单状态',
      dataIndex: 'status',
      valueEnum: PublishStatus,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (text, record) => {
        return (
          <a
            key="detail"
            onClick={() => {
              history.push(
                `/scene/publish/detail?publish_order_id=${record.id}&app_id=${queryParams.app_id}&scene_id=${queryParams.scene_id}`,
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
      <ProTable<historyItem>
        columns={columns}
        request={async (params, sorter, filter) => {
          const result = await getRollbackList({
            appId: queryParams.app_id,
            sceneId: queryParams.scene_id,
          });
          const data = [];
          if (result.data.online.id.toString() === queryParams.id) {
            data.push(result.data.online);
          }
          result.data.historyList.forEach((item: any) => {
            if (item.id.toString() === queryParams.id) {
              data.push(item);
            }
          });
          return {
            data,
            success: true,
          };
        }}
        rowKey="id"
        search={false}
        dateFormatter="string"
        headerTitle="列表详情"
        options={false}
      />
    </PageContainer>
  );
};

export default HistoryDetails;
