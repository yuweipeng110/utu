import { useEffect, useState } from 'react';
import { connect } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { history, Link } from 'umi';
import { Modal, Result, Button, Tag, Popconfirm, message } from 'antd';
import { AppInfo } from '@/models/app';
import _ from 'lodash';
import { appDeploySnapshotRollback, queryappPublishRollBackList } from '@/services/appDeploy';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { StrategyDeployRollbackInfo } from '@/models/strategyDeploy';
import {
  StrategyDeployStage,
  StrategyDeployStatus,
  StrategyDeployType,
} from '@/consts/strategyDeploy/const';

type RollbackStrategyDeployListProps = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  createAppDeployResultSwitch: any;
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const RollbackStrategyDeployList: React.FC<RollbackStrategyDeployListProps> = (props) => {
  const { visible, onVisibleChange, createAppDeployResultSwitch, currentApp } = props;
  const appId = currentApp?.id;

  const [rollbackList, setRollbackList] = useState([]);
  const [tableLoading, setTableLoading] = useState<boolean>(false);

  const getRollbackListRequest = async () => {
    setTableLoading(true);
    const res = await queryappPublishRollBackList({
      appId: currentApp && currentApp.id,
    });
    setTableLoading(false);
    if(res.code === -1){
        return;
    }
    setRollbackList(res);
  };

  useEffect(() => {
    if (visible) {
      getRollbackListRequest();
    }
  }, [visible]);

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

  const columns: ProColumns<StrategyDeployRollbackInfo>[] = [
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
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => {
        const rollbackBtn = (
          <Popconfirm
            title="确定要回滚吗？"
            key="rollbackBtn"
            onConfirm={() => handleRollbackRequest(record.id)}
          >
            <a style={{ color: 'red' }}>回滚</a>
          </Popconfirm>
        );

        return [rollbackBtn];
      },
    },
  ];

  return (
    <Modal
      title="回滚记录"
      visible={visible}
      centered={true}
      onCancel={() => {
        onVisibleChange(false);
      }}
      cancelText="关闭"
      okButtonProps={{
        style: {
          display: 'none',
        },
      }}
      width={'90%'}
    >
      <ProTable<StrategyDeployRollbackInfo>
        headerTitle={false}
        rowKey="id"
        search={false}
        options={false}
        dataSource={rollbackList}
        pagination={false}
        columns={columns}
        loading={tableLoading}
      />
    </Modal>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
}))(RollbackStrategyDeployList);
