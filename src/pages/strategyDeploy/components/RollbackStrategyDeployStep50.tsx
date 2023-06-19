import React from 'react';
import { Result } from 'antd';
import ProCard from '@ant-design/pro-card';
import { StrategyDeployInfo } from '@/models/strategyDeploy';
import _ from 'lodash';
import moment from 'moment';

export type RollbackStrategyDeployStep50Props = {
  currentAppDeployData?: StrategyDeployInfo;
};

const RollbackStrategyDeployStep50: React.FC<RollbackStrategyDeployStep50Props> = (props) => {
  const { currentAppDeployData } = props;

  return (
    <ProCard>
      <Result
        status={currentAppDeployData?.status !== 800 ? 'success' : 'info'}
        title={currentAppDeployData?.status !== 800 ? '应用回滚完成' : '关闭'}
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

export default RollbackStrategyDeployStep50;
