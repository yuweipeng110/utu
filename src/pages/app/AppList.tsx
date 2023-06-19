import React, { useRef, useState } from 'react';
import { Button, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { AppInfo, BucUser } from '@/models/app';
import { deleteApp, queryAppList } from '@/services/app';
import EditApp from '@/pages/app/components/ModalForm/EditApp';
import AuthorityEditModalForm from '@/pages/app/components/ModalForm/AuthorityEditModalForm';
import ViewAppSecret from '@/pages/app/components/Modal/ViewAppSecret';
import { DeleteAppPubSubId, AppDeploy } from '@/consts/const';
import PubSub from 'pubsub-js';
import './index.less';
import _ from 'lodash';

const AppList: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [authorityEditModalVisible, handleAuthorityEditModalVisible] = useState<boolean>(false);
  const [viewAppSecretModalVisible, handleViewAppSecretModalVisible] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<AppInfo>(Object.create(null));
  const [editAppTitle, setEditAppTitle] = useState<string>('');
  const [appEditModalVisible, setAppEditModalVisible] = useState<boolean>(false);
  const [appData, setAppData] = useState(Object.create(null));

  const editAppModalStatusSwitch = (
    editAppModalStatus: boolean,
    rowEditAppTitle: string,
    rowCurrentData?: any,
  ) => {
    setEditAppTitle(rowEditAppTitle);
    setCurrentData(rowCurrentData);
    setAppEditModalVisible(editAppModalStatus);
  };


  const handleDeleteRequest = async (appId: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在删除...', key: loadingKey, duration: 0 });
    setTableLoading(true);
    const res = await deleteApp({
      id: appId,
    });
    setTableLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    PubSub.publish(DeleteAppPubSubId, { appId });
    actionRef.current?.reload();
    message.success({ content: '删除成功', key: loadingKey, duration: 2 });
    return true;
  };

  const renderBtn = (record: AppInfo) => {
    const powerBtn = (
      <a
        key="admin"
        onClick={() => {
          setCurrentData(record);
          handleAuthorityEditModalVisible(true);
        }}
      >
        管理员权限
      </a>
    );
    const editBtn = (
      <a key="editBtn" onClick={() => editAppModalStatusSwitch(true, '编辑应用', record)}>
        编辑
      </a>
    );
    const deleteBtn = (
      <Popconfirm
        title="确定要删除吗？"
        key="deleteFirm"
        onConfirm={() => handleDeleteRequest(record.id)}
      >
        <a key="delete">删除</a>
      </Popconfirm>
    );

    if (record.isCanDeleted) {
      return [powerBtn, editBtn, deleteBtn];
    }
    return [powerBtn, editBtn];
  };

  const columns: ProColumns<AppInfo>[] = [
    {
      title: 'GROUP Code',
      dataIndex: 'groupCode',
      width: 110,
    },
    {
      title: 'APP Code',
      dataIndex: 'appCode',
    },
    {
      title: '查看密钥',
      dataIndex: 'appScene',
      align: 'center',
      width: 80,
      render: (value, record) => {
        return (
          <a
            key="admin"
            onClick={() => {
              setCurrentData(record);
              handleViewAppSecretModalVisible(true);
            }}
          >
            <EyeInvisibleOutlined />
          </a>
        );
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
      title: '部署方式',
      dataIndex: 'appDeploy',
      valueEnum: AppDeploy,
    },
    {
      title: '管理员权限人员',
      dataIndex: 'emps',
      render: (value: any, record) => {
        return value.length > 0
          ? value.map((item: BucUser, index: number) => (
              <Tag key={`${record.id}_${index}`}>
                {item.empId}-{item.empName}
              </Tag>
            ))
          : '';
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 200,
      render: (_, record: AppInfo) => renderBtn(record),
    },
  ];

  return (
    <PageContainer>
      <ProTable<AppInfo>
        headerTitle="应用列表"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          !_.isEmpty(appData) && appData.highRoleType <= 1 && (
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                editAppModalStatusSwitch(true, '新建应用');
              }}
            >
              <PlusOutlined /> 新建应用
            </Button>
          ),
        ]}
        options={false}
        loading={tableLoading}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          setTableLoading(true);
          const result = await queryAppList({
            pageIndex: current - 1,
            pageSize,
            ...other,
          });
          setTableLoading(false);
          setAppData(result.data.datas[0]);
          return {
            data: result.data.datas[0].voList,
            success: true,
            total: result.data.totalCount,
          };
        }}
        pagination={{
          pageSize: 10,
        }}
        columns={columns}
      />
      <EditApp
        actionRef={actionRef}
        title={editAppTitle}
        visible={appEditModalVisible}
        onVisibleChange={setAppEditModalVisible}
        currentData={currentData}
      />
      <AuthorityEditModalForm
        actionRef={actionRef}
        visible={authorityEditModalVisible}
        onVisibleChange={handleAuthorityEditModalVisible}
        currentData={currentData}
      />
      <ViewAppSecret
        visible={viewAppSecretModalVisible}
        onVisibleChange={handleViewAppSecretModalVisible}
        currentData={currentData}
      />
    </PageContainer>
  );
};

export default AppList;
