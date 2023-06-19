import React, { useEffect, useRef, useState } from 'react';
import { history, connect } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { GroupInfo } from '@/models/group';
import type { AppInfo } from '@/models/app';
import { FlowInfo } from '@/models/flow';
import { deleteFlow, queryFlowList } from '@/services/flow';
import DecisionAddFlow from './components/ModalForm/DecisionAddFlow';

export type DecisionFlowListProps = {
  currentApp?: AppInfo;
  currentGroup?: GroupInfo;
} & Partial<ConnectProps>;

const DecisionFlowList: React.FC<DecisionFlowListProps> = (props) => {
  const { currentApp,currentGroup } = props;
  const actionRef = useRef<ActionType>();

  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [editFlowModalVisible, handleEditFlowModalVisible] = useState<boolean>(false);
  const [editFlowTitle, setEditFlowTitle] = useState<string>('');
  const [currentData, setCurrentData] = useState<FlowInfo>(Object.create(null));
  const [isView, setIsView] = useState<boolean>(false);

  const editFlowModalStatusSwitch = (
    editFlowModalStatus: boolean,
    rowEditFlowTitle: string,
    rowCurrentData?: any,
    rowIsView?: boolean,
  ) => {
    setEditFlowTitle(rowEditFlowTitle);
    setCurrentData(rowCurrentData);
    setIsView(rowIsView || false);
    handleEditFlowModalVisible(editFlowModalStatus);
  };

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentApp]);

  const handleDeleteRequest = async (flowId: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在删除...', key: loadingKey, duration: 0 });
    setTableLoading(true);
    const res = await deleteFlow({
      flowId: Number(flowId),
      appId: currentApp?.id,
    });
    setTableLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    actionRef.current?.reload();
    message.success({ content: '删除成功', key: loadingKey, duration: 2 });
    return true;
  };

  const renderBtn = (record: FlowInfo) => {
    const editBtn = (
      <a
        key="editBtn"
        onClick={() => {
          history.push(`/knowledge/flow/update?app_id=${currentApp?.id}&id=${record.id}`);
        }}
      >
        管理内容
      </a>
    );

    const deleteBtn = (
      <Popconfirm
        key="deleteBtn"
        title="确定要删除吗？"
        onConfirm={() => handleDeleteRequest(record.id)}
      >
        <a key="delete">删除</a>
      </Popconfirm>
    );

    return [editBtn, deleteBtn];
  };

  const columns: ProColumns<FlowInfo>[] = [
    {
      title: '所属包',
      dataIndex: 'packageName',
    },
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      // ellipsis: true,
    },
    {
      title: '修改人',
      dataIndex: 'modifyUser',
    },
    {
      title: ' 修改时间',
      dataIndex: 'modifyTime',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: '200px',
      render: (value, record) => renderBtn(record),
    },
  ];

  return (
    <PageContainer>
      <ProTable<FlowInfo>
        headerTitle="决策流列表"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => editFlowModalStatusSwitch(true, '新建决策流')}
          >
            <PlusOutlined /> 新建决策流
          </Button>,
        ]}
        options={false}
        loading={tableLoading}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          setTableLoading(true);
          const result = await queryFlowList({
            pageIndex: current - 1,
            pageSize,
            appId: currentApp && currentApp.id,
            groupId: currentGroup && currentGroup.groupId,
            ...other,
          });
          setTableLoading(false);
          if(result.code === 11111) {
            history.push('/unselected');
          }
          return {
            data: result.data.datas,
            success: true,
            total: result.data.totalCount,
          };
        }}
        pagination={{
          pageSize: 10,
        }}
        columns={columns}
      />
      <DecisionAddFlow
        actionRef={actionRef}
        title={editFlowTitle}
        visible={editFlowModalVisible}
        onVisibleChange={handleEditFlowModalVisible}
        currentData={currentData}
        isView={isView}
      />
    </PageContainer>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
  currentGroup: app.currentGroup,
}))(DecisionFlowList);
