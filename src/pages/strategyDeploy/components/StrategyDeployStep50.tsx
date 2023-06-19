import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, Space, message, Popconfirm } from 'antd';
import ProCard from '@ant-design/pro-card';
import ProForm from '@ant-design/pro-form';
import ProDescriptions, { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import type { StrategyDeployInfo } from '@/models/strategyDeploy';
import { appDeployStageHandler, buildAndDeploy, packDeployDetail } from '@/services/appDeploy';
import { getPageQuery } from '@/utils/utils';
import _ from 'lodash';

export type StrategyDeployStep50Props = {
  setLoading: any;
  currentAppDeployData?: StrategyDeployInfo;
  setRandom?: any;
  closeAppDeployRequest?: any;
  stagePrevious?: any;
  stageNext?: any;
  onRefresh?: any;
};

let detailViewTimer: any = null;

const StrategyDeployStep50: React.FC<StrategyDeployStep50Props> = (props) => {
  const {
    setLoading,
    currentAppDeployData,
    setRandom,
    closeAppDeployRequest,
    stagePrevious,
    stageNext,
    onRefresh,
  } = props;
  const queryParams = getPageQuery();
  const appDeployId = queryParams['id'];
  const appId = queryParams['app_id'];

  const [packDeployData, setPackDeployData] = useState<any>(Object.create(null));
  const [buildIsStart, setBuildIsStart] = useState<boolean>(false);
  const [buildDetailList, setBuildDetailList] = useState<string[]>([]);
  let dataIndex = 0;
  let buildIsClick = false;

  const editColumns: ProDescriptionsItemProps[] = [
    {
      title: '发布单名称',
      dataIndex: 'orderName',
    },
    {
      title: '提交人',
      dataIndex: 'submitter',
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      valueType: 'dateTime',
    },
  ];

  const buildAndDeployRequest = async () => {
    buildIsClick = true;
    setBuildDetailList([]);
    setBuildIsStart(true);
    const res = await buildAndDeploy({
      appOrderId: currentAppDeployData?.orderId,
      stage: 700,
      appId: Number(appId),
    });
    setBuildIsStart(false);
    if (res.code !== 1) {
      message.error(res.message);
      return false;
    }
    await onRefresh(null, currentAppDeployData?.stage);
    if (res.code >= 1) {
      await packDeployRequest();
    }
    message.success(res.message);
    return true;
  };

  const showDetail = (data: any) => {
    if (!_.isEmpty(data)) {
      if (buildIsClick) {
        let arr: any = [];
        detailViewTimer = setInterval(() => {
          if (!_.isEmpty(data.externalMessage)) {
            if (dataIndex >= data.externalMessage.length) {
              clearInterval(detailViewTimer as any);
              detailViewTimer = null;
              return;
            }
            const item = data.externalMessage[dataIndex];
            arr.push(item);
            setBuildDetailList([...arr]);
            dataIndex++;
          }
        }, 700);
        buildIsClick = false;
      } else {
        if (!_.isEmpty(data.externalMessage)) {
          setBuildDetailList(data.externalMessage);
        }
      }
    }
  };

  const packDeployRequest = async () => {
    const res = await packDeployDetail({
      appOrderId: currentAppDeployData?.orderId,
      stage: currentAppDeployData?.stage,
      appId: Number(appId),
      deployRecordList: _.isEmpty(packDeployData) ? null : !_.isEmpty(packDeployData?.firstMessage) ? packDeployData?.firstMessage : packDeployData?.externalMessage,
    });
    setPackDeployData(res.data);
    showDetail(res.data);
  };

  useEffect(() => {
    packDeployRequest();
  }, []);

  useEffect(() => {
    let timer: any = null;
    if (!_.isEmpty(currentAppDeployData)) {
      if (currentAppDeployData?.isAllIpOk === 0) {
        if (detailViewTimer) {
          clearInterval(detailViewTimer as any);
          detailViewTimer = null;
        }
        timer = setInterval(async () => {
          await onRefresh(null, currentAppDeployData?.stage, false);
          await packDeployRequest();
        }, 5000);
      } else if (currentAppDeployData?.isAllIpOk === 1) {
        clearInterval(timer as any);
        timer = null;
      }
    }
    return () => {
      clearInterval(timer as any);
      timer = null;
    };
  }, [currentAppDeployData]);

  const onSubmit = async (values: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      appId,
      stage: currentAppDeployData?.stage,
      orderId: Number(appDeployId),
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

  const onFinish = async (values: any) => {
    const success = await onSubmit(values);
    if (!success) {
      return false;
    }
    return true;
  };

  const nextDis =
    !_.isEmpty(currentAppDeployData) &&
    !_.isEmpty(packDeployData) &&
    !_.isEmpty(packDeployData.externalMessage) &&
    !_.isEmpty(buildDetailList) &&
    packDeployData.externalMessage.length == buildDetailList.length &&
    currentAppDeployData?.status === 361
      ? false
      : true;

  return (
    <ProCard
      title="部署预发"
      headerBordered
      extra={
        <Space size="large">
          {currentAppDeployData?.originalStage === 700 && !buildIsStart && (
            <Popconfirm title="确认操作？" onConfirm={closeAppDeployRequest}>
              <Button type="primary">关闭</Button>
            </Popconfirm>
          )}
        </Space>
      }
    >
      <ProForm
        onFinish={onFinish}
        submitter={{
          render: (props) => {
            if (!_.isEmpty(currentAppDeployData) && currentAppDeployData?.originalStage === 700) {
              return (
                <div style={{ textAlign: 'center' }}>
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
                      onClick={() => props.form?.submit?.()}
                      disabled={nextDis}
                    >
                      {currentAppDeployData.isAllIpOk === 0 ? '强制结束' : '下一步'}
                    </Button>
                  </Space>
                </div>
              );
            }
            return null;
          },
        }}
      >
        <ProDescriptions
          bordered
          column={3}
          title={false}
          dataSource={currentAppDeployData}
          columns={editColumns}
          style={{ width: '100%' }}
          size="small"
        />
        <Card
          title="部署详情"
          bordered={false}
          extra={
            <Space size="large">
              {currentAppDeployData?.originalStage === 700 && (
                <>
                  <Button
                    type="primary"
                    onClick={buildAndDeployRequest}
                    disabled={currentAppDeployData.status === 361 || buildIsStart}
                  >
                    部署预发
                  </Button>
                </>
              )}
            </Space>
          }
        >
          <div
            style={{
              width: '100%',
              height: '500px',
              background: '#F3F3F3',
              overflow: 'auto',
              padding: '10px',
            }}
          >
            {buildIsStart && <>打包部署中，请稍后......</>}
            {!_.isEmpty(packDeployData) &&
              buildDetailList.map((item: any, index: number) => {
                let colorVal = '';
                switch (item.executeStatus) {
                  case 'FAILURE':
                    colorVal = 'red';
                    break;
                  case 'RUNNING':
                    colorVal = 'black';
                    break;
                  case 'SUCCESS':
                    colorVal = 'green';
                    break;
                  default:
                    colorVal = 'black';
                    break;
                }
                return (
                  <p key={index} style={{ color: colorVal }}>
                    {item.executeTime}&nbsp;&nbsp;&nbsp;&nbsp;{item.executeType}
                    &nbsp;&nbsp;&nbsp;&nbsp;{item.executeLog}&nbsp;&nbsp;&nbsp;&nbsp;
                    {item.executeStatus}
                  </p>
                );
              })}
          </div>
        </Card>
      </ProForm>
    </ProCard>
  );
};

export default StrategyDeployStep50;
