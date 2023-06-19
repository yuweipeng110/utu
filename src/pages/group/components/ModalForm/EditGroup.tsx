import React from 'react';
import { connect } from 'umi';
import type { ConnectProps, Dispatch } from 'umi';
import type { ConnectState } from '@/models/connect';
import { Form, message } from 'antd';
import ProForm, { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { addGroup, editGroup } from '@/services/group';
import { GroupInfo } from '@/models/group';
import _ from 'lodash';

export type EditGroupProps = {
  actionRef: any;
  title: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData?: GroupInfo;
  currentGroup?: GroupInfo;
  dispatch: Dispatch;
} & Partial<ConnectProps>;

const EditGroup: React.FC<EditGroupProps> = (props) => {
  const {
    actionRef,
    title,
    visible,
    onVisibleChange,
    currentData,
    currentGroup,
    dispatch,
  } = props;
  const [form] = Form.useForm();
  const initialValues = !_.isEmpty(currentData) ? { ...currentData } : {};

  const handleCurrentGroup = (groupId: number,values: any) => {
    if (currentGroup?.groupId === groupId) {
      dispatch({
        type: 'app/selectGroup',
        payload: {
          ...currentData,
          ...values,
          groupId,
        },
      });
    }
  };

  const onSubmit = async (values: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      groupId: currentData && currentData.groupId,
      ...values,
    };
    const res = !currentData ? await addGroup(params) : await editGroup(params);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功!', key: loadingKey, duration: 2 });
    handleCurrentGroup(currentData?.groupId as number,values);
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
    >
      <ProForm.Group>
        <ProFormText
          name="groupCode"
          label="GROUP Code"
          width="md"
          rules={[
            { required: true },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message: '仅支持英文、数字、下划线',
            },
          ]}
        />
      </ProForm.Group>
      <ProFormTextArea
        name="groupDesc"
        label="描述"
        rules={[
          {
            required: true,
          },
        ]}
      />
    </ModalForm>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentGroup: app.currentGroup,
  currentApp: app.currentApp,
}))(EditGroup);
