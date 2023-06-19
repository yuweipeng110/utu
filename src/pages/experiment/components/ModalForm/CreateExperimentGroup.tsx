import React from 'react';
import { Form } from 'antd';
import { ModalForm, ProFormDigit, ProFormGroup, ProFormSelect } from '@ant-design/pro-form';
import type { ExperimentGroup } from '@/models/experiment';
import { ExperimentGroupRelationBranch } from "@/consts/experiment/const";

export type modalFormProps = {
  actionRef: any;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  experimentFlag: string;
  createEGList: Partial<ExperimentGroup[]>;
  setCreateEGList: any;
};

const CreateExperimentGroup: React.FC<modalFormProps> = (props) => {
  const { actionRef, visible, onVisibleChange, experimentFlag, createEGList, setCreateEGList } =
    props;
  const [form] = Form.useForm();

  const generateExperimentGroupList = (params: any) => {
    try {
      const { count, relationBranch } = params;
      const createEGListLength = createEGList.length;
      const date = new Date();
      const tmpExperimentGroupList: any = [];
      for (let i = 1; i <= count; i++) {
        const index = i + createEGListLength;
        const name = experimentFlag.length === 0 ? '' : `${experimentFlag}_${index}`;
        const experimentGroup = {
          index,
          name,
          relationBranch,
          mark: 0,
          flowRatio: 0,
          createTime: date.getTime(),
        };
        tmpExperimentGroupList.push(experimentGroup);
      }
      setCreateEGList(createEGList.concat(tmpExperimentGroupList));
      return true;
    } catch (e) {
      return false;
    }
  };

  const onSubmit = async (values: any) => {
    const params = {
      ...values,
    };
    return generateExperimentGroupList(params);
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
      title="新建实验组"
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
      }}
      form={form}
      onFinish={onFinish}
    >
      <ProFormGroup>
        <ProFormDigit
          name="count"
          label="实验组数量"
          width="md"
          rules={[
            {
              required: true,
              message: '实验组数量为必填项',
            },
          ]}
          min={1}
          max={10}
          initialValue={1}
          fieldProps={{
            autoFocus: true,
          }}
          disabled
        />
        <ProFormSelect
          name="relationBranch"
          label="关联分支内容"
          width="md"
          rules={[
            {
              required: true,
              message: '关联分支内容为必填项',
            },
          ]}
          options={Object.keys(ExperimentGroupRelationBranch).map((key) => {
            return {
              value: Number(key),
              label: ExperimentGroupRelationBranch[key],
            };
          })}
          initialValue={0}
        />
      </ProFormGroup>
    </ModalForm>
  );
};

export default CreateExperimentGroup;
