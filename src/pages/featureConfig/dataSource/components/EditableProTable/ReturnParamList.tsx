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

type ReturnParamListType = {
  returnParamList: DataSourceParamsType[];
  setReturnParamList: (value: DataSourceParamsType[]) => void;
  isShowReturnParamAlias: boolean;
  returnParamMetadataOptions: OptionType[];
  handleSearchMetadata: (value: string) => void;
  featureCancel: any;
  featureLoading: any;
};

const ReturnParamList: React.FC<ReturnParamListType> = (props) => {
  const {
    returnParamList,
    setReturnParamList,
    isShowReturnParamAlias,
    returnParamMetadataOptions,
    handleSearchMetadata,
    featureCancel,
    featureLoading,
  } = props;
  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  const handleReturnParamsMetadataSelect = (index: any, value: any, option?: any) => {
    // setReturnParamList
    returnParamList[index].metadataId = value;
    returnParamList[index].englishLabel = option.label;
    returnParamList[index].alias = option.label;
    setReturnParamList(_.sortBy(_.unionBy([...returnParamList], 'index'), 'index'));
  };

  const handleReturnParamsMetadataText = (index: any, value: any) => {
    // setReturnParamList
    returnParamList[index].alias = value;
    setReturnParamList(_.sortBy(_.unionBy([...returnParamList], 'index'), 'index'));
  };

  const metadataSelect = (index: number, isItem: boolean) => {
    const selectValue = !isItem ? { value: returnParamList[Number(index)].metadataId } : {};
    return (
      <ProFormSelect
        label={false}
        width="sm"
        placeholder="请输入英文标示(key)"
        showSearch
        options={returnParamMetadataOptions}
        fieldProps={{
          showArrow: true,
          filterOption: false,
          onSearch: (value) => handleSearchMetadata(value),
          onBlur: featureCancel,
          onSelect: (value, option) => handleReturnParamsMetadataSelect(index, value, option),
          loading: featureLoading,
          notFoundContent: featureLoading ? <Spin size="small" /> : <Empty />,
          ...selectValue,
        }}
      />
    );
  };

  const metadataAliasText = (index: number) => {
    const initValue = { value: returnParamList[Number(index)].alias };
    return (
      <ProFormText
        label={false}
        width="sm"
        fieldProps={{
          onChange: (e) => {
            const { value } = e.target;
            handleReturnParamsMetadataText(index, value);
          },
          ...initValue,
        }}
      />
    );
  };

  const returnParamAliasColumns: ProColumns<DataSourceParamsType> = {
    title: '别名',
    dataIndex: 'alias',
    width: '30%',
    hideInTable: !isShowReturnParamAlias,
    render: (dom, record, index) => {
      return metadataAliasText(index);
    },
    renderFormItem: (item) => {
      const { index } = item;
      return metadataAliasText(Number(index));
    },
  };

  const returnParamColumns: ProColumns<DataSourceParamsType>[] = [
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
    returnParamAliasColumns,
    {
      title: '操作',
      valueType: 'option',
      width: '10%',
      render: (text, record) => {
        const deleteBtn = (
          <a
            key="delete"
            onClick={() => {
              setReturnParamList(
                returnParamList.filter((item) => item.metadataId !== record.metadataId),
              );
            }}
          >
            删除
          </a>
        );
        return returnParamList.length > 1 ? [deleteBtn] : [];
      },
    },
  ];

  return (
    <ProCard title="返回列表" headerBordered collapsible defaultCollapsed={false}>
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
        columns={returnParamColumns}
        value={returnParamList}
        onChange={setReturnParamList}
        editable={{
          type: 'multiple',
          editableKeys,
          actionRender: (row, config, defaultDoms) => {
            return returnParamList.length >= 2 ? [defaultDoms.delete] : [];
            // return [defaultDoms.cancel];
          },
          onChange: setEditableRowKeys,
        }}
      />
    </ProCard>
  );
};

export default ReturnParamList;
