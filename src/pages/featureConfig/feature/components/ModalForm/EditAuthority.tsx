import React, { useEffect, useState } from 'react';
import { useRequest } from 'umi';
import { Form, message, Spin } from 'antd';
import type { AppInfo } from '@/models/app';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { queryBucUserList } from '@/services/app';
import { getFeatureWhitelist, addFeatureWhitelist } from '@/services/featureConfig';
import _ from 'lodash';

export type EditAuthorityProps = {
  actionRef: any;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentApp?: AppInfo;
};

type OptionType = {
  value: string;
  label: string;
};

const EditAuthority: React.FC<EditAuthorityProps> = (props) => {
  const { actionRef, currentApp, visible, onVisibleChange } = props;
  const [form] = Form.useForm();
  const [bucUserOptions, setBucUserOptions] = useState<OptionType[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initFeatureWhitelist = async () => {
    setIsLoading(true);
    const res = await getFeatureWhitelist({
      appId: currentApp?.id,
    });
    setIsLoading(false);
    form.setFieldsValue({'featureWhitelistList' :res.data || [] })
  };

  useEffect(() => {
    if (visible) {
      setInputValue('');
      setBucUserOptions([]);
      initFeatureWhitelist();
    }
  }, [visible]);

  const {
    loading: bucLoading,
    run: bucRun,
    cancel: bucCancel,
  } = useRequest(queryBucUserList, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      const options = res.data.map((item: any) => {
        return {
          value: `${item.empId}-${item.empName}`,
          label: `${item.empId}-${item.empName}`,
        };
      });
      setBucUserOptions(options);
    },
  });
  const handleSearchBucUser = (value: string) => {
    setInputValue(value);
    if (!value) return;
    setBucUserOptions([]);
    bucRun({
      searchParam: value,
    });
  };

  const handleChange = () => {
    setInputValue('');
  };

  const onSubmit = async (values: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      featureWhitelistList: values.featureWhitelistList,
    };
    const res = await addFeatureWhitelist(params);
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
      title="白名单"
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
      }}
      form={form}
      onFinish={onFinish}
    >
      <Spin spinning={isLoading}>
        <ProFormText name="appId" initialValue={currentApp?.id} hidden />
        <ProFormSelect
          name="featureWhitelistList"
          label="白名单人员"
          mode="multiple"
          placeholder="请输入工号或姓名"
          showSearch
          options={bucUserOptions}
          fieldProps={{
            showArrow: true,
            filterOption: false,
            searchValue: inputValue,
            onChange: handleChange,
            onSearch: (value) => handleSearchBucUser(value),
            onBlur: bucCancel,
            loading: bucLoading,
            notFoundContent: bucLoading ? <Spin size="small" /> : null,
          }}
        />
      </Spin>
    </ModalForm>
  );
};

export default EditAuthority;
