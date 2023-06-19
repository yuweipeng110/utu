import React, { useRef, useEffect, useState } from 'react';
import { connect } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { Tag } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { StrategyDeployInfo } from '@/models/strategyDeploy';
import { queryAppVersionList } from '@/services/serverStatus';
import { queryLastDeployDetail } from '@/services/appDeploy';
import type { AppInfo } from '@/models/app';
import ProCard from '@ant-design/pro-card';
import ProDescriptions, { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import { StrategyDeployStatus } from '@/consts/strategyDeploy/const';

export type StrategyDeployListProps = {
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const StrategyDeployList: React.FC<StrategyDeployListProps> = (props) => {
  const { currentApp } = props;
  const actionRef = useRef<ActionType>();

  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [deployDetailData, setDeployDetailData] = useState(Object.create(null));

  const loadDeployDetailRequest = async () => {
    const res = await queryLastDeployDetail({ appId: currentApp?.id });
    setDeployDetailData(res.data);
  };

  useEffect(() => {
    loadDeployDetailRequest();
  }, []);

  useEffect(() => {
    loadDeployDetailRequest();
    actionRef.current?.reload();
  }, [currentApp]);

  const columns: ProColumns<StrategyDeployInfo>[] = [
    // {
    //   title: '应用名称',
    //   dataIndex: 'appName',
    // },
    {
      title: '服务ip地址',
      dataIndex: 'ip',
    },
    {
      title: '版本号',
      dataIndex: 'version',
    },
    {
      title: '心跳最后上报时间',
      dataIndex: 'notifyTime',
    },
    {
      title: '是否在线',
      dataIndex: 'online',
      render: (dom, record) => {
        return record.online === true ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>;
      },
    },
    {
        title: '是否最新版本',
        dataIndex: 'isNewVersion',
        render: (dom, record) => {
          return record.isNewVersion === true ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>;
        },
      }
  ];

  const descColumns: ProDescriptionsItemProps<any>[] = [
    {
      title: '发布单名称',
      dataIndex: 'name',
    },
    {
      title: '版本号',
      dataIndex: 'ossVersion',
    },
    {
      title: '修改人',
      dataIndex: 'modifyUser',
    },
    {
      title: '生效时间',
      dataIndex: 'effectTime',
      valueType: 'dateTime',
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: StrategyDeployStatus,
    },
    {
      title: '发布备注',
      dataIndex: 'deployRemark',
    },
  ];

  return (
    <PageContainer>
      <ProCard
        // tabs={{
        //   type: 'card',
        //   animated: true,
        // }}
        style={{ marginBottom: 15 }}
      >
        <ProDescriptions
          bordered
          column={3}
          title={false}
          dataSource={deployDetailData}
          columns={descColumns}
          style={{ width: '100%' }}
          size="small"
        />
      </ProCard>
      <ProTable<StrategyDeployInfo>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        loading={tableLoading}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          setTableLoading(true);
          const result = await queryAppVersionList({
            pageIndex: current - 1,
            pageSize,
            appId: currentApp && currentApp.id,
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
}))(StrategyDeployList);
