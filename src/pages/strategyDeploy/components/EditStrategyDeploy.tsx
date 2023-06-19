import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Spin, Steps, message } from 'antd';
import ProCard from '@ant-design/pro-card';
import type { StrategyDeployInfo } from '@/models/strategyDeploy';
import { getAppStageInformation, closeAppDeploy } from '@/services/appDeploy';
import { StrategyDeployStage } from '@/consts/strategyDeploy/const';
import Step10 from './StrategyDeployStep10';
import Step20 from './StrategyDeployStep20';
import Step30 from './StrategyDeployStep30';
import Step40 from './StrategyDeployStep40';
import Step45 from './StrategyDeployStep45';
import Step50 from './StrategyDeployStep50';
import Step55 from './StrategyDeployStep55';
import Step60 from './StrategyDeployStep60';
import CreateStrategyDeployResult from './Modal/StrategyDeployResult';
import { getPageQuery } from '@/utils/utils';
import _ from 'lodash';

const { Step } = Steps;
const steps = [Step10, Step20, Step45, Step50, Step30, Step40, Step55, Step60];

const EditStrategyDeploy: React.FC = () => {
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
    0: '选择包',
    200: '包diff',
    699: '部署日常',
    700: '部署预发',
    300: '策略审批',
    350: '泰坦变更',
    701: '部署线上',
    1200: currentAppDeployData.status !== 800 ? '结束' : '关闭',
  };
  const stepStageKey = {
    0: 0,
    200: 1,
    699: 2,
    700: 3,
    300: 4,
    350: 5,
    701: 6,
    1200: 7,
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
    // // 注：Object.keys转换数组时 会自动排序， 如果状态码先后顺序有变化，需用另一种方法转换
    // let stepKey = Object.keys(stepStageObj).indexOf(stage.toString());
    let stepKey = stepStageKey[stage];

    if (stepKey >= 0) {
      // 此判断是 策略审批 泰坦 可以跳过 需特殊处理
      // if (
      //   current.stage === 300 || current.stage === 350
      // ) {
      //   if (current.stageList.indexOf(300) < 0) {
      //     stepKey = stepKey - 1;
      //   }
      //   if (current.stageList.indexOf(350) < 0) {
      //     stepKey = stepKey - 1;
      //   }
      // }
      setCurrent(stepKey);
    }
  };

  const switchCurrentOriginal = (current: StrategyDeployInfo, originalStage: number) => {
    // let stepKey = Object.keys(stepStageObj).indexOf(originalStage.toString());
    let stepKey = stepStageKey[originalStage];
    if (stepKey >= 0) {
      // 此判断是 策略审批 泰坦 可以跳过 需特殊处理
      // if (current.originalStage !== 1200 && Math.max.apply(null, current.stageList) >= 701 && stepKey >= 4) {
      // // if (current.stage >= 350
      // // ) {
      //   if (current.stageList.indexOf(300) < 0) {
      //     stepKey = stepKey - 1;
      //   }
      //   if (current.stageList.indexOf(350) < 0) {
      //     stepKey = stepKey - 1;
      //   }
      // }

      setCurrentOriginal(stepKey);
    }
  };

  const loadDeployInfo = async (stage: number | null = null, refreshStage: number | null = null, isShowLoading: boolean = true) => {
    if (isShowLoading) setLoading(true);
    const params: any = {
      appId: Number(appId),
      orderId: !_.isEmpty(currentAppDeployData) ? currentAppDeployData.orderId : Number(appDeployId),
    };
    if (stage !== null) {
      params.stage = stage;
    }
    if(refreshStage !== null){
      params.refreshStage = refreshStage;
    }
    const res = await getAppStageInformation(params);
    if (isShowLoading) setLoading(false);
    if (res.code && res.code < 0) {
      message.info(
        `当前应用发布无法进入【${StrategyDeployStage[stage as number]}】阶段，${res.message}`,
      );
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
  }, [appDeployId]);

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
    loadDeployInfo();
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
              ) : currentAppDeployData.originalStage === 1200 ||
                currentAppDeployData.originalStage !== stage ||
                currentAppDeployData.stageList.indexOf(stage) ? (
                <a
                  onClick={() => {
                    if (
                      (!_.isEmpty(currentAppDeployData) &&
                        currentAppDeployData.originalStage === 1200) ||
                      currentAppDeployData.originalStage !== stage ||
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
        // if ((currentAppDeployData.stage === 699 || currentAppDeployData.stage === 700)) {
        //   return stepDom;
        //   if(currentAppDeployData.status === 800 && currentAppDeployData.stageList.indexOf(stage) < 0){
        //     return null;
        //   }else{
        //     return stepDom;
        //   }
        // }
        return stepDom;
        return null;
      }
    }
    return stepDom;
  };

  return (
    <PageContainer>
      <Spin spinning={loading} size="large" tip={loadingTip}>
        <ProCard headerBordered title="发布详情">
          <Steps current={currentOriginal} size="small">
            {stepRender(0)}
            {stepRender(200)}
            {stepRender(699)}
            {stepRender(700)}
            {stepRender(300)}
            {stepRender(350)}
            {stepRender(701)}
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
      <CreateStrategyDeployResult
        visible={createAppDeployResultModalVisible}
        onVisibleChange={setCreateAppDeployResultModalVisible}
        apiResult={apiResult}
      />
    </PageContainer>
  );
};

export default EditStrategyDeploy;
