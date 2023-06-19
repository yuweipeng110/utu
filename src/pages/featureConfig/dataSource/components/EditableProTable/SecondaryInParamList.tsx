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

type InParam2ListType = {
  inParam2List: DataSourceParamsType[];
  setInParam2List: (value: DataSourceParamsType[]) => void;
  isShowInParam2Alias: boolean;
  inParam2MetadataOptions: OptionType[];
  handleSearchMetadata: (value: string) => void;
  featureCancel: any;
  featureLoading: any;
}

const SecondaryInParamList: React.FC<InParam2ListType> = (props) => {
  const {
    inParam2List,
    setInParam2List,
    inParam2MetadataOptions,
    handleSearchMetadata,
    featureCancel,
    featureLoading
  } = props;
  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  const handleInParam2sMetadataSelect = (index: any, value: any, option?: any) => {
    // setInParam2List
    inParam2List[index].metadataId = value;
    inParam2List[index].englishLabel = option.label;
    inParam2List[index].alias = option.label;
    setInParam2List(_.sortBy(_.unionBy([...inParam2List], 'index'), 'index'));
  }

  const handleInParam2sMetadataText = (index: any, value: any) => {
    // setInParam2List
    inParam2List[index].alias = value;
    setInParam2List(_.sortBy(_.unionBy([...inParam2List], 'index'), 'index'));
  }

  const handleInParams2MetadataTextPrefix = (index: any, value: any) => {
    // setInParam2List
    inParam2List[index].prefixAlias = value;
    setInParam2List(_.sortBy(_.unionBy([...inParam2List], 'index'), 'index'));
  }

  const metadataSelect = (index: number, isItem: boolean) => {
    const selectValue = !isItem ? { value: inParam2List[Number(index)].metadataId } : {};
    return (
      <ProFormSelect
        label={false}
        width="sm"
        placeholder="请输入英文标示(key)"
        showSearch
        options={inParam2MetadataOptions}
        fieldProps={{
          showArrow: true,
          filterOption: false,
          onSearch: (value) => handleSearchMetadata(value),
          onBlur: featureCancel,
          onSelect: (value, option) => handleInParam2sMetadataSelect(index, value, option),
          loading: featureLoading,
          notFoundContent: featureLoading ? <Spin size="small"/> : <Empty/>,
          ...selectValue,
        }}
      />
    );
  }

  const metadataPrefixAliasText = (index: number) => {
    const initValue = { value: inParam2List[Number(index)].prefixAlias };
    return (
      <ProFormText
        label={false}
        width='xs'
        fieldProps={{
          onChange: (e) => {
            const { value } = e.target;
            handleInParams2MetadataTextPrefix(index, value);
          },
          ...initValue,
        }}
      />
    );
  }

  const inParamPrefixAliasColumns: ProColumns<DataSourceParamsType> = {
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
    const initValue = { value: inParam2List[Number(index)].alias };
    return (
      <ProFormText
        label={false}
        width='xs'
        fieldProps={{
          onChange: (e) => {
            const { value } = e.target;
            handleInParam2sMetadataText(index, value);
          },
          ...initValue,
        }}
      />
    );
  }

  const inParamAliasColumns: ProColumns<DataSourceParamsType> = {
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

  const inParam2Columns: ProColumns<DataSourceParamsType>[] = [
    inParamPrefixAliasColumns,
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
    inParamAliasColumns,
    {
      title: '操作',
      valueType: 'option',
      width: '10%',
      render: (text, record) => {
        const deleteBtn = <a
          key="delete"
          onClick={() => {
            setInParam2List(inParam2List.filter((item) => item.metadataId !== record.metadataId));
          }}
        >
          删除
        </a>
        return inParam2List.length > 1 ? [deleteBtn] : [];
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
        columns={inParam2Columns}
        value={inParam2List}
        onChange={setInParam2List}
        editable={{
          type: 'multiple',
          editableKeys,
          actionRender: (row, config, defaultDoms) => {
            // return inParam2List.length >= 2 ? [defaultDoms.delete] : [];
            return [defaultDoms.delete];
          },
          onChange: setEditableRowKeys,
        }}
      />
    </ProCard>
  )
}

export default SecondaryInParamList;
