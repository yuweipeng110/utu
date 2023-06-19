import React, { useEffect, useState } from 'react';
import { Form, message } from 'antd';
import { InfoCircleTwoTone } from '@ant-design/icons';
import { ModalForm, ProFormRadio } from '@ant-design/pro-form';
import type { ExperimentInfo } from '@/models/experiment';
import { getPageQuery } from '@/utils/utils';
import { submitPublishOrder } from '@/services/publish';
import _ from 'lodash';

export type modalFormProps = {
  actionRef: any;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: Partial<ExperimentInfo>;
  createPublishResultSwitch: any;
};

type OptionType = {
  value: string;
  label: string;
};

const ExperimentMergeBranch: React.FC<modalFormProps> = (props) => {
  const { actionRef, visible, onVisibleChange, currentData,createPublishResultSwitch } = props;
  const [form] = Form.useForm();

  const queryParams = getPageQuery();
  const appId = queryParams.app_id;
  const sceneId = queryParams.scene_id;

  const [experimentGroupOptions, setExperimentGroupOptions] = useState<OptionType[]>([]);
  const [selectExperimentGroupOptions,setSelectExperimentGroupOptions] = useState<number | undefined>();

  const initFormRelation = () => {
    if (!_.isEmpty(currentData)) {
      let tmpSelect: number | undefined = undefined;
      const options: any = currentData.experimentGroups?.map((item: any) => {
        if(!tmpSelect && item.mark === 0) {
          tmpSelect = item.objId;
        }
        const groupMarkName = item.mark === 0 ? '实验组' : '对照组';
        return {
          value: item.objId,
          label: `【${item.name}】${groupMarkName}`,
          disabled: item.mark !== 0,
        };
      });
      setSelectExperimentGroupOptions(tmpSelect);
      setExperimentGroupOptions(options);
    }
  };

  useEffect(() => {
    if (visible) {
      initFormRelation();
    }
  }, [visible]);

  const onSubmit = async (values: any) => {
    const source = currentData.type === 0 ? 0 : 2;
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      appId,
      sceneId,
      source,
      id: currentData.id,
      branchId: values.branchId,
      action: 3,
    };
    const res = await submitPublishOrder(params);
    if (res.code !== 1) {
      message.destroy();
      createPublishResultSwitch(true,  res);
      return false;
    }
    message.destroy();
    createPublishResultSwitch(true,  res);
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
      title="合并"
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
      }}
      form={form}
      onFinish={onFinish}
    >
      <ProFormRadio.Group
        name="branchId"
        label="请选择需要合并的实验组"
        rules={[
          {
            required: true,
            message: '请选择需要合并的实验组!',
          },
        ]}
        tooltip={{
          title: '对照组分支不允许合并',
          icon: <InfoCircleTwoTone />,
        }}
        options={experimentGroupOptions}
        initialValue={selectExperimentGroupOptions}
      />
    </ModalForm>
  );
};

export default ExperimentMergeBranch;

