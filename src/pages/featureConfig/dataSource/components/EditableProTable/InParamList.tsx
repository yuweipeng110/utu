import React, { useRef, useState } from 'react';
import { Empty, Spin } from 'antd';
import ProCard from '@ant-design/pro-card';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import type { DataSourceParamsType } from '@/models/featureConfig';
import _ from 'lodash';

type OptionType = {
  value: number;
  label: string;
};

type InParamListType = {
  inParamList: DataSourceParamsType[];
  setInParamList: (value: DataSourceParamsType[]) => void;
  isShowInParamAlias: boolean;
  inParamMetadataOptions: OptionType[];
  handleSearchMetadata: (value: string) => void;
  featureCancel: any;
  featureLoading: any;
};

const InParamList: React.FC<InParamListType> = (props) => {
  const {
    inParamList,
    setInParamList,
    isShowInParamAlias,
    inParamMetadataOptions,
    handleSearchMetadata,
    featureCancel,
    featureLoading,
  } = props;
  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  const handleInParamsMetadataSelect = (index: any, value: any, option?: any) => {
    // setInParamList
    inParamList[index].metadataId = value;
    inParamList[index].englishLabel = option.label;
    inParamList[index].alias = option.label;
    setInParamList(_.sortBy(_.unionBy([...inParamList], 'index'), 'index'));
  };

  const handleInParamsMetadataText = (index: any, value: any) => {
    // setInParamList
    inParamList[index].alias = value;
    setInParamList(_.sortBy(_.unionBy([...inParamList], 'index'), 'index'));
  };

  const metadataSelect = (index: number, isItem: boolean) => {
    const selectValue = !isItem ? { value: inParamList[Number(index)].metadataId } : {};
    return (
      <ProFormSelect
        label={false}
        width="sm"
        placeholder="请输入英文标示(key)"
        showSearch
        options={inParamMetadataOptions}
        fieldProps={{
          showArrow: true,
          filterOption: false,
          onSearch: (value) => handleSearchMetadata(value),
          onBlur: featureCancel,
          onSelect: (value, option) => handleInParamsMetadataSelect(index, value, option),
          loading: featureLoading,
          notFoundContent: featureLoading ? <Spin size="small" /> : <Empty />,
          ...selectValue,
        }}
      />
    );
  };

  const metadataAliasText = (index: number) => {
    const initValue = { value: inParamList[Number(index)].alias };
    return (
      <ProFormText
        label={false}
        width="sm"
        fieldProps={{
          onChange: (e) => {
            const { value } = e.target;
            handleInParamsMetadataText(index, value);
          },
          ...initValue,
        }}
      />
    );
  };

  const inParamAliasColumns: ProColumns<DataSourceParamsType> = {
    title: '别名',
    dataIndex: 'alias',
    width: '30%',
    hideInTable: !isShowInParamAlias,
    render: (dom, record, index) => {
      return metadataAliasText(index);
    },
    renderFormItem: (item) => {
      const { index } = item;
      return metadataAliasText(Number(index));
    },
  };

  const inParamColumns: ProColumns<DataSourceParamsType>[] = [
    {
      title: '特征',
      dataIndex: 'metadataId',
      width: '50%',
      render: (dom, record, index) => {
        return metadataSelect(index, false);
      },
      renderFormItem: (item) => {
        const { index } = item;
        return metadataSelect(Number(index), true);
      },
    },
    inParamAliasColumns,
    {
      title: '操作',
      valueType: 'option',
      width: '10%',
      render: (text, record) => {
        const deleteBtn = (
          <a
            key="delete"
            onClick={() => {
              setInParamList(inParamList.filter((item) => item.metadataId !== record.metadataId));
            }}
          >
            删除
          </a>
        );
        return inParamList.length > 1 ? [deleteBtn] : [];
      },
    },
  ];

  return (
    <ProCard title="入参列表" headerBordered collapsible defaultCollapsed={false}>
      <EditableProTable<DataSourceParamsType>
        headerTitle={false}
        size="small"
        rowKey="id"
        actionRef={actionRef}
        // 关闭默认的新建按钮
        // recordCreatorProps={false}
        recordCreatorProps={{
          newRecordType: 'dataSource',
          record: (index) => ({
            id: Date.now(),
            index,
          }),
        }}
        columns={inParamColumns}
        value={inParamList}
        onChange={setInParamList}
        editable={{
          type: 'multiple',
          editableKeys,
          actionRender: (row, config, defaultDoms) => {
            return inParamList.length >= 2 ? [defaultDoms.delete] : [];
            // return [defaultDoms.cancel];
          },
          onChange: setEditableRowKeys,
        }}
      />
    </ProCard>
  );
};

export default InParamList;
