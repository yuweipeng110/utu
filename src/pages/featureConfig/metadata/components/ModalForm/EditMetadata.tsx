import React, { useEffect, useState } from 'react';
import { useRequest } from "umi";
import { Empty, Form, message, Spin } from 'antd';
import ProForm, { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { MetadataInfo } from "@/models/featureConfig";
import { addMetadata, editMetadata, queryDataSourceList } from "@/services/featureConfig";
import { FeatureDataType, FeatureType } from "@/consts/const";

type OptionType = {
  value: number;
  label: string;
}

export type EditMetadataProps = {
  actionRef: any;
  title: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: MetadataInfo;
};

const EditMetadata: React.FC<EditMetadataProps> = (props) => {
  const { actionRef, title, visible, onVisibleChange, currentData } = props;
  const initialValues = { ...currentData };
  const [form] = Form.useForm();
  const [relyTypeValue, setRelyTypeValue] = useState<number>();
  const [sourceTypeValue, setSourceTypeValueValue] = useState<number>();
  const [dataSourceOptions, setDataSourceOptions] = useState<OptionType[]>([]);

  const loadDataSourceListData = async () => {
    const params = {
      pageSize: 10
    };
    const res = await queryDataSourceList(params);
    if (res && res.data && res.data.length > 0) {
      const options = res.data.map((item: any) => {
        return {
          value: item.id,
          label: `${item.name}`,
        };
      });
      setDataSourceOptions(options);
    }
  }

  const { loading: dataSourceLoading, run: dataSourceRun, cancel: dataSourceCancel } = useRequest(queryDataSourceList, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      const options = res.data.map((item: any) => {
        return {
          value: item.id,
          label: `${item.name}`,
        };
      });
      setDataSourceOptions(options);
    },
  });

  const handleSearchDataSource = (value: string) => {
    if (value.length === 0) return;
    setDataSourceOptions([]);
    dataSourceRun({
      pageSize: 10,
      searchValue: value,
    });
  };

  const handleFormChangeValue = () => {
    const relyType = form.getFieldValue('relyType');
    const sourceId = form.getFieldValue('sourceId');
    setRelyTypeValue(relyType);
    setSourceTypeValueValue(sourceId);
  }

  useEffect(() => {
    if (visible) {
      loadDataSourceListData();
      handleFormChangeValue();
    }
  }, [visible]);

  const renderSourcePredefineContent = () => {
    if (sourceTypeValue === 1) {
      return <ProFormText
        name="initValue"
        label="初始值"
        width="md"
        rules={[
          {
            required: true,
            message: '初始值为必填项',
          },
        ]}
      />
    }
    return <></>
  }

  const renderRelyTypeContent = () => {
    if (relyTypeValue === 1) {
      return <ProFormTextArea
          name="valueRange"
          label="取值范围 (请用,分割)"
          tooltip="请用,分割"
        />
    }
    if (relyTypeValue === 2) {
      return <ProForm.Group>
        <ProFormSelect
          name="sourceId"
          label="来源"
          width="md"
          placeholder="请输入来源关键字"
          rules={[
            {
              required: true,
              message: '来源为必填项',
            },
          ]}
          showSearch
          options={dataSourceOptions}
          fieldProps={{
            showArrow: true,
            filterOption: false,
            onSearch: (value) => handleSearchDataSource(value),
            onBlur: dataSourceCancel,
            loading: dataSourceLoading,
            notFoundContent: dataSourceLoading ? <Spin size="small"/> : <Empty/>,
          }}
        />
        {
          renderSourcePredefineContent()
        }
      </ProForm.Group>
    }
    return <></>;
  }

  const onSubmit = async (values: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
    };
    let res;
    if (!currentData) {
      res = await addMetadata(params);
    } else {
      res = await editMetadata(params);
    }
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功!', key: loadingKey, duration: 2 });
    return true;
  };

  const onFinish = async (values: any) => {
    const success = await onSubmit(values);
    if (!success) {
      return false;
    }
    onVisibleChange(false);
    if (actionRef.current) {
      actionRef.current.reload();
    }
    return true;
  };

  return (
    <ModalForm
      title={title}
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
      }}
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
      onValuesChange={handleFormChangeValue}
    >
      <ProFormText name="id" hidden/>
      <ProForm.Group>
        <ProFormText
          name="name"
          label="中文名称"
          width="md"
          rules={[
            {
              required: true,
              message: '中文名称为必填项',
            },
          ]}
        />
        <ProFormText
          name="englishLabel"
          label="英文标示(key)"
          width="md"
          rules={[
            {
              required: true,
              message: '英文标示(key)为必填项',
            },
          ]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSelect
          name='type'
          label="数据类型"
          width="md"
          rules={[
            {
              required: true,
              message: '类型为必填项',
            },
          ]}
          options={Object.keys(FeatureDataType).map((key) => {
            return {
              value: Number(key),
              label: FeatureDataType[key],
            };
          })}
        />
        <ProFormSelect
          name='relyType'
          label="特征类型"
          width="md"
          rules={[
            {
              required: true,
              message: '元类型为必填项',
            },
          ]}
          options={Object.keys(FeatureType).map((key) => {
            return {
              value: Number(key),
              label: FeatureType[key],
            };
          })}
        />
      </ProForm.Group>
      {
        renderRelyTypeContent()
      }
    </ModalForm>
  );
}

export default EditMetadata;
