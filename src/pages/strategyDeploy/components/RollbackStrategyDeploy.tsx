import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Spin, Steps, message } from 'antd';
import type { StrategyDeployInfo } from '@/models/strategyDeploy';
import { getAppStageInformation, closeAppDeploy } from '@/services/appDeploy';
import { StrategyDeployStage } from '@/consts/strategyDeploy/const';
import Step10 from './RollbackStrategyDeployStep10';
// import Step20 from './RollbackStrategyDeployStep20';
// import Step30 from './RollbackStrategyDeployStep30';
import Step35 from './RollbackStrategyDeployStep35';
import Step40 from './RollbackStrategyDeployStep40';
import Step45 from './RollbackStrategyDeployStep45';
import Step50 from './RollbackStrategyDeployStep50';
import StrategyDeployResult from './Modal/StrategyDeployResult';
import { getPageQuery } from '@/utils/utils';
import _ from 'lodash';
import ProCard from '@ant-design/pro-card';

const { Step } = Steps;
const steps = [Step10, Step35, Step40, Step45, Step50];

const StrategyDeploy: React.FC = (props) => {
  const queryParams = getPageQuery();
  const appDeployId = queryParams['id'];
  const appId = queryParams['app_id'];
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTip, setLoadingTip] = useState<string>('');
  const [currentOriginal, setCurrentOriginal] = useState(0);
  const [current, setCurrent] = useState(0);
  const [currentAppDeployData, setCurrentAppDeployData] = useState<StrategyDeployInfo>(
    Object.create(null),
  );
  const [random, setRandom] = useState<string>('');
  const [informationParams, setInformationParams] = useState([]);
  const [createAppDeployResultModalVisible, setCreateAppDeployResultModalVisible] =
    useState<boolean>(false);
  const [apiResult, setApiResult] = useState(Object.create(null));
  const stepStageObj = {
    200: '包diff',
    // 300: '策略审批',
    // 350: '泰坦变更',
    1099: '回滚日常',
    1100: '回滚预发',
    1101: '回滚线上',
    1200: currentAppDeployData.status !== 800 ? '结束' : '关闭',
  };
  const stepStageKey = {
    200: 0,
    1099: 1,
    1100: 2,
    1101: 3,
    1200: 4,
  };

  const createAppDeployResultSwitch = (modalStatus: boolean, result: any) => {
    setApiResult(result);
    setCreateAppDeployResultModalVisible(true);
  };

  /**
   * stage上一步
   */
  const stagePrevious = (currentStage: number) => {
    const currentStageIndex = currentAppDeployData.stageList.indexOf(currentStage);
    const stagePreviousVal = currentAppDeployData.stageList[currentStageIndex - 1];
    loadDeployInfo(stagePreviousVal);
  };

  /**
   * stage下一步
   */
  const stageNext = (currentStage: number) => {
    const currentStageIndex = currentAppDeployData.stageList.indexOf(currentStage);
    const stagePreviousVal = currentAppDeployData.stageList[currentStageIndex + 1];
    loadDeployInfo(stagePreviousVal);
  };

  const switchCurrent = (current: StrategyDeployInfo, stage: number) => {
    // let stepKey = Object.keys(stepStageObj).indexOf(stage.toString());
    let stepKey = stepStageKey[stage];
    if (stepKey >= 0) {
      setCurrent(stepKey);
    }
  };

  const switchCurrentOriginal = (current: StrategyDeployInfo, originalStage: number) => {
    // let stepKey = Object.keys(stepStageObj).indexOf(originalStage.toString());
    let stepKey = stepStageKey[originalStage];
    if (stepKey >= 0) {
      // // 此判断是 策略审批 泰坦 可以跳过 需特殊处理
      // if (
      //   current.originalStage !== 1200 &&
      //   Math.max.apply(null, current.stageList) >= 700 &&
      //   stepKey >= 2
      // ) {
      //   if (current.stageList.indexOf(300) >= 0) {
      //     stepKey--;
      //   }
      //   if (current.stageList.indexOf(350) >= 0) {
      //     stepKey--;
      //   }
      // }

      setCurrentOriginal(stepKey);
    }
  };

  const loadDeployInfo = async (stage: number | null = null, isShowLoading: true) => {
    if(isShowLoading) setLoading(true);
    const params: any = {
      appId: Number(appId),
      orderId: Number(appDeployId),
    };
    if (stage !== null) {
      params.stage = stage;
    }
    const res = await getAppStageInformation(params);
    if(isShowLoading) setLoading(false);
    if (res.code && res.code < 0) {
      message.info(`当前应用发布无法进入【${StrategyDeployStage[stage as number]}】阶段`);
      return false;
    }
    setCurrentAppDeployData(res);
    switchCurrent(res, res.stage);
    switchCurrentOriginal(res, res.originalStage);
    if (res.stage === 200) {
      setInformationParams(res.informationParams);
    }
    return true;
  };

  useEffect(() => {
    if (!_.isEmpty(appDeployId)) {
      loadDeployInfo();
    }
  }, [appDeployId, random]);

  const StepComp = steps[current];

  const closeAppDeployRequest = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在关闭...', key: loadingKey, duration: 0 });
    const params = {
      appId,
      stage: currentAppDeployData.stage,
      orderId: currentAppDeployData.orderId,
    };
    setLoading(true);
    const res = await closeAppDeploy(params);
    setLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '关闭成功! ', key: loadingKey, duration: 2 });
    setRandom((Math.random() * 1000000).toFixed(0));
    return true;
  };

  const stepRender = (stage: number) => {
    const stepDom = <Step title={stepStageObj[stage]} />;
    if (!_.isEmpty(currentAppDeployData)) {
      if (Math.max(...currentAppDeployData.stageList) < stage) {
        return stepDom;
      }
      if (currentAppDeployData.stageList.indexOf(stage) >= 0) {
        return (
          <Step
            title={
              appDeployId && currentAppDeployData.stage === stage ? (
                <span style={{ color: 'blue' }}>{stepStageObj[stage]}</span>
              ) : currentAppDeployData.originalStage >= stage ||
                currentAppDeployData.stageList.indexOf(stage) ? (
                <a
                  onClick={() => {
                    if (
                      (!_.isEmpty(currentAppDeployData) &&
                        currentAppDeployData.originalStage >= stage) ||
                      currentAppDeployData.stageList.indexOf(stage)
                    ) {
                      loadDeployInfo(stage);
                    }
                  }}
                  style={{ color: 'green' }}
                >
                  {stepStageObj[stage]}
                </a>
              ) : (
                stepStageObj[stage]
              )
            }
          />
        );
      } else {
        return null;
      }
    }
    return stepDom;
  };

  return (
    <PageContainer>
      <Spin spinning={loading} size="large" tip={loadingTip}>
        <ProCard headerBordered title="回滚详情">
          <Steps current={currentOriginal} size="small">
            {stepRender(200)}
            {stepRender(1099)}
            {stepRender(1100)}
            {stepRender(1101)}
            {stepRender(1200)}
          </Steps>
        </ProCard>
        <StepComp
          setLoading={setLoading}
          setLoadingTip={setLoadingTip}
          currentAppDeployData={currentAppDeployData}
          createAppDeployResultSwitch={createAppDeployResultSwitch}
          informationParams={informationParams}
          setRandom={setRandom}
          closeAppDeployRequest={closeAppDeployRequest}
          stagePrevious={stagePrevious}
          stageNext={stageNext}
          onRefresh={loadDeployInfo}
        />
      </Spin>
      <StrategyDeployResult
        visible={createAppDeployResultModalVisible}
        onVisibleChange={setCreateAppDeployResultModalVisible}
        apiResult={apiResult}
      />
    </PageContainer>
  );
};

export default StrategyDeploy;
