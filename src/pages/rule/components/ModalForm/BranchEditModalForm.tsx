import React from 'react';
import { Form } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { BranchDetail } from '@/models/rule';
import '../../index.less';

export type modalFormProps = {
  title: string;
  trigger: JSX.Element;
  initialValue: BranchDetail;
  onFinish: (values: any) => Promise<boolean>;
};

const BranchModalForm: React.FC<modalFormProps> = (props) => {
  const { title, trigger, initialValue, onFinish } = props;
  const [form] = Form.useForm();

  return (
    <ModalForm
      title={title}
      trigger={trigger}
      modalProps={{
        forceRender: true,
      }}
      onVisibleChange={(visible) => {
        if (!visible) {
          form.resetFields();
        }
      }}
      form={form}
      onFinish={onFinish}
      initialValues={initialValue}
    >
      <ProFormText
        rules={[
          {
            required: true,
            message: '分支名称为必填项',
          },
        ]}
        name="branchName"
        label="分支名称"
        disabled
      />
      <ProFormTextArea
        rules={[
          {
            required: true,
            message: '请输入描述',
          },
        ]}
        label="描述"
        name="branchDescription"
      />
    </ModalForm>
  );
};

export default BranchModalForm;
