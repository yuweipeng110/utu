import React from 'react';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { BranchStage } from '@/models/rule';
import '../../index.less';

export type GroupModalFormProps = {
  title: string;
  trigger: JSX.Element;
  onFinish: (values: any) => Promise<boolean>;
  initialValue?: BranchStage;
};

const GroupModalForm: React.FC<GroupModalFormProps> = (props) => {
  const { title, trigger, initialValue, onFinish } = props;

  return (
    <ModalForm title={title} trigger={trigger} onFinish={onFinish} initialValues={initialValue}>
      <ProFormText
        rules={[
          {
            required: true,
            message: '名称为必填项',
          },
        ]}
        name="name"
        label="名称"
      />
      <ProFormTextArea
        rules={[
          {
            required: true,
            message: '请输入描述',
          },
        ]}
        label="描述"
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

export default GroupModalForm;
