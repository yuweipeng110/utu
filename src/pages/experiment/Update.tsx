import React, { useEffect, useMemo, useRef, useState } from 'react';
import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import ProForm, {
  ProFormText,
  ProFormSelect,
  ProFormSlider,
  ProFormTextArea,
} from '@ant-design/pro-form';
import type { ActionType } from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';
import ProList from '@ant-design/pro-list';
import {
  Space,
  Button,
  Form,
  message,
  List,
  Typography,
  Slider,
  Row,
  Col,
  InputNumber,
  Tooltip,
  Spin,
  Popconfirm,
} from 'antd';
import { DeleteOutlined, EditOutlined, InfoCircleTwoTone, PlusOutlined } from '@ant-design/icons';
import {
  addExperiment,
  getExperimentDetail,
  getSurplusFlowRatio,
  updateExperiment,
} from '@/services/experiment';
import { submitPublishOrder } from '@/services/publish';
import type { AppScene } from '@/models/app';
import type { ExperimentGroup, ExperimentInfo } from '@/models/experiment';
import { getPageQuery } from '@/utils/utils';
import CreateExperimentGroup from '@/pages/experiment/components/ModalForm/CreateExperimentGroup';
import EditExperimentGroup from '@/pages/experiment/components/ModalForm/EditExperimentGroup';
import ExperimentMergeBranch from '@/pages/experiment/components/ModalForm/ExperimentMergeBranch';
import CreatePublishResult from '@/pages/publish/components/Modal/CreatePublishResult';
import {
  ExperimentGroupMark,
  ExperimentStatus,
  ExperimentType,
  ExperimentWhitelistType,
} from '@/consts/experiment/const';
import './index.less';
import _ from 'lodash';

const { Paragraph } = Typography;

const nullData: Partial<ExperimentGroup> = {};

type OptionType = {
  value: string;
  label: string;
};

const UpdateView: React.FC = () => {
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();

  const queryParams = getPageQuery();
  const experimentId = queryParams['id'];
  const appId = queryParams['app_id'];
  const sceneId = queryParams['scene_id'];
  const isEdit = queryParams['is_edit'];

  // 页面初始化时需要load所需数据
  const [currentSceneInfo, setCurrentSceneInfo] = useState<AppScene>(Object.create(null));
  const [sceneSurplusFlowRatio, setSceneSurplusFlowRatio] = useState<number>(0);
  // 新建实验相关state
  const [typeVal, setTypeVal] = useState<number>(0);
  const [flowRatioVal, setFlowRatioVal] = useState<number>(0);
  const [marks, setMarks] = useState();
  // 新建实验组弹框相关state
  const [createEGModalVisible, setCreateEGModalVisible] = useState<boolean>(false);
  const [createEGList, setCreateEGList] = useState<Partial<ExperimentGroup[]>>([]);
  // 白名单相关state
  const [groupNameOptions, setGroupNameOptions] = useState<OptionType[]>([]);
  // const [experimentFlag, setExperimentFlag] = useState<string>('');
  // 修改实验组弹框相关state
  const [editEGModalVisible, setEditEGModalVisible] = useState<boolean>(false);
  const [currentEGInfo, setCurrentEGInfo] = useState<Partial<ExperimentGroup>>(Object.create(null));
  // 修改实验相关state
  const [loading, setLoading] = useState<boolean>(false);
  const [experimentInfo, setExperimentInfo] = useState<Partial<ExperimentInfo>>(Object.create(null));
  // 合并Modal相关state
  const [mergeExperimentModalVisible, setMergeExperimentModalVisible] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<Partial<ExperimentGroup>>(Object.create(null));
  // 提交发布单反馈state
  const [createPublishResultModalVisible, setCreatePublishResultModalVisible] =
    useState<boolean>(false);
  const [apiResult, setApiResult] = useState(Object.create(null));
  const source = typeVal === 0 ? 0 : 2;
  const flowRatioMax = typeVal === 0 ? sceneSurplusFlowRatio : 100;
  const pageType = _.isEmpty(experimentId) ? 'create' : _.isEmpty(isEdit) ? 'detail' : 'update';
  const firstEG: any = {
    index: 0,
    name: '',
    relationBranch: 0,
    mark: 1,
    flowRatio: 0,
    createTime: new Date(),
  };

  const createPublishResultSwitch = (modalStatus: boolean, result: any) => {
    setApiResult(result);
    setCreatePublishResultModalVisible(true);
  };

  const flagValidatorRules = {
    validator: (rule: any, value: any) => {
      if (!value) {
        return Promise.resolve();
      }
      const reg = /^[a-zA-Z0-9-_]+$/;
      return reg.exec(value) === null
        ? Promise.reject(new Error('仅支持英文、数字、中横线、下划线'))
        : Promise.resolve();
    },
  };

  const whitelistValuesValidatorRules = {
    validator: (rule: any, value: any) => {
      if (!value) {
        return Promise.resolve();
      }
      const reg = /[，'"/\\]/gi;
      return reg.exec(value) ? Promise.reject(new Error('不允许输入特殊字符')) : Promise.resolve();
    },
  };

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
    const dataSurplusFlowRatio = res.data.surplusFlowRatio;
    if (dataSurplusFlowRatio > 0) {
      setSceneSurplusFlowRatio(res.data.surplusFlowRatio);
    }
  };

  const initCreateGEList = () => {
    setCreateEGList([firstEG]);
  };

  const loadExperimentInfo = async () => {
    if (!_.isEmpty(experimentId)) {
      const res = await getExperimentDetail({
        experimentId,
        appId,
        sceneId,
      });
      if (res.code && res.code === -1) {
        history.push('/error');
        return;
      }
      const { data } = res;
      setExperimentInfo(data);
      const experimentGroupList = data.experimentGroups.map((item: any, index: number) => {
        item.index = index;
        return item;
      });
      setFlowRatioVal(data.flowRatio);
      setSceneSurplusFlowRatio(res.data.flowRatio);
      setCreateEGList(experimentGroupList);
      form.setFieldsValue({
        ...data,
      });
    }
  };

  const handleGroupNameOptions = () => {
    const options = createEGList.map((item: any) => {
      const groupMarkName = item.mark === 0 ? '实验组' : '对照组';
      return {
        value: item.name,
        label: `【${item.name}】${groupMarkName}`,
        index: item.index,
      };
    });
    setGroupNameOptions(options);
    form.setFieldsValue({ groupName: undefined });
  };

  const refreshCurrent = async () => {
    setLoading(true);
    initCreateGEList();
    await loadSurplusFlowRatio();
    // await loadExperimentInfo();
    setLoading(false);
  };

  useEffect(() => {
    refreshCurrent();
  }, []);

  useMemo(() => {
    if (!_.isEmpty(currentSceneInfo)) {
      loadExperimentInfo();
    }
  }, [currentSceneInfo]);

  useMemo(() => {
    handleGroupNameOptions();
  }, [createEGList]);

  useMemo(() => {
    const tmpMarks: any = {};
    for (let i = 0; i <= sceneSurplusFlowRatio; i += 10) {
      if (i <= 100) tmpMarks[i] = `${i}%`;
    }
    setMarks(tmpMarks);
  }, [sceneSurplusFlowRatio]);

  useMemo(() => {
    let max: number;
    if (typeVal === 1) {
      max = 100;
    } else {
      max = sceneSurplusFlowRatio;
    }
    const tmpMarks: any = {};
    for (let i = 0; i <= max; i += 10) {
      if (i <= 100) tmpMarks[i] = `${i}%`;
    }
    setMarks(tmpMarks);
    setFlowRatioVal(max);
  }, [typeVal]);

  const handlePublishRequest = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单...', key: loadingKey, duration: 0 });
    const params = {
      appId,
      sceneId,
      source,
      id: experimentId,
    };
    setLoading(true);
    const res = await submitPublishOrder(params);
    setLoading(false);
    if (res.code !== 1) {
      message.destroy();
      createPublishResultSwitch(true, res);
      return false;
    }
    message.destroy();
    createPublishResultSwitch(true, res);
    return true;
  };

  const handleStopRequest = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单...', key: loadingKey, duration: 0 });
    const params = {
      appId,
      sceneId,
      source,
      id: experimentId,
      action: 2,
    };
    setLoading(true);
    const res = await submitPublishOrder(params);
    setLoading(false);
    if (res.code !== 1) {
      message.destroy();
      createPublishResultSwitch(true, res);
      return false;
    }
    message.destroy();
    createPublishResultSwitch(true, res);
    return true;
  };

  const handleResetRequest = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单...', key: loadingKey, duration: 0 });
    const params = {
      appId,
      sceneId,
      source,
      id: experimentId,
      action: 4,
    };
    setLoading(true);
    const res = await submitPublishOrder(params);
    setLoading(false);
    if (res.code !== 1) {
      message.destroy();
      createPublishResultSwitch(true, res);
      return false;
    }
    message.destroy();
    createPublishResultSwitch(true, res);
    return true;
  };

  const renderStatusButton = () => {
    const publishBtn = (
      <Popconfirm key="publishBtn" title="确认操作？" onConfirm={handlePublishRequest}>
        <Button type="primary" style={{ float: 'right' }}>
          提交发布单
        </Button>
      </Popconfirm>
    );
    const mergeBtn = (
      <Button
        key="merge"
        type="primary"
        onClick={async () => {
          setCurrentData(experimentInfo);
          setMergeExperimentModalVisible(true);
        }}
      >
        合并
      </Button>
    );
    const stopBtn = (
      <Popconfirm key="stopBtn" title="确认操作？" onConfirm={handleStopRequest}>
        <Button type="primary" style={{ float: 'right' }}>
          下线
        </Button>
      </Popconfirm>
    );
    const resetBtn = (
      <Popconfirm key="resetBtn" title="确认操作？" onConfirm={handleResetRequest}>
        <Button type="primary" style={{ float: 'right' }}>
          重启
        </Button>
      </Popconfirm>
    );

    switch (experimentInfo.publishStatus) {
      case 0:
        return [publishBtn];
      case 200:
        return [publishBtn, mergeBtn, stopBtn];
      case 600:
        return [resetBtn];
      default:
        return [];
    }
  };

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

  const handleDelCurrentEGInfo = (currentEGData: any) => {
    try {
      const list = _.filter(createEGList, (item: any) => item.index !== currentEGData.index);
      const sortList = _.sortBy(list, (item: any) => item.index);
      setCreateEGList(sortList);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleFormFlag = (event: any) => {
    const { value } = event.target;
    createEGList.map((item, index) => {
      const name = value.length === 0 ? '' : `${value}_${index + 1}`;
      const newData = {
        ...firstEG,
        name,
      };
      handleEditCurrentEGInfo(item, newData);
    });
    handleGroupNameOptions();
  };

  const onSubmit = async (values: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      appId,
      sceneId,
      publishStatus: 0,
      flowRatio: flowRatioVal,
      experimentGroups: createEGList,
      diversionId: currentSceneInfo?.diversionId,
    };
    setLoading(true);
    const res = _.isEmpty(experimentInfo)
      ? await addExperiment(params)
      : await updateExperiment(params);
    setLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功! ', key: loadingKey, duration: 2 });
    const tmpExperimentId = res.data.id;
    refreshCurrent();
    history.push(
      `/scene/experiment/update?id=${tmpExperimentId}&app_id=${appId}&scene_id=${sceneId}`,
    );
    return true;
  };

  const onFinish = async (values: any) => {
    const success = await onSubmit(values);
    if (!success) {
      return false;
    }
    return true;
  };

  const renderWhitelist = () => {
    if (!_.isEmpty(currentSceneInfo) && currentSceneInfo.diversionId) {
      return (
        <ProCard title="白名单" ghost gutter={8} collapsible headerBordered>
          <div style={{ padding: 20 }}>
            <ProForm.Group>
              <ProFormSelect
                name="groupName"
                label="选择实验组"
                width="md"
                options={groupNameOptions}
                disabled={pageType !== 'create' || !form.getFieldValue('flag')}
              />
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
                disabled={pageType !== 'create'}
              />
              <ProFormTextArea
                name="whitelistValues"
                label="白名单内容"
                width="lg"
                rules={[whitelistValuesValidatorRules]}
                tooltip={{
                  title: '请使用自定义分流id的值配置白名单，多个值之间用英文逗号","',
                  icon: <InfoCircleTwoTone />,
                }}
                disabled={pageType !== 'create'}
              />
            </ProForm.Group>
          </div>
        </ProCard>
      );
    }
    return <></>;
  };

  return (
    <PageContainer>
      <Spin spinning={loading}>
        <ProCard
          headerBordered
          title={
            <h3>
              {_.isEmpty(experimentInfo)
                ? '新建实验'
                : `${experimentInfo.name}(${ExperimentStatus[experimentInfo.publishStatus]})`}
            </h3>
          }
          extra={<Space size="middle">{renderStatusButton()}</Space>}
        >
          <div style={{ margin: '20px' }}>
            <ProForm
              form={form}
              onFinish={onFinish}
              submitter={{
                render: (props) => {
                  return pageType !== 'detail' ? (
                    <div className="pro-form-submitter">
                      <Space size="large">
                        <Button
                          type="primary"
                          key="submit"
                          size="large"
                          onClick={() => props.form?.submit?.()}
                        >
                          保存
                        </Button>
                        <Button
                          type="default"
                          key="rest"
                          size="large"
                          onClick={() => props.form?.resetFields()}
                        >
                          重置
                        </Button>
                      </Space>
                    </div>
                  ) : null;
                },
              }}
              initialValues={experimentInfo}
              syncToInitialValues={false}
            >
              <ProFormText name="id" hidden />
              <ProForm.Group>
                <ProFormText
                  name="name"
                  label="实验名称"
                  width="md"
                  rules={[
                    {
                      required: true,
                      message: '实验名称为必填项',
                    },
                  ]}
                  disabled={pageType !== 'create'}
                />
                <ProFormText
                  name="flag"
                  label="实验标识"
                  width="md"
                  rules={[
                    {
                      required: true,
                      message: '实验标识为必填项',
                    },
                    flagValidatorRules,
                  ]}
                  tooltip={{
                    title: '仅支持英文、数字、中横线、下划线',
                    icon: <InfoCircleTwoTone />,
                  }}
                  fieldProps={{
                    onChange: (event) => handleFormFlag(event),
                  }}
                  disabled={pageType !== 'create'}
                />
                <ProFormSelect
                  name="type"
                  label="实验类型"
                  width="md"
                  rules={[
                    {
                      required: true,
                      message: '实验类型为必填项',
                    },
                  ]}
                  options={Object.keys(ExperimentType).map((key) => {
                    return {
                      value: Number(key),
                      label: ExperimentType[key],
                    };
                  })}
                  fieldProps={{
                    onChange: (value) => {
                      setTypeVal(value);
                    },
                  }}
                  initialValue={0}
                  disabled={pageType !== 'create'}
                />
              </ProForm.Group>
              <Row>
                <Col span={22}>
                  <ProFormSlider
                    name="flowRatio"
                    label="实验流量"
                    min={0}
                    max={flowRatioMax}
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
                    tooltip={{
                      title: '实验流量需与实验组列表流量相同',
                      icon: <InfoCircleTwoTone />,
                    }}
                    disabled={pageType === 'detail'}
                  />
                </Col>
                <Col span={2}>
                  <InputNumber
                    className="ant-input-number-large"
                    min={0}
                    max={flowRatioMax}
                    width={40}
                    size="large"
                    value={flowRatioVal}
                    onChange={(value) => {
                      if (typeVal === 0) {
                        setFlowRatioVal(value);
                      }
                    }}
                    formatter={(value) => `${value}%`}
                    parser={(value: any) => value?.replace('%', '')}
                    disabled={pageType === 'detail'}
                  />
                </Col>
              </Row>
              <ProCard title="实验组" ghost gutter={8} collapsible headerBordered>
                <div className="cardList">
                  <ProList
                    headerTitle={false}
                    actionRef={actionRef}
                    rowKey="id"
                    grid={{ column: 4, gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
                    dataSource={[nullData, ...createEGList]}
                    renderItem={(item, index) => {
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
                              extra={
                                <Space>
                                  {pageType !== 'detail' && (
                                    <Tooltip key="edit" title="修改">
                                      <EditOutlined
                                        onClick={() => {
                                          setCurrentEGInfo(item);
                                          setEditEGModalVisible(true);
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                  {pageType === 'create' && item.mark === 0 && (
                                    <Tooltip key="delete" title="删除">
                                      <DeleteOutlined
                                        onClick={() => {
                                          handleDelCurrentEGInfo(item);
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                  {pageType !== 'create' && (
                                    <a
                                      key="detail"
                                      href={`#/scene/rule/detail?id=${
                                        item.objId
                                      }&app_id=${appId}&scene_id=${sceneId}&list_type=${
                                        experimentInfo.publishStatus === 400 ? 1 : item.mark
                                      }&access_mode=0`}
                                      target="_blank"
                                      style={{ color: 'black' }}
                                    >
                                      {item.mark === 0 ? '管理规则' : '查看规则'}
                                    </a>
                                  )}
                                </Space>
                                // item.mark === 0 && (
                                //   <UnlockFilled
                                //     onClick={() => {
                                //       setExperimentGroupContrast(item);
                                //     }}
                                //     size={30}
                                //   />
                                // )
                              }
                              className={groupMarkClass}
                            >
                              <Paragraph className="item">
                                <ul>
                                  <li>实验组名称：{item.name}</li>
                                  <li>实验组标记：{ExperimentGroupMark[item.mark]}</li>
                                  <li>
                                    流量配比：
                                    <Row>
                                      <Col span={18}>
                                        <Slider
                                          min={0}
                                          max={flowRatioMax}
                                          value={item.flowRatio}
                                          tipFormatter={(value) => `${value}%`}
                                          onChange={(value) => {
                                            handleEditCurrentEGInfo(item, {
                                              ...item,
                                              flowRatio: value,
                                            });
                                          }}
                                          disabled={pageType === 'detail'}
                                        />
                                      </Col>
                                      <Col span={2}>
                                        <InputNumber
                                          className="ant-input-number"
                                          min={0}
                                          max={flowRatioMax}
                                          value={item.flowRatio}
                                          onChange={(value) => {
                                            handleEditCurrentEGInfo(item, {
                                              ...item,
                                              flowRatio: value,
                                            });
                                          }}
                                          formatter={(value) => `${value}%`}
                                          parser={(value: any) => value?.replace('%', '')}
                                          disabled={pageType === 'detail'}
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
                      return (
                        <List.Item>
                          <Button
                            type="dashed"
                            className="newButton"
                            onClick={() => {
                              if (pageType === 'create') setCreateEGModalVisible(true);
                            }}
                            disabled={pageType !== 'create' || createEGList.length >= 2}
                          >
                            <PlusOutlined /> 批量新建实验组
                          </Button>
                        </List.Item>
                      );
                    }}
                  />
                </div>
              </ProCard>
              {renderWhitelist()}
            </ProForm>
          </div>
        </ProCard>
      </Spin>
      <CreateExperimentGroup
        actionRef={actionRef}
        visible={createEGModalVisible}
        onVisibleChange={setCreateEGModalVisible}
        experimentFlag={form.getFieldValue('flag') || ''}
        createEGList={createEGList}
        setCreateEGList={setCreateEGList}
      />
      <EditExperimentGroup
        actionRef={actionRef}
        visible={editEGModalVisible}
        onVisibleChange={setEditEGModalVisible}
        currentData={currentEGInfo}
        handleEditCurrentEGInfo={handleEditCurrentEGInfo}
        flowRatioMax={flowRatioMax}
      />
      <ExperimentMergeBranch
        actionRef={actionRef}
        visible={mergeExperimentModalVisible}
        onVisibleChange={setMergeExperimentModalVisible}
        currentData={currentData}
        createPublishResultSwitch={createPublishResultSwitch}
      />
      <CreatePublishResult
        visible={createPublishResultModalVisible}
        onVisibleChange={setCreatePublishResultModalVisible}
        apiResult={apiResult}
      />
    </PageContainer>
  );
};

export default UpdateView;
