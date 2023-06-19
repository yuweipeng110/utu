import React from 'react';
import { Result } from 'antd';
import ProCard from '@ant-design/pro-card';
import { StrategyDeployInfo } from '@/models/strategyDeploy';
import _ from 'lodash';
import moment from 'moment';

export type StrategyDeployStep60Props = {
  currentAppDeployData?: StrategyDeployInfo;
};

const StrategyDeployStep60: React.FC<StrategyDeployStep60Props> = (props) => {
  const { currentAppDeployData } = props;

  return (
    <ProCard>
      <Result
        status={currentAppDeployData?.status !== 800 ? 'success' : 'info'}
        title={currentAppDeployData?.status !== 800 ? '策略发布完成' : '关闭'}
        subTitle={
          <span>
            发布单名称：{currentAppDeployData?.orderName}&nbsp;&nbsp;&nbsp;&nbsp; 提交人：
            {currentAppDeployData?.submitter}&nbsp;&nbsp;&nbsp;&nbsp; 提交时间:
            {moment(currentAppDeployData?.submitTime).format('YYYY-MM-DD HH:mm:ss')}
          </span>
        }
      />
    </ProCard>
  );
};

export default StrategyDeployStep60;
