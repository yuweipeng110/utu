import React, { useEffect, useRef, useState } from 'react';
import { connect, history } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ExperimentInfo } from '@/models/experiment';
import { queryAppExperimentList } from '@/services/experiment';
import { ExperimentStatus } from '@/consts/experiment/const';
import type { AppInfo } from '@/models/app';
import _ from 'lodash';

export type AppExperimentListProps = {
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const AppExperimentList: React.FC<AppExperimentListProps> = (props) => {
  const { currentApp } = props;
  const actionRef = useRef<ActionType>();

  const [tableLoading, setTableLoading] = useState<boolean>(false);

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentApp]);

  const columns: ProColumns<ExperimentInfo>[] = [
    {
      title: '实验名称',
      dataIndex: 'name',
      hideInSearch: true,
    },
    {
      title: '实验状态',
      dataIndex: 'publishStatus',
      valueEnum: ExperimentStatus,
      valueType: 'checkbox',
      initialValue: ['0', '200'],
      render: (dom, record) => {
        let content;
        switch (record.publishStatus) {
          case 0:
            content = <Tag color="warning">{dom}</Tag>;
            break;
          case 200:
            content = (
              <Tag color="processing" icon={<SyncOutlined spin />}>
                {dom}
              </Tag>
            );
            break;
          case 400:
            content = (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                {dom}
              </Tag>
            );
            break;
          case 600:
            content = (
              <Tag color="error" icon={<CloseCircleOutlined />}>
                {dom}
              </Tag>
            );
            break;
        }
        return content;
      },
    },
    {
      title: '快照',
      dataIndex: 'experimentSnapshot',
      hideInSearch: true,
      render: (dom, record) => record.experimentSnapshot !== null && '有变动',
    },
    {
      title: '修改人',
      dataIndex: 'updateUser',
      hideInSearch: true,
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 150,
      hideInSearch: true,
      render: (text, record) => {
        const detailBtn = (
          <a
            key="detail"
            onClick={() => {
              history.push(`/app/experiment/detail?app_id=${record.appId}&id=${record.id}`);
            }}
          >
            详情
          </a>
        );
        return [detailBtn];
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<ExperimentInfo>
        headerTitle="实验列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          defaultCollapsed: false,
          span: 12,
          labelWidth: 'auto',
        }}
        options={false}
        loading={tableLoading}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          setTableLoading(true);
          const result = await queryAppExperimentList({
            pageIndex: current - 1,
            pageSize,
            appId: Number(currentApp?.id),
            ...other,
          });
          setTableLoading(false);
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

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
}))(AppExperimentList);
