import React, { useEffect, useState } from 'react';
import { Button, Form, message } from 'antd';
import { InfoCircleTwoTone } from '@ant-design/icons';
import ProForm, { ModalForm, ProFormSelect, ProFormTextArea } from '@ant-design/pro-form';
import type { ExperimentInfo } from '@/models/experiment';
import { getPageQuery } from '@/utils/utils';
import { updateWhitelist, updateWhitelistAndSubmit } from '@/services/experiment';
import { ExperimentWhitelistType } from "@/consts/experiment/const";
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

const EditExperimentWhitelist: React.FC<modalFormProps> = (props) => {
  const { actionRef, visible, onVisibleChange, currentData, createPublishResultSwitch } = props;
  const initialValues = { ...currentData };
  const [form] = Form.useForm();

  const queryParams = getPageQuery();
  const appId = queryParams.app_id;
  const sceneId = queryParams.scene_id;

  const [groupNameOptions, setGroupNameOptions] = useState<OptionType[]>([]);

  const initFormRelation = () => {
    if (!_.isEmpty(currentData)) {
      const options: any = currentData.experimentGroups?.map((item: any) => {
        const groupMarkName = item.mark === 0 ? '实验组' : '对照组';
        return {
          value: item.name,
          label: `【${item.name}】${groupMarkName}`,
        };
      });
      setGroupNameOptions(options);
    }
  };

  useEffect(() => {
    if (visible) {
      initFormRelation();
    }
  }, [visible]);

  const handleSubmitRequest = async (values: any) => {
    const experimentId = currentData.id;
    const source = currentData.type === 0 ? 0 : 2;
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      appId,
      sceneId,
      experimentId,
      sourceGroupName: currentData.groupName || '',
      source,
    };
    const res = await updateWhitelistAndSubmit(params);
    if (res.code !== 1) {
      message.destroy();
      createPublishResultSwitch(true, res);
      return false;
    }
    message.destroy();
    createPublishResultSwitch(true, res);
    return true;
  };

  const onSubmit = async (values: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      appId,
      sceneId,
      experimentId: currentData.id,
      sourceGroupName: currentData.groupName || '',
    };
    const res = await updateWhitelist(params);
    if (res.code !== 1) {
      message.error({ content: `保存失败：${res.message}`, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功', key: loadingKey, duration: 2 });
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
      title="修改白名单"
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
      }}
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
      submitter={{
        searchConfig: {
          submitText: '保存',
          resetText: '取消',
        },
        render: (formProps, defaultDoms) => {
          if (currentData.publishStatus === 200) {
            return [
              <Button onClick={() => onVisibleChange(false)}>取消</Button>,
              <Button
                key="rest"
                type="primary"
                onClick={() => {
                  handleSubmitRequest(formProps.form?.getFieldsValue());
                }}
              >
                保存并提交
              </Button>
            ];
          }
          return [...defaultDoms];
        },
      }}
    >
      <ProForm.Group>
        <ProFormSelect name="groupName" label="选择实验组" width="md" options={groupNameOptions} />
        <ProFormSelect
          name="whitelistType"
          label="选择类型"
          width="md"
          options={Object.keys(ExperimentWhitelistType).map((key) => {
            return {
              value: Number(key),
              label: ExperimentWhitelistType[key],
            };
          })}
          initialValue={0}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormTextArea
          name="whitelistValues"
          label="白名单内容"
          width="xl"
          tooltip={{
            title: '请使用自定义分流id的值配置白名单，多个值之间用英文逗号","',
            icon: <InfoCircleTwoTone />,
          }}
        />
      </ProForm.Group>
    </ModalForm>
  );
};

export default EditExperimentWhitelist;
