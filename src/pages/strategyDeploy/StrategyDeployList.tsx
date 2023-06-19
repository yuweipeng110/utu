import React, { useRef, useEffect, useState } from 'react';
import { connect, history } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { Button, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { StrategyDeployInfo } from '@/models/strategyDeploy';
import { queryAppDeployList, appDeploySnapshotRollback } from '@/services/appDeploy';
import {
  StrategyDeployStage,
  StrategyDeployStatus,
  StrategyDeployType,
} from '@/consts/strategyDeploy/const';
import type { AppInfo } from '@/models/app';
import StrategyDeployResult from './components/Modal/StrategyDeployResult';
import RollbackStrategyDeployList from './components/Modal/RollbackStrategyDeployList';

export type StrategyDeployListProps = {
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const StrategyDeployList: React.FC<StrategyDeployListProps> = (props) => {
  const { currentApp } = props;
  const actionRef = useRef<ActionType>();
  const appId = currentApp?.id;

  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [createAppDeployResultModalVisible, setCreateAppDeployResultModalVisible] =
    useState<boolean>(false);
  const [apiResult, setApiResult] = useState(Object.create(null));
  const [rollbackModalVisible, setRollbackModalVisible] = useState<boolean>(false);

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentApp]);

  const createAppDeployResultSwitch = (modalStatus: boolean, result: any) => {
    setApiResult(result);
    setCreateAppDeployResultModalVisible(true);
  };

  const handleRollbackRequest = async (orderId: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在生成回滚发布单...', key: loadingKey, duration: 0 });
    setTableLoading(true);
    const res = await appDeploySnapshotRollback({
      appId: Number(appId),
      orderId,
    });
    setTableLoading(false);
    if (res.code !== 1) {
      // message.error({ content: res.message, key: loadingKey, duration: 2 });
      message.destroy();
      createAppDeployResultSwitch(true, res);
      return false;
    }
    message.success({ content: '正在生成回滚发布单成功', key: loadingKey, duration: 2 });
    history.push(`/app/strategyDeploy/rollback?app_id=${appId}&id=${res.data}`);
    return true;
  };

  const renderBtn = (record: StrategyDeployInfo) => {
    const editBtn = (
      <a
        key="editBtn"
        onClick={() => {
          if (record.type === 0) {
            history.push(`/app/strategyDeploy/update?app_id=${appId}&id=${record.id}`);
          } else {
            history.push(`/app/strategyDeploy/rollback?app_id=${appId}&id=${record.id}`);
          }
        }}
      >
        详情
      </a>
    );
    const rollbackBtn =
      record.flag === 1 ? (
        <Popconfirm
          title="确定要回滚吗？"
          key="rollbackBtn"
          onConfirm={() => handleRollbackRequest(record.id)}
        >
          <a style={{ color: 'red' }}>回滚</a>
        </Popconfirm>
      ) : null;

    return [editBtn];
  };

  const columns: ProColumns<StrategyDeployInfo>[] = [
    {
      title: '发布版本',
      dataIndex: 'versionCode',
    },
    // {
    //   title: '发布单名称',
    //   dataIndex: 'name',
    // },
    {
      title: '发布人',
      dataIndex: 'modifyUser',
    },
    {
      title: '发布类型',
      dataIndex: 'type',
      valueEnum: StrategyDeployType,
      render: (dom, record) => {
        return record.type === 0 ? <Tag color="green">{dom}</Tag> : <Tag color="red">{dom}</Tag>;
      },
    },
    {
      title: '阶段',
      dataIndex: 'stage',
      valueEnum: StrategyDeployStage,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: StrategyDeployStatus,
    },
    {
      title: '发布时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
    },
    {
      title: '生效时间',
      dataIndex: 'effectTime',
      valueType: 'dateTime',
    },
    // {
    //   title: '发布备注',
    //   dataIndex: 'deployRemark',
    //   ellipsis: true,
    // },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => renderBtn(record),
    },
  ];

  return (
    <PageContainer>
      <ProTable<StrategyDeployInfo>
        headerTitle="发布记录"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="addBtn"
            onClick={() => {
              history.push(`/app/strategyDeploy/update?app_id=${appId}`);
            }}
          >
            <PlusOutlined /> 新建发布
          </Button>,
          <Button
            type="primary"
            key="rollbackBtn"
            danger
            onClick={() => {
              setRollbackModalVisible(true)
            }}
          >
            回滚
          </Button>,
        ]}
        options={false}
        loading={tableLoading}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          setTableLoading(true);
          const result = await queryAppDeployList({
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
      <StrategyDeployResult
        visible={createAppDeployResultModalVisible}
        onVisibleChange={setCreateAppDeployResultModalVisible}
        apiResult={apiResult}
      />
      <RollbackStrategyDeployList
        visible={rollbackModalVisible}
        onVisibleChange={setRollbackModalVisible}
        createAppDeployResultSwitch={createAppDeployResultSwitch}
      />
    </PageContainer>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
}))(StrategyDeployList);
