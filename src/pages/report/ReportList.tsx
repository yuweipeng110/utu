import React, { useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { queryReportList } from '@/services/report';
import type { ReportItem } from '@/models/report';
import { getPageQuery } from '@/utils/utils';

const ReportList: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const queryParams = getPageQuery();
  const appId = queryParams.app_id;
  const sceneId = queryParams.scene_id;

  const columns: ProColumns<ReportItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'App Code',
      dataIndex: 'appCode',
    },
    {
      title: 'Scene Code',
      dataIndex: 'sceneCode',
    },
    {
      title: 'IP',
      dataIndex: 'ip',
    },
    {
      title: '版本',
      dataIndex: 'version',
    },
    {
      title: '上报时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
    },
    {
      title: 'Code',
      dataIndex: 'code',
    },
    {
      title: 'Message',
      dataIndex: 'message',
      ellipsis: true,
    },
  ];

  return (
    <PageContainer>
      <ProTable<ReportItem>
        headerTitle="状态上报列表"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          const result = await queryReportList({
            pageIndex: current - 1,
            pageSize,
            appId,
            sceneId,
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
        columns={columns}
      />
    </PageContainer>
  );
};

export default ReportList;
