import React, { useEffect, useState } from 'react';
import { connect } from 'umi';
import { Form, message, Row, Col, InputNumber, Spin } from 'antd';
import ProForm, {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormSlider,
} from '@ant-design/pro-form';
import { InfoCircleTwoTone } from '@ant-design/icons';
import type { AppInfo, AppScene } from '@/models/app';
import { addScene, editScene } from '@/services/app';
import { addMasterRuleBranch } from '@/services/rule';
import { formatString, validateString } from '@/utils/tomlUtils';
import { ConnectState } from '@/models/connect';
import type { JsonMap } from '@iarna/toml';
import TOML from '@iarna/toml';
import { SceneDiversionType } from '@/consts/scene/const';
import _ from 'lodash';
import '../../index.less';

export type EidtSceneProps = {
  refreshCurrent: () => void;
  title: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: AppScene;
  setInitMaster: any;
  handleInitMasterResultModalVisible: any;
  currentApp?: AppInfo;
};

const EidtScene: React.FC<EidtSceneProps> = (props) => {
  const {
    refreshCurrent,
    title,
    visible,
    onVisibleChange,
    currentData,
    setInitMaster,
    handleInitMasterResultModalVisible,
    currentApp,
  } = props;
  const [form] = Form.useForm();
  const initialValues = !_.isEmpty(currentData) ? { ...currentData } : { diversionType: 0 };

  const [loading, setLoading] = useState(false);
  const [formCheck, setFormCheck] = useState<boolean>(false);
  const [maxFlowRatioVal, setMaxFlowRatioVal] = useState<number>(100);

  useEffect(() => {
    if (visible) {
      if (!_.isEmpty(currentData)) {
        setMaxFlowRatioVal(currentData.maxFlowRatio);
      } else {
        setMaxFlowRatioVal(100);
      }
    }
  }, [visible]);

  const initMasterProcess = async (values: any) => {
    if (values.isInitMaster) {
      let res: any;
      const sourceCode =
        '[[stages]]\nname = "stage-1"\ndesc = "阶段-1"\npriority = 1\nexecutor = "SequentialExecutor"\n\n  [[stages.rules]]\n  name = "rule-1"\n  desc = "规则-1"\n  priority = 1\n  executor = "SequentialExecutor"\n  exec = """\n\n\n\n\n\n"""\n';
      res = validateString(sourceCode);
      if (res.code !== 1) {
        message.error(res.message);
        return res;
      }
      const content = TOML.stringify(formatString(sourceCode).data as JsonMap);

      const { sceneId } = values;
      const params = {
        appId: currentApp && currentApp.id,
        sceneId,
        ruleContent: content,
      };
      res = await addMasterRuleBranch(params);
      if (res.code !== 1) {
        message.error(res.message);
        return false;
      }
      const { branchId } = res.data;
      const initMasterObj = {
        ...params,
        branchId,
      };
      setInitMaster(initMasterObj);
      handleInitMasterResultModalVisible(true);
      return true;
    }
    return false;
  };

  const onSubmit = async (values: any) => {
    if (!formCheck) {
      return false;
    }
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      sceneId: currentData && currentData.sceneId,
      appId: currentApp && currentApp.id,
      isInitMaster: true,
      surplusFlowRatio: maxFlowRatioVal,
      maxFlowRatio: maxFlowRatioVal,
    };
    setLoading(true);
    // const res = await addScene(params);
    const res = !currentData ? await addScene(params) : await editScene(params);
    if (res.code !== 1) {
      setLoading(false);
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    _.isEmpty(currentData) && (await initMasterProcess({ ...params, sceneId: res.data.sceneId }));
    setLoading(false);
    message.success({ content: '保存成功!', key: loadingKey, duration: 2 });
    return true;
  };

  const onFinish = async (values: any) => {
    const success = await onSubmit(values);
    if (!success) {
      return false;
    }
    onVisibleChange(false);
    refreshCurrent();
    return true;
  };

  const handleFormChangeValue = () => {
    const sceneCode = form.getFieldValue('sceneCode') ?? '';
    if (sceneCode.length > 0) {
      const reg = /^[A-Za-z0-9-_.]+$/;
      const sceneCodeError =
        reg.exec(sceneCode) !== null
          ? {}
          : {
              name: 'sceneCode',
              errors: ['仅支持英文、数字、中横线、下划线、点'],
            };
      const errorList = [sceneCodeError];
      // @ts-ignore
      form.setFields(errorList);
      setFormCheck(_.isEmpty(errorList[0]));
    }
  };

  return (
    <Spin spinning={loading} size="large">
      <ModalForm
        title={title}
        visible={visible}
        onVisibleChange={(visibleValue) => {
          form.resetFields();
          onVisibleChange(visibleValue);
        }}
        form={form}
        onFinish={onFinish}
        onFieldsChange={handleFormChangeValue}
        initialValues={initialValues}
      >
        <ProForm.Group>
          <ProFormText
            name="sceneCode"
            label="场景Code"
            width="md"
            rules={[
              {
                required: true,
                message: '场景Code为必填项',
              },
            ]}
            tooltip={{
              title: '仅支持英文、数字、中横线、下划线、点',
              icon: <InfoCircleTwoTone />,
            }}
            disabled={!_.isEmpty(currentData)}
          />
          <ProFormText
            name="sceneName"
            label="场景Name"
            width="md"
            rules={[
              {
                required: true,
                message: '场景Name为必填项',
              },
            ]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormSelect
            name="diversionType"
            label="分流策略"
            width="md"
            rules={[
              {
                required: true,
                message: '分流策略为必填项',
              },
            ]}
            options={Object.keys(SceneDiversionType).map((key) => {
              let obj = {
                value: Number(key),
                label: SceneDiversionType[key],
                disabled: false,
              };
              if (Number(key) === 1) {
                obj.disabled = true;
              }
              return obj;
            })}
            tooltip={{ title: 'Mod(Hash(分流ID),1000)', icon: <InfoCircleTwoTone /> }}
          />
          <ProFormText
            name="diversionId"
            label="分流ID"
            width="md"
            placeholder="默认为随机数"
            tooltip={{
              title:
                '分流ID默认为随机数(32位字符串)，以保证分流随机性；如业务有自定义ID需求，请输入自定义分流特征，并将此特征注入到引擎SDK',
              icon: <InfoCircleTwoTone />,
            }}
            rules={[
              {
                validator: (rule: any, value: any) => {
                  if (!value) {
                    return Promise.resolve();
                  }
                  const reg = /^[a-zA-Z0-9_]+$/;
                  return reg.exec(value) === null
                    ? Promise.reject(new Error('仅支持英文、数字、下划线'))
                    : Promise.resolve();
                },
              },
            ]}
          />
        </ProForm.Group>
        <Row>
          <Col span={20}>
            <ProFormSlider
              name="maxFlowRatio"
              label="实验流量阈值"
              marks={{
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
              }}
              min={10}
              step={10}
              fieldProps={{
                tooltipVisible: false,
                onChange: (value) => {
                  setMaxFlowRatioVal(value);
                },
                value: typeof maxFlowRatioVal === 'number' ? maxFlowRatioVal : 10,
              }}
            />
          </Col>
          <Col span={2}>
              <InputNumber
                className="my-ant-input-number"
                min={10}
                max={100}
                step={10}
                value={maxFlowRatioVal}
                onChange={(value) => {
                  setMaxFlowRatioVal(value);
                }}
                formatter={(value) => `${value}%`}
                // @ts-ignore
                parser={(value) => value?.replace('%', '')}
              />
          </Col>
        </Row>
      </ModalForm>
    </Spin>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
}))(EidtScene);
