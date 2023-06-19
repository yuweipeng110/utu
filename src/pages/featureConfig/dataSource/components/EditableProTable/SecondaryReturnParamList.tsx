import React, { useRef, useState } from "react";
import { Empty, Spin } from "antd";
import ProCard from "@ant-design/pro-card";
import type { ActionType, ProColumns } from "@ant-design/pro-table";
import { EditableProTable } from "@ant-design/pro-table";
import { ProFormSelect, ProFormText } from "@ant-design/pro-form";
import type { DataSourceParamsType } from "@/models/featureConfig";
import _ from "lodash";

type OptionType = {
  value: number;
  label: string;
}

type ReturnParam2ListType = {
  returnParam2List: DataSourceParamsType[];
  setReturnParam2List: (value: DataSourceParamsType[]) => void;
  isShowReturnParam2Alias: boolean;
  returnParam2MetadataOptions: OptionType[];
  handleSearchMetadata: (value: string) => void;
  featureCancel: any;
  featureLoading: any;
}

const SecondaryReturnParamList: React.FC<ReturnParam2ListType> = (props) => {
  const {
    returnParam2List,
    setReturnParam2List,
    returnParam2MetadataOptions,
    handleSearchMetadata,
    featureCancel,
    featureLoading
  } = props;
  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  const handleReturnParam2sMetadataSelect = (index: any, value: any, option?: any) => {
    // setReturnParam2List
    returnParam2List[index].metadataId = value;
    returnParam2List[index].englishLabel = option.label;
    returnParam2List[index].alias = option.label;
    setReturnParam2List(_.sortBy(_.unionBy([...returnParam2List], 'index'), 'index'));
  }

  const handleReturnParam2sMetadataText = (index: any, value: any) => {
    // setReturnParam2List
    returnParam2List[index].alias = value;
    setReturnParam2List(_.sortBy(_.unionBy([...returnParam2List], 'index'), 'index'));
  }

  const handleReturnParams2MetadataTextPrefix = (index: any, value: any) => {
    // setReturnParam2List
    returnParam2List[index].prefixAlias = value;
    setReturnParam2List(_.sortBy(_.unionBy([...returnParam2List], 'index'), 'index'));
  }

  const metadataSelect = (index: number, isItem: boolean) => {
    const selectValue = !isItem ? { value: returnParam2List[Number(index)].metadataId } : {};
    return (
      <ProFormSelect
        label={false}
        width="sm"
        placeholder="请输入英文标示(key)"
        showSearch
        options={returnParam2MetadataOptions}
        fieldProps={{
          showArrow: true,
          filterOption: false,
          onSearch: (value) => handleSearchMetadata(value),
          onBlur: featureCancel,
          onSelect: (value, option) => handleReturnParam2sMetadataSelect(index, value, option),
          loading: featureLoading,
          notFoundContent: featureLoading ? <Spin size="small"/> : <Empty/>,
          ...selectValue,
        }}
      />
    );
  }

  const metadataPrefixAliasText = (index: number) => {
    const initValue = { value: returnParam2List[Number(index)].prefixAlias };
    return (
      <ProFormText
        label={false}
        width='xs'
        fieldProps={{
          onChange: (e) => {
            const { value } = e.target;
            handleReturnParams2MetadataTextPrefix(index, value);
          },
          ...initValue,
        }}
      />
    );
  }

  const returnParamPrefixAliasColumns: ProColumns<DataSourceParamsType> = {
    title: '分组',
    dataIndex: 'prefixAlias',
    width: '30%',
    render: (dom, record, index) => {
      return metadataPrefixAliasText(index);
    },
    renderFormItem: (item) => {
      const { index } = item;
      return metadataPrefixAliasText(Number(index));
    }
  };

  const metadataAliasText = (index: number) => {
    const initValue = { value: returnParam2List[Number(index)].alias };
    return (
      <ProFormText
        label={false}
        width='xs'
        fieldProps={{
          onChange: (e) => {
            const { value } = e.target;
            handleReturnParam2sMetadataText(index, value);
          },
          ...initValue,
        }}
      />
    );
  }

  const returnParamAliasColumns: ProColumns<DataSourceParamsType> = {
    title: '别名',
    dataIndex: 'alias',
    width: '30%',
    render: (dom, record, index) => {
      return metadataAliasText(index);
    },
    renderFormItem: (item) => {
      const { index } = item;
      return metadataAliasText(Number(index));
    }
  };

  const returnParam2Columns: ProColumns<DataSourceParamsType>[] = [
    returnParamPrefixAliasColumns,
    {
      title: '特征',
      dataIndex: 'metadataId',
      width: '30%',
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
        const deleteBtn = <a
          key="delete"
          onClick={() => {
            setReturnParam2List(returnParam2List.filter((item) => item.metadataId !== record.metadataId));
          }}
        >
          删除
        </a>
        return returnParam2List.length > 1 ? [deleteBtn] : [];
      },
    },
  ];

  return (
    <ProCard
      title="二级入参列表"
      headerBordered
      collapsible
      defaultCollapsed={false}
    >
      <EditableProTable<DataSourceParamsType>
        headerTitle={false}
        size='small'
        rowKey="id"
        actionRef={actionRef}
        recordCreatorProps={{
          newRecordType: 'dataSource',
          record: (index) => ({
            id: Date.now(),
            index
          }),
        }}
        columns={returnParam2Columns}
        value={returnParam2List}
        onChange={setReturnParam2List}
        editable={{
          type: 'multiple',
          editableKeys,
          actionRender: (row, config, defaultDoms) => {
            // return returnParam2List.length >= 2 ? [defaultDoms.delete] : [];
            return [defaultDoms.delete];
          },
          onChange: setEditableRowKeys,
        }}
      />
    </ProCard>
  )
}

export default SecondaryReturnParamList;
