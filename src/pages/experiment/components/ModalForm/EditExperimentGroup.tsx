import React, { useEffect, useState } from 'react';
import { Col, Form, InputNumber, Row } from 'antd';
import {
  ModalForm,
  ProFormGroup,
  ProFormSelect,
  ProFormSlider,
  ProFormText,
} from '@ant-design/pro-form';
import { InfoCircleTwoTone } from '@ant-design/icons';
import type { ExperimentGroup } from '@/models/experiment';
import { ExperimentGroupRelationBranch } from "@/consts/experiment/const";
import _ from 'lodash';

export type modalFormProps = {
  actionRef: any;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: Partial<ExperimentGroup>;
  handleEditCurrentEGInfo: any;
  flowRatioMax: number;
};

const EditExperimentGroup: React.FC<modalFormProps> = (props) => {
  const {
    actionRef,
    visible,
    onVisibleChange,
    currentData,
    handleEditCurrentEGInfo,
    flowRatioMax,
  } = props;
  const initialValues = { ...currentData };
  const [form] = Form.useForm();

  const [flowRatioVal, setFlowRatioVal] = useState<number>(0);

  const marks = {
    0: '0%',
    10: '10%',
    20: '20%',
    30: '30%',
    40: '40%',
    50: '50%',
    60: '60%',
    70: '70%',
    80: '80%',
    90: '90%',
    100: '100%',
  };

  const initStateProcess = () => {
    if (!_.isEmpty(currentData)) {
      setFlowRatioVal(currentData.flowRatio as number);
    }
  };

  useEffect(() => {
    if (visible) {
      initStateProcess();
    }
  }, [visible]);

  const onSubmit = async (values: any) => {
    const newData = {
      ...values,
      flowRatio: flowRatioVal,
    };
    return handleEditCurrentEGInfo(currentData, newData);
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
      title="修改实验组"
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
      }}
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <ProFormGroup>
        <ProFormText
          name="name"
          label="实验组名称"
          width="md"
          rules={[
            {
              required: true,
              message: '实验组名称为必填项',
            },
          ]}
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
      <Row>
        <Col span={18}>
          <ProFormSlider
            name="flowRatio"
            label="实验组流量"
            tooltip={{
              title: '该场景下的流量占比',
              icon: <InfoCircleTwoTone />,
            }}
            min={0}
            max={flowRatioMax}
            step={1}
            marks={marks}
            fieldProps={{
              tooltipVisible: false,
              tipFormatter: (value) => {
                return `${value}%`;
              },
              onChange: (value) => setFlowRatioVal(value),
              value: flowRatioVal,
            }}
          />
        </Col>
        <Col span={2}>
          <InputNumber
            className="ant-input-number-large"
            min={0}
            max={flowRatioMax}
            size="large"
            value={flowRatioVal}
            step={1}
            onChange={(value) => setFlowRatioVal(value)}
            formatter={(value) => `${value}%`}
            parser={(value: any) => value?.replace('%', '')}
          />
        </Col>
      </Row>
    </ModalForm>
  );
};

export default EditExperimentGroup;
