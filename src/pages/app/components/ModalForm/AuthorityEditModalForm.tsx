import React, { useEffect, useState } from 'react';
import { useRequest } from 'umi';
import { Form, message, Spin } from 'antd';
import type { AppInfo } from '@/models/app';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { editAuthority, queryBucUserList } from '@/services/app';
import _ from 'lodash';

export type modalFormProps = {
  actionRef: any;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: AppInfo;
};

type OptionType = {
  value: string;
  label: string;
};

const AuthorityModalForm: React.FC<modalFormProps> = (props) => {
  const { actionRef, currentData, visible, onVisibleChange } = props;
  const [form] = Form.useForm();
  const initialValues = !_.isEmpty(currentData)
    ? {
      ...currentData,
      appId: currentData.id,
      emps: currentData.emps.map((item) => `${item.empId}-${item.empName}`),
    }
    : {};
  const [bucUserOptions, setBucUserOptions] = useState<OptionType[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    if (visible) {
      setInputValue('');
      setBucUserOptions([]);
    }
  }, [visible]);

  const { loading, run, cancel } = useRequest(queryBucUserList, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      const uniqData = _.uniqBy(_.concat(currentData.emps, res.data), 'empId');
      const options = uniqData.map((item) => {
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
    run({
      searchParam: value,
    });
  };

  const handleChange = () => {
    setInputValue('');
  }

  const onSubmit = async (values: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      emps: values.emps.map((item: any) => {
        const emp = item.split('-');
        return {
          empId: emp[0],
          empName: emp[1],
        };
      }),
    };
    const res = await editAuthority(params);
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
      title="权限编辑"
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
      }}
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <ProFormText name="appId" hidden />
      <ProFormSelect
        name="emps"
        label="管理员权限人员"
        mode="multiple"
        placeholder="请输入工号或姓名"
        showSearch
        options={bucUserOptions}
        rules={[
          {
            required: true,
            message: '管理员权限人员为必填项',
          },
        ]}
        fieldProps={{
          showArrow: true,
          filterOption: false,
          searchValue: inputValue,
          onChange: (event) => handleChange(),
          onSearch: (value) => handleSearchBucUser(value),
          onBlur: cancel,
          loading,
          notFoundContent: loading ? <Spin size="small" /> : null,
        }}
      />
    </ModalForm>
  );
};

export default AuthorityModalForm;
