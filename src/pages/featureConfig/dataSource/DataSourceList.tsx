import React, { useRef, useState } from 'react';
import { Button, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns , ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { queryDataSourceList } from "@/services/featureConfig";
import type { DataSourceInfo, DataSourceParamsType } from "@/models/featureConfig";
import EditDataSource from "@/pages/featureConfig/dataSource/components/ModalForm/EditDataSource";
import './index.less';

const DataSourceList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDataSourceModalVisible, handleEditDataSourceModalVisible] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<DataSourceInfo>(Object.create(null));

  const editDataSourceModalStatusSwitch = (editDataSourceTitle: string, editDataSourceModalStatus: boolean, rowCurrentData?: any) => {
    setEditTitle(editDataSourceTitle);
    handleEditDataSourceModalVisible(editDataSourceModalStatus);
    setCurrentData(rowCurrentData);
  }

  const columns: ProColumns<DataSourceInfo>[] = [
    {
      title: '中文名称',
      dataIndex: 'name',
    },
    {
      title: '英文名称',
      dataIndex: 'englishName',
    },
    {
      title: '服务url',
      dataIndex: 'serverAddress',
      render: (value: any,record) => {
        return record.serverAddress.length > 0 ? `${record.serverAddress}:${record.port}${record.url}` : '';
      },
    },
    {
      title: '入参列表',
      dataIndex: 'inParams',
      width: '25%',
      render: (value: any, record) => {
        return value.length > 0 ? value.map((item: DataSourceParamsType) =>
          <Tag key={`${record.id}_${item.metadataId}`}>{`${item.englishLabel}-${item.alias}`}</Tag>) : '';
      },
    },
    {
      title: '返回列表',
      dataIndex: 'returnParams',
      width: '25%',
      render: (value: any, record) => {
        return value.length > 0 ? value.map((item: DataSourceParamsType) =>
          <Tag key={`${record.id}_${item.metadataId}`}>{`${item.englishLabel}-${item.alias}`}</Tag>) : '';
      },
    },
    {
      title: '操作',
      render: (dom, record) => <a onClick={() => editDataSourceModalStatusSwitch('修改数据源', true, record)}>修改</a>,
    },
  ];

  return (
    <PageContainer>
      <ProTable<DataSourceInfo>
        headerTitle="数据源列表"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              editDataSourceModalStatusSwitch('新增数据源', true);
            }}
          >
            <PlusOutlined/> 新建数据源
          </Button>,
        ]}
        request={(params) => queryDataSourceList({ ...params })}
        pagination={{
          pageSize: 10,
        }}
        columns={columns}
      />
      <EditDataSource
        actionRef={actionRef}
        title={editTitle}
        visible={editDataSourceModalVisible}
        onVisibleChange={handleEditDataSourceModalVisible}
        currentData={currentData}
      />
    </PageContainer>
  );
}

export default DataSourceList;
