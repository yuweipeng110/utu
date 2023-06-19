import React, { useEffect, useState } from 'react';
import { connect } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { Form, Steps, Button, Space, Popover, Popconfirm, message } from 'antd';
import ProCard from '@ant-design/pro-card';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import type { CurrentUser } from '@/models/user';
import type { StrategyDeployInfo } from '@/models/strategyDeploy';
import {
  appDeployStageHandler,
  getApproveFlowStatusCode,
  queryAndUpdateApprovelFlow,
  createNewApprovelFlow,
  dealApprovelFlow,
} from '@/services/appDeploy';
import { StrategyDeployApproveStatus } from '@/consts/strategyDeploy/const';
import { getPageQuery } from '@/utils/utils';
import _ from 'lodash';
import '../index.less';

const { Step } = Steps;
let timer: any = null;

export type RollbackStrategyDeployStep20Props = {
  setLoading: any;
  setLoadingTip?: any;
  currentAppDeployData?: StrategyDeployInfo;
  setRandom?: any;
  informationParams?: any;
  closeAppDeployRequest?: any;
  stagePrevious?: any;
  stageNext?: any;
  onRefresh: any;
  currentUser?: CurrentUser;
} & Partial<ConnectProps>;

// 策略审批
const RollbackStrategyDeployStep20: React.FC<RollbackStrategyDeployStep20Props> = (props) => {
  const {
    setLoading,
    setLoadingTip,
    currentAppDeployData,
    setRandom,
    informationParams,
    closeAppDeployRequest,
    stagePrevious,
    stageNext,
    onRefresh,
    currentUser,
  } = props;
  const queryParams = getPageQuery();
  const appDeployId = queryParams['id'];
  const appId = queryParams['app_id'];
  const initialValues = { ...currentAppDeployData };
  const [form] = Form.useForm();
  const [approveFlowStatusCode, setApproveFlowStatusCode] = useState<number>(0);
  const [queryAndUpdateApprovelFlowData, setQueryAndUpdateApprovelFlowData] = useState(
    Object.create(null),
  );
  const [agreePopoverVisible, setAgreePopoverVisible] = useState<boolean>(false);
  const [refusePopoverVisible, setRefusePopoverVisible] = useState<boolean>(false);

  const findIndexByKeyValue = (arr: [], key: string, valueToSearch: string) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][key] === valueToSearch) {
        return i;
      }
    }
    return -1;
  };

  /**
   * 发布进入下一步流程
   * isBpms   number
   *    0：跳过策略审批、1:需要审批
   */
  const stageDeployNext = async (isBpms: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交...', key: loadingKey, duration: 0 });
    const params = {
      appId,
      stage: currentAppDeployData?.stage,
      orderId: Number(appDeployId),
      isBpms,
    };
    setLoading(true);
    const res = await appDeployStageHandler(params);
    setLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '提交成功! ', key: loadingKey, duration: 2 });
    // refreshCurrent();
    // history.push(`/app/deploy/update?id=${res.orderId}`);
    await onRefresh(null, currentAppDeployData?.stage);
    return true;
  };

  /**
   * 获取当前审批流的状态
   */
  const getApproveFlowStatusCodeRequest = async () => {
    const res = await getApproveFlowStatusCode({
      appId,
      publisherId: currentAppDeployData?.orderName,
    });
    setApproveFlowStatusCode(res.data);
    // 调用审批页面展示信息接口
    if (res.data === 0 || res.data === 1 || res.data === 2) {
      queryAndUpdateApprovelFlowRequest();
    }
  };

  /**
   * 审批页面展示信息
   */
  const queryAndUpdateApprovelFlowRequest = async () => {
    setLoading(true);
    setLoadingTip('获取审批流信息中，请稍后...');
    const res = await queryAndUpdateApprovelFlow({
      appId,
      publisherId: currentAppDeployData?.orderName,
    });
    setLoading(false);
    setLoadingTip('');
    setQueryAndUpdateApprovelFlowData(res.data);
  };

  /**
   * 策略审批流审批
   * execCode number
   *  0:取消 1:通过 2: 拒绝
   */
  const dealApprovelFlowRequest = async (execCode: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交...', key: loadingKey, duration: 0 });
    setLoading(true);
    setLoadingTip('正在审批中，请稍后...');
    const res = await dealApprovelFlow({
      appId,
      publisherId: currentAppDeployData?.orderName,
      execCode,
      applicationInfo: form.getFieldValue('approveIdea'),
      alipmcProcInstId: queryAndUpdateApprovelFlowData.alipmcProcInstId,
    });
    setLoading(false);
    setLoadingTip('');
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    // 如果同意、重新调用：审批页面展示信息 原因：在这个接口处理StatusCode值 先后顺序
    if (execCode === 1) {
      await queryAndUpdateApprovelFlowRequest();
    }
    // 如果拒绝调用关闭接口
    if (execCode === 2) {
      await closeAppDeployRequest();
    }
    message.success({ content: '提交成功! ', key: loadingKey, duration: 2 });
    await onRefresh(null, currentAppDeployData?.stage);
    // 重新调用：获取当前审批流的状态
    await getApproveFlowStatusCodeRequest();
    return true;
  };

  useEffect(() => {
    getApproveFlowStatusCodeRequest();
    return () => {
      clearInterval(timer);
      timer = null;
    };
  }, []);

  useEffect(() => {
    if (approveFlowStatusCode === 0 || approveFlowStatusCode === 1) {
      // queryAndUpdateApprovelFlowRequest();
      if (approveFlowStatusCode === 0) {
        timer = setInterval(() => {
          queryAndUpdateApprovelFlowRequest();
        }, 600000);
      }
    }
  }, [approveFlowStatusCode]);

  /**
   * 创建审批流
   */
  const createNewApprovelFlowRequest = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交...', key: loadingKey, duration: 0 });
    const params = {
      appId,
      publisherId: currentAppDeployData?.orderName,
      applicationInfo: form.getFieldValue('applicationInfo'),
    };
    setLoading(true);
    setLoadingTip('审批发起中，请稍后...');
    const res = await createNewApprovelFlow(params);
    setLoading(false);
    setLoadingTip('');
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '提交成功! ', key: loadingKey, duration: 2 });
    // refreshCurrent();
    // history.push(`/app/deploy/update?id=${res.orderId}`);
    await onRefresh(null, currentAppDeployData?.stage);
    // 重新调用：获取当前审批流的状态
    getApproveFlowStatusCodeRequest();
    return true;
  };

  const notCreateRender = () => {
    return <ProFormTextArea name="applicationInfo" label="申请原因" />;
  };

  const approveIdeaRender = (flowRequest: Function, execCode: number) => {
    return (
      <ProForm
        form={form}
        submitter={{
          render: (props) => {
            return (
              <div style={{ textAlign: 'right', width: '100%' }}>
                <Space>
                  <Button
                    key="cancelBtn"
                    size="small"
                    onClick={() => {
                      setAgreePopoverVisible(false);
                      setRefusePopoverVisible(false);
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    type="primary"
                    key="okBtn"
                    size="small"
                    onClick={() => {
                      flowRequest(execCode);
                      setAgreePopoverVisible(false);
                      setRefusePopoverVisible(false);
                    }}
                  >
                    确定
                  </Button>
                </Space>
              </div>
            );
          },
        }}
      >
        <ProFormTextArea
          name="approveIdea"
          label="审批意见"
          width="md"
          rules={[
            {
              required: true,
            },
          ]}
          fieldProps={{
            autoSize: { minRows: 5, maxRows: 5 },
          }}
        />
      </ProForm>
    );
  };

  const approveStatusRender = (status: number) => {
    let colorVal;
    switch (status) {
      case 0:
        colorVal = 'orange';
        break;
      case 1:
        colorVal = 'green';
        break;
      case 2:
        colorVal = 'red';
        break;
    }

    return <span style={{ color: colorVal }}>{StrategyDeployApproveStatus[status]}</span>;
  };

  const approveProcessRender = () => {
    if (approveFlowStatusCode >= 0 && !_.isEmpty(queryAndUpdateApprovelFlowData)) {
      if (queryAndUpdateApprovelFlowData.approveFlowInfos.length >= 1) {
        return (
          <Steps
            progressDot
            current={queryAndUpdateApprovelFlowData.approveActionIndex}
            className="my-approve-flow"
          >
            {queryAndUpdateApprovelFlowData.approveFlowInfos.map(
              (approveFlowInfo: any, approveFlowInfoIndex: number) => {
                let approveLevelNameListJoin = '';
                _.isArray(approveFlowInfo.empUserInfoList) &&
                  approveFlowInfo.empUserInfoList.map((item: any, index: number) => {
                    if (index === approveFlowInfo.empUserInfoList.length - 1) {
                      approveLevelNameListJoin += item.empName;
                    } else {
                      approveLevelNameListJoin += item.empName + ',';
                    }
                  });
                let finalApproveEmpInfo = approveFlowInfo.finalApproveEmpInfo
                  ? approveFlowInfo.finalApproveEmpInfo.empName
                  : '李军';
                let finalApproveComment =
                  approveFlowInfo.finalApproveComment && approveFlowInfo.finalApproveComment;
                return (
                  <Step
                    key={approveFlowInfoIndex}
                    title={
                      <>
                        {approveFlowInfo.approveLevelName}(
                        <Popover content={approveLevelNameListJoin}>
                          {_.truncate(approveLevelNameListJoin, {
                            length: 10,
                          })}
                        </Popover>
                        )
                      </>
                    }
                    description={
                      <>
                        <div>
                          当前审批人：
                          <Popover content={finalApproveEmpInfo}>
                            {_.truncate(finalApproveEmpInfo, {
                              length: 10,
                            })}
                          </Popover>
                        </div>
                        <div>
                          {approveStatusRender(approveFlowInfo.actionNameCode)}
                          {finalApproveComment && (
                            <Popover content={finalApproveComment}>
                              (
                              {_.truncate(finalApproveComment, {
                                length: 10,
                              })}
                              )
                            </Popover>
                          )}
                        </div>
                        {approveFlowInfo.actionNameCode === 0 &&
                          findIndexByKeyValue(
                            approveFlowInfo.empUserInfoList,
                            'empId',
                            currentUser?.empId as string,
                          ) >= 0 && (
                            <Space>
                              <Popover
                                content={approveIdeaRender(dealApprovelFlowRequest, 1)}
                                trigger="click"
                                visible={agreePopoverVisible}
                                onVisibleChange={(visible) => {
                                  setAgreePopoverVisible(visible);
                                  // setRefusePopoverVisible(true);
                                }}
                              >
                                <Button type="primary">同意</Button>
                              </Popover>
                              <Popover
                                content={approveIdeaRender(dealApprovelFlowRequest, 2)}
                                trigger="click"
                                visible={refusePopoverVisible}
                                onVisibleChange={(visible) => {
                                  setRefusePopoverVisible(visible);
                                  // setAgreePopoverVisible(true);
                                }}
                              >
                                <Button>拒绝</Button>
                              </Popover>
                            </Space>
                          )}
                      </>
                    }
                  />
                );
              },
            )}
            {queryAndUpdateApprovelFlowData.approveFlowInfos.length === 1 && (
              <Step title="研发审批" />
            )}
          </Steps>
        );
      }
    }
    return <></>;
  };

  const approveRender = () => {
    if (approveFlowStatusCode === -1) {
      return notCreateRender();
    }
    return approveProcessRender();
  };

  return (
    <ProCard
      title="策略审批"
      headerBordered
      extra={
        currentAppDeployData?.originalStage === 300 && (
          <Popconfirm title="确认操作？" onConfirm={closeAppDeployRequest}>
            <Button type="primary">关闭</Button>
          </Popconfirm>
        )
      }
    >
      <ProForm
        form={form}
        // layout="vertical"
        // onFinish={onFinish}
        submitter={{
          render: (props) => {
            if (
              !_.isEmpty(currentAppDeployData) &&
              currentAppDeployData?.originalStage === 300 &&
              approveFlowStatusCode === -1
            ) {
              return (
                <div style={{ textAlign: 'center', width: '100%', margin: '20px' }}>
                  <Space size="large">
                    <Button
                      type="primary"
                      key="submit"
                      onClick={() => stagePrevious(currentAppDeployData.stage)}
                    >
                      上一步
                    </Button>
                    <Button
                      type="primary"
                      key="submit"
                      onClick={() => {
                        stageDeployNext(0);
                      }}
                    >
                      跳过
                    </Button>
                    <Button
                      type="primary"
                      key="submit"
                      onClick={() => {
                        createNewApprovelFlowRequest();
                      }}
                    >
                      提交
                    </Button>
                  </Space>
                </div>
              );
            }
            if (
              !_.isEmpty(currentAppDeployData) &&
              currentAppDeployData?.originalStage === 300 &&
              approveFlowStatusCode === 1
            ) {
              return (
                <div style={{ textAlign: 'center', width: '100%', margin: '20px' }}>
                  <Space size="large">
                    <Button
                      type="primary"
                      key="submit"
                      onClick={() => {
                        stageDeployNext(1);
                      }}
                    >
                      下一步
                    </Button>
                  </Space>
                </div>
              );
            }
            return null;
          },
        }}
        initialValues={initialValues}
      >
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
          {approveRender()}
        </Space>
      </ProForm>
    </ProCard>
  );
};

export default connect(({ user }: ConnectState) => ({
  currentUser: user.currentUser,
}))(RollbackStrategyDeployStep20);
