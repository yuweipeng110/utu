import React from 'react';
import { Form } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import '../../index.less';
import type { BranchStage } from '@/models/rule';

export type modalFormProps = {
  title: string;
  trigger: any;
  onFinish: (values: any) => Promise<boolean>;
  initialValue?: BranchStage;
};

const ItemModalForm: React.FC<modalFormProps> = (props) => {
  const { title, trigger, onFinish, initialValue } = props;
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
      <ProFormTextArea
        rules={[
          {
            required: true,
            message: '请输入描述',
          },
        ]}
        label="规则描述"
        name="desc"
      />
      <ProFormText
        rules={[
          {
            required: true,
            message: '优先级',
          },
        ]}
        name="priority"
        label="优先级"
        initialValue={1}
        hidden={true}
      />
      <ProFormText
        rules={[
          {
            required: true,
            message: '执行方式',
          },
        ]}
        name="executor"
        label="执行方式"
        initialValue="SequentialExecutor"
        hidden={true}
      />
    </ModalForm>

  );
};

export default ItemModalForm;
