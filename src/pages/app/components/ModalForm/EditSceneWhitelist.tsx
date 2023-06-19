import React, { useEffect, useState } from 'react';
import { useRequest } from 'umi';
import { Form, message, Spin } from 'antd';
import type { AppInfo } from '@/models/app';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import _ from 'lodash';
import { addSceneWhitelist, getSceneLikeForQuery } from '@/services/app';

export type EditSceneWhitelistProps = {
  refreshCurrent: () => void;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentApp?: AppInfo;
  sceneWhitelist: string[];
};

export default (props: EditSceneWhitelistProps) => {
  const { refreshCurrent, currentApp, visible, onVisibleChange, sceneWhitelist } = props;
  const [form] = Form.useForm();
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sceneOptions, setSceneOptions] = useState([]);
  const initialValues = { sceneWhitelistList: sceneWhitelist };

  useEffect(() => {
    if (visible) {
      setInputValue('');
      setSceneOptions([]);
      sceneRun({
        appId: currentApp?.id,
      });
    }
  }, [visible]);

  const {
    loading: sceneLoading,
    run: sceneRun,
    cancel: sceneCancel,
  } = useRequest(getSceneLikeForQuery, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      const options = res.map((item: any) => {
        return {
          value: item,
          label: item,
        };
      });
      setSceneOptions(options);
    },
  });

  const handleSearchBucUser = (value: string) => {
    setInputValue(value);
    if (!value) return;
    setSceneOptions([]);
    sceneRun({
      appId: currentApp?.id,
      keywords: value,
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
      sceneWhitelistList: values.sceneWhitelistList,
    };
    const res = await addSceneWhitelist(params);
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
    refreshCurrent();
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
      initialValues={initialValues}
    >
      <Spin spinning={isLoading}>
        <ProFormText name="appId" initialValue={currentApp?.id} hidden />
        <ProFormSelect
          name="sceneWhitelistList"
          label="场景"
          mode="multiple"
          placeholder="请输入场景名称或场景code"
          showSearch
          options={sceneOptions}
          fieldProps={{
            showArrow: true,
            filterOption: false,
            searchValue: inputValue,
            onChange: handleChange,
            onSearch: (value) => handleSearchBucUser(value),
            onBlur: sceneCancel,
            loading: sceneLoading,
            notFoundContent: sceneLoading ? <Spin size="small" /> : null,
          }}
        />
      </Spin>
    </ModalForm>
  );
};
