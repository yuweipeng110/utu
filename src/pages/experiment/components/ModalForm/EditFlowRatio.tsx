import React, { useEffect, useMemo, useState } from 'react';
import { history } from 'umi';
import { Button, Col, Form, InputNumber, List, message, Row, Slider, Typography } from 'antd';
import ProForm, { ModalForm, ProFormSlider, ProFormText } from '@ant-design/pro-form';
import type { ExperimentInfo } from '@/models/experiment';
import type { AppScene } from '@/models/app';
import { getPageQuery } from '@/utils/utils';
import ProList from '@ant-design/pro-list';
import ProCard from '@ant-design/pro-card';
import { ExperimentGroupMark } from '@/consts/experiment/const';
import {
  getSurplusFlowRatio,
  updateFlowRatio,
  updateFlowRatioAndSubmit,
} from '@/services/experiment';
import type { ExperimentGroup } from '@/models/experiment';
import '../../index.less';
import _ from 'lodash';

const { Paragraph } = Typography;

export type modalFormProps = {
  actionRef: any;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: Partial<ExperimentInfo>;
  createPublishResultSwitch: any;
};

const EditFlowRatio: React.FC<modalFormProps> = (props) => {
  const { actionRef, visible, onVisibleChange, currentData, createPublishResultSwitch } = props;
  const initialValues = { ...currentData };
  const [form] = Form.useForm();

  const queryParams = getPageQuery();
  const appId = queryParams.app_id;
  const sceneId = queryParams.scene_id;

  // 页面初始化时需要load所需数据
  const [currentSceneInfo, setCurrentSceneInfo] = useState<AppScene>(Object.create(null));
  const [sceneSurplusFlowRatio, setSceneSurplusFlowRatio] = useState<number>(0);
  const [flowRatioVal, setFlowRatioVal] = useState<number>(0);
  const [marks, setMarks] = useState();
  const [createEGList, setCreateEGList] = useState<Partial<ExperimentGroup[]>>([]);
  const typeVal = currentData.type;

  const loadSurplusFlowRatio = async () => {
    const params = {
      appId,
      sceneId,
    };
    const res = await getSurplusFlowRatio(params);
    if (res.code && res.code === -1) {
      history.push('/error');
      return;
    }
    setCurrentSceneInfo(res.data);
  };

  const initFormRelation = () => {
    if (!_.isEmpty(currentData)) {
      const experimentGroupList: any = currentData?.experimentGroups?.map(
        (item: any, index: number) => {
          item.index = index;
          return item;
        },
      );

      setFlowRatioVal(currentData.flowRatio as number);
      setCreateEGList(experimentGroupList);
    }
  };

  const refreshCurrent = async () => {
    await loadSurplusFlowRatio();
    initFormRelation();
  };

  useEffect(() => {
    if (visible) {
      refreshCurrent();
    }
  }, [visible]);

  useMemo(() => {
    let max: number = 0;
    if (currentData.publishStatus === 0) {
      max = typeVal === 1 ? 100 : currentSceneInfo.surplusFlowRatio;
    } else if (currentData.publishStatus === 200) {
      max = typeVal === 1 ? 100 : currentSceneInfo.surplusFlowRatio + currentData.flowRatio;
    }
    setSceneSurplusFlowRatio(max);
  }, [currentSceneInfo]);

  useMemo(() => {
    let max: number;
    if (typeVal === 1) {
      max = 100;
      setFlowRatioVal(max);
    } else {
      max = sceneSurplusFlowRatio;
    }
    const tmpMarks: any = {};
    for (let i = 0; i <= max; i += 10) {
      if (i <= 100) tmpMarks[i] = `${i}%`;
    }
    setMarks(tmpMarks);
  }, [sceneSurplusFlowRatio]);

  const handleEditCurrentEGInfo = (currentEGData: any, newEGData: any) => {
    try {
      const obj = currentEGData;
      obj.name = newEGData.name;
      obj.relationBranch = newEGData.relationBranch;
      obj.flowRatio = newEGData.flowRatio;
      obj.name = newEGData.name;
      const list = _.unionBy([obj], createEGList, 'index');
      const sortList = _.sortBy(list, (item) => item.index);
      setCreateEGList(sortList);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmitRequest = async (values: any) => {
    const experimentId = currentData.id;
    const source = currentData.type === 0 ? 0 : 2;
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      appId,
      sceneId,
      id: currentData.id,
      type: currentData.type,
      flowRatio: flowRatioVal,
      experimentGroups: createEGList,
      source,
    };
    const res = await updateFlowRatioAndSubmit(params);
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
      id: currentData.id,
      type: currentData.type,
      flowRatio: flowRatioVal,
      experimentGroups: createEGList,
    };
    const res = await updateFlowRatio(params);
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
      title="修改流量"
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
      }}
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
      width="80%"
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
              </Button>,
            ];
          }
          return [...defaultDoms];
        },
      }}
    >
      <ProForm.Group>
        <ProFormText name="name" label="实验名称" width="md" disabled={true} />
      </ProForm.Group>
      <Row>
        <Col span={20}>
          <ProFormSlider
            name="flowRatio"
            label="实验流量"
            min={0}
            max={sceneSurplusFlowRatio}
            marks={marks}
            fieldProps={{
              tipFormatter: (value) => {
                return `${value}%`;
              },
              onChange: (value) => {
                if (typeVal === 0) {
                  setFlowRatioVal(value);
                }
              },
              value: flowRatioVal,
            }}
          />
        </Col>
        <Col span={2}>
          <InputNumber
            min={0}
            max={sceneSurplusFlowRatio}
            className="ant-input-number-large"
            size="large"
            value={flowRatioVal}
            onChange={(value) => {
              if (typeVal === 0) {
                setFlowRatioVal(value);
              }
            }}
            formatter={(value) => `${value}%`}
            parser={(value: any) => value?.replace('%', '')}
          />
        </Col>
      </Row>
      <ProCard title="实验组" ghost gutter={8} collapsible headerBordered>
        <div className="cardList">
          <ProList
            headerTitle={false}
            actionRef={actionRef}
            rowKey="id"
            grid={{ column: 3, gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
            dataSource={createEGList}
            renderItem={(item: any, index) => {
              if (item && item.createTime) {
                const groupMarkName = ExperimentGroupMark[item.mark];
                const groupMarkClass =
                  item.mark === 0 ? 'card experiment-card' : 'card contrast-card';
                return (
                  <List.Item key={index}>
                    <ProCard
                      title={`【${item.name}】${groupMarkName}`}
                      hoverable
                      bordered
                      className={groupMarkClass}
                    >
                      <Paragraph className="item">
                        <ul>
                          <li>
                            实验组名称：{item.name} {item.flowRatio}
                          </li>
                          <li>实验组标记：{ExperimentGroupMark[item.mark]}</li>
                          <li>
                            流量配比：
                            <Row>
                              <Col span={18}>
                                <Slider
                                  min={0}
                                  max={sceneSurplusFlowRatio}
                                  value={item.flowRatio}
                                  tipFormatter={(value) => `${value}%`}
                                  onChange={(value) => {
                                    handleEditCurrentEGInfo(item, {
                                      ...item,
                                      flowRatio: value,
                                    });
                                  }}
                                />
                              </Col>
                              <Col span={2}>
                                <InputNumber
                                  min={0}
                                  max={sceneSurplusFlowRatio}
                                  value={item.flowRatio}
                                  onChange={(value) => {
                                    handleEditCurrentEGInfo(item, {
                                      ...item,
                                      flowRatio: value,
                                    });
                                  }}
                                  formatter={(value) => `${value}%`}
                                  parser={(value: any) => value?.replace('%', '')}
                                />
                              </Col>
                            </Row>
                          </li>
                        </ul>
                      </Paragraph>
                    </ProCard>
                  </List.Item>
                );
              }
            }}
          />
        </div>
      </ProCard>
    </ModalForm>
  );
};

export default EditFlowRatio;
