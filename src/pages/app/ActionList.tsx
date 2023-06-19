import React, { useEffect, useRef, useState } from 'react';
import { connect, history } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Dropdown, Menu, message, Popconfirm } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { GroupInfo } from '@/models/group';
import type { AppInfo } from '@/models/app';
import { ActionInfo } from '@/models/action';
import { deleteAction, queryActionList } from '@/services/action';
import EditAction from '@/pages/app/components/ModalForm/EditAction';
import { ActionInfoType } from '@/consts/action/const';
import './index.less';

export type ActionListProps = {
  currentGroup?: GroupInfo;
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const ActionList: React.FC<ActionListProps> = (props) => {
  const { currentGroup, currentApp } = props;
  const actionRef = useRef<ActionType>();

  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [editActionModalVisible, handleEditActionModalVisible] = useState<boolean>(false);
  const [editActionTitle, setEditActionTitle] = useState<string>('');
  const [currentData, setCurrentData] = useState<ActionInfo>(Object.create(null));
  const [isView, setIsView] = useState<boolean>(false);
  const [isCopy, setIsCopy] = useState<boolean>(false);

  const editActionModalStatusSwitch = (
    editActionModalStatus: boolean,
    rowEditActionTitle: string,
    rowCurrentData?: any,
    rowIsView?: boolean,
    rowIsCopy?: boolean,
  ) => {
    setEditActionTitle(rowEditActionTitle);
    setCurrentData(rowCurrentData);
    setIsView(rowIsView || false);
    setIsCopy(rowIsCopy || false);
    handleEditActionModalVisible(editActionModalStatus);
  };

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentApp]);

  const handleDeleteRequest = async (actionId: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在删除...', key: loadingKey, duration: 0 });
    setTableLoading(true);
    const res = await deleteAction({
      actionId: Number(actionId),
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

  const renderBtn = (record: ActionInfo) => {
    const cloneBtn = (
      <a
        key="cloneBtn"
        onClick={() => editActionModalStatusSwitch(true, '新建动作', record, false, true)}
      >
        克隆
      </a>
    );
    // const editBtn = (
    //   <a
    //     key="editBtn"
    //     onClick={() => editActionModalStatusSwitch(true, '编辑动作', record)}
    //   >
    //     编辑
    //   </a>
    // );

    const viewBtn = (
      <a key="viewBtn" onClick={() => editActionModalStatusSwitch(true, '详情', record, true)}>
        查看
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

    const moreMenu = (
      <Menu>
        <Menu.Item>{cloneBtn}</Menu.Item>
        <Menu.Item>{deleteBtn}</Menu.Item>
      </Menu>
    );

    const moreBtn = (
      <Dropdown key="more" overlay={moreMenu}>
        <a onClick={(e) => e.preventDefault()}>
          操作 <DownOutlined />
        </a>
      </Dropdown>
    );

    return [viewBtn, moreBtn];
  };

  const columns: ProColumns<ActionInfo>[] = [
    {
      title: '动作名称',
      dataIndex: 'name',
      hideInSearch: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueEnum: ActionInfoType,
      hideInSearch: true,
    },
    {
      title: '修改人',
      dataIndex: 'updateUser',
      hideInSearch: true,
    },
    {
      title: ' 修改时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      hideInSearch: true,
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
      <ProTable<ActionInfo>
        headerTitle="动作列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          className: 'display-none-search',
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => editActionModalStatusSwitch(true, '新建动作')}
          >
            <PlusOutlined /> 新建动作
          </Button>,
        ]}
        options={false}
        loading={tableLoading}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          setTableLoading(true);
          const result = await queryActionList({
            pageIndex: current - 1,
            pageSize,
            appId: currentApp && currentApp.id,
            groupId: currentGroup && currentGroup.groupId,
            ...other,
          });
          setTableLoading(false);
          if (result.code === 11111) {
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
      <EditAction
        actionRef={actionRef}
        title={editActionTitle}
        visible={editActionModalVisible}
        onVisibleChange={handleEditActionModalVisible}
        currentData={currentData}
        isView={isView}
        isCopy={isCopy}
        setIsCopy={setIsCopy}
      />
    </PageContainer>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
  currentGroup: app.currentGroup,
}))(ActionList);
