import React from 'react';
import { connect } from 'umi';
import type { ConnectProps } from 'umi';
import { ConnectState } from '@/models/connect';
import { Button, Form, message } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { AppInfo } from '@/models/app';
import { PackageInfo } from '@/models/package';
import { addPackage } from '@/services/package';
import _ from 'lodash';

export type EditPackageProps = {
  actionRef: any;
  title: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData?: PackageInfo;
  isView?: boolean;
  loadPackageList?: any;
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const AddPackage: React.FC<EditPackageProps> = (props) => {
  const { actionRef, title, visible, onVisibleChange, currentData, isView, loadPackageList,currentApp } = props;
  const [form] = Form.useForm();
  const initialValues = !_.isEmpty(currentData) ? { ...currentData } : {};

  const onSubmit = async (values: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      appId: currentApp && currentApp.id,
    };
    const res = await addPackage(params);
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
      loadPackageList && loadPackageList();
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
      submitter={{
        render: (props, defaultDoms) => {
          return [
            isView ? (
              <Button key="close" onClick={() => onVisibleChange(false)}>
                关闭
              </Button>
            ) : (
              defaultDoms
            ),
          ];
        },
      }}
    >
      <ProFormText
        name="name"
        label="包名称"
        rules={[
          { required: true },
          {
            pattern: /^[a-zA-Z0-9_]+$/,
            message: '仅支持英文、数字、下划线',
          },
        ]}
        disabled={isView || currentData ? true : false}
      />
      <ProFormTextArea
        name="description"
        label="描述"
        rules={[
          {
            required: true,
            message: '描述为必填项',
          },
        ]}
        disabled={isView || currentData ? true : false}
      />
    </ModalForm>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
}))(AddPackage);
