import React, { useRef, useState } from 'react';
import { Button, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { queryMetadataList } from "@/services/featureConfig";
import type { MetadataInfo } from "@/models/featureConfig";
import { FeatureType, FeatureDataType } from "@/consts/feature/const";
import EditMetadata from "@/pages/featureConfig/metadata/components/ModalForm/EditMetadata";

const MetadataList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [editTitle, setEditTitle] = useState<string>('');
  const [editMetadataModalVisible, handleEditMetadataModalVisible] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<MetadataInfo>(Object.create(null));

  const editMetadataModalStatusSwitch = (editMetadataTitle: string, editMetadataModalStatus: boolean, rowCurrentData?: any) => {
    setEditTitle(editMetadataTitle);
    handleEditMetadataModalVisible(editMetadataModalStatus);
    setCurrentData(rowCurrentData);
  }

  const columns: ProColumns<MetadataInfo>[] = [
    {
      title: '中文名称',
      dataIndex: 'name',
    },
    {
      title: '英文标示(key)',
      dataIndex: 'englishLabel',
    },
    {
      title: '数据类型',
      dataIndex: 'type',
      valueEnum: FeatureDataType
    },
    {
      title: '特征类型',
      dataIndex: 'relyType',
      valueEnum: FeatureType
    },
    {
      title: '来源',
      dataIndex: ['sourceInfo','name'],
    },
    {
      title: '初始值',
      dataIndex: 'initValue',
    },
    {
      title: '取值范围',
      dataIndex: 'valueRange',
      width: '25%',
      render: (value: any, record) => {
        const valueRangeArr = value.split(',');
        return record.valueRange.length > 0 ? valueRangeArr.map((item: any) =>
          <Tag key={`${record.id}_${item}`}>{item}</Tag>) : '';
        // return record.valueRange.length > 0 ? valueRangeArr.length : '';
      },
    },
    {
      title: '操作',
      render: (dom, record) => <a onClick={() => editMetadataModalStatusSwitch('修改元数据', true, record)}>修改</a>,
    },
  ];

  return (
    <PageContainer>
      <ProTable<MetadataInfo>
        headerTitle="特征列表"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              editMetadataModalStatusSwitch('新增特征', true);
            }}
          >
            <PlusOutlined/> 新建特征
          </Button>,
        ]}
        request={(params) => queryMetadataList({ ...params })}
        pagination={{
          pageSize: 10,
        }}
        columns={columns}
      />
      <EditMetadata
        actionRef={actionRef}
        title={editTitle}
        visible={editMetadataModalVisible}
        onVisibleChange={handleEditMetadataModalVisible}
        currentData={currentData}
      />
    </PageContainer>
  );
}

export default MetadataList;
