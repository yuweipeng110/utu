import React, { useRef, useState } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { DeployConfigInfo } from '@/models/deployConfig';
import { queryDeployConfigList } from '@/services/deployConfig';
import EditDeployConfig from './components/ModalForm/EditDeployConfig';

const DeployConfigList: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editConfigModalVisible, handleEditConfigModalVisible] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<DeployConfigInfo>(Object.create(null));

  const editConfigModalStatusSwitch = (editConfigTitle: string,editFeatureModalStatus: boolean,rowCurrentData?: any,) => {
    setEditTitle(editConfigTitle);
    handleEditConfigModalVisible(editFeatureModalStatus);
    setCurrentData(rowCurrentData);
  };

  const renderBtn = (record: DeployConfigInfo) => {
    const editBtn = (
      <a key="editBtn" onClick={() => editConfigModalStatusSwitch('修改发布配置', true, record)}>
        修改
      </a>
    );

    return [editBtn];
  };

  const columns: ProColumns<DeployConfigInfo>[] = [
    {
      title: 'Aone应用名称',
      dataIndex: 'aoneAppName',
    },
    {
      title: '修改人',
      dataIndex: 'modifyUser',
    },
    {
      title: '修改时间',
      dataIndex: 'modifyTime',
      valueType: 'dateTime',
    },
    {
      title: '发布备注',
      dataIndex: 'remark',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => renderBtn(record),
    },
  ];

  return (
    <PageContainer>
      <ProTable<DeployConfigInfo>
        headerTitle="发布配置列表"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              editConfigModalStatusSwitch('新建发布配置', true);
            }}
          >
            <PlusOutlined /> 新建发布配置
          </Button>,
        ]}
        options={false}
        loading={tableLoading}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          setTableLoading(true);
          const result = await queryDeployConfigList({
            pageIndex: current - 1,
            pageSize,
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
      <EditDeployConfig
        actionRef={actionRef}
        title={editTitle}
        visible={editConfigModalVisible}
        onVisibleChange={handleEditConfigModalVisible}
        currentData={currentData}
      />
    </PageContainer>
  );
};

export default DeployConfigList;
