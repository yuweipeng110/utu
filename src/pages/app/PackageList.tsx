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
import { PackageInfo } from '@/models/package';
import { deletePackage, queryPackageList } from '@/services/package';
import AddPackage from '@/pages/app/components/ModalForm/AddPackage';
import './index.less';

export type PackageListProps = {
  currentGroup?: GroupInfo;
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const PackageList: React.FC<PackageListProps> = (props) => {
  const { currentGroup,currentApp } = props;
  const actionRef = useRef<ActionType>();

  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [editPackageModalVisible, handleEditPackageModalVisible] = useState<boolean>(false);
  const [editPackageTitle, setEditPackageTitle] = useState<string>('');
  const [currentData, setCurrentData] = useState<PackageInfo>(Object.create(null));
  const [isView, setIsView] = useState<boolean>(false);

  const editPackageModalStatusSwitch = (
    editPackageModalStatus: boolean,
    rowEditPackageTitle: string,
    rowCurrentData?: any,
    rowIsView?: boolean,
  ) => {
    setEditPackageTitle(rowEditPackageTitle);
    setCurrentData(rowCurrentData);
    setIsView(rowIsView || false);
    handleEditPackageModalVisible(editPackageModalStatus);
  };

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentApp]);

  const handleDeleteRequest = async (packageId: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在删除...', key: loadingKey, duration: 0 });
    setTableLoading(true);
    const res = await deletePackage({
      packageId: Number(packageId),
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

  const renderBtn = (record: PackageInfo) => {
    const editBtn = (
      <a
        key="editBtn"
        onClick={() => {
          history.push(`/knowledge/package/update?app_id=${record.appId}&id=${record.id}`);
        }}
      >
        管理包内容
      </a>
    );

    const deleteBtn =
      record.name !== 'default' ? (
        <Popconfirm
          key="deleteBtn"
          title="确定要删除吗？"
          onConfirm={() => handleDeleteRequest(record.id)}
        >
          <a key="delete">删除</a>
        </Popconfirm>
      ) : null;

    return [editBtn, deleteBtn];
  };

  const columns: ProColumns<PackageInfo>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      hideInSearch: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '修改人',
      dataIndex: 'modifyUser',
      hideInSearch: true,
    },
    {
      title: ' 修改时间',
      dataIndex: 'modifyTime',
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
      <ProTable<PackageInfo>
        headerTitle="包列表"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => editPackageModalStatusSwitch(true, '新建包')}
          >
            <PlusOutlined /> 新建包
          </Button>,
        ]}
        options={false}
        loading={tableLoading}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          setTableLoading(true);
          const result = await queryPackageList({
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
      <AddPackage
        actionRef={actionRef}
        title={editPackageTitle}
        visible={editPackageModalVisible}
        onVisibleChange={handleEditPackageModalVisible}
        currentData={currentData}
        isView={isView}
      />
    </PageContainer>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
  currentGroup: app.currentGroup,
}))(PackageList);
