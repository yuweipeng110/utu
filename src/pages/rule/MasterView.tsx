import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Steps } from 'antd';
import { getBranchDetail } from '@/services/rule';
import type { BranchDetail, BranchStage } from '@/models/rule';
import TOML from '@iarna/toml';
import { getPageQuery } from '@/utils/utils';
import Step1 from '@/pages/rule/components/Step1';

const { Step } = Steps;

const MasterView = (props: { location: { query: any } }) => {
  const {
    location: { query },
  } = props;
  const branchId = query.id;
  const [branchDetail, setBranchDetail] = useState<BranchDetail>(Object.create(null));
  const [current, setCurrent] = useState<number>(0);

  const switchCurrent = (branchStatus: number) => {
    if (branchStatus <= 300) {
      // 100-开发阶段, 300-提交发布（待审批）
      setCurrent(0);
    } else if (branchStatus !== 700) {
      // 400-发布阶段、500-取消发布（待审批）、600-合并至其他分支（待审批）
      setCurrent(1);
    }
  };

  const queryParams = getPageQuery();
  const appId = queryParams.app_id;
  const sceneId = queryParams.scene_id;

  const getBranchInfo = async () => {
    const res = await getBranchDetail({
      appId,
      sceneId,
      branchId,
    });
    if (res.code && res.code === -1) {
      history.push('/error');
      return;
    }
    if (res.ruleContent) {
      const tomlData = TOML.parse(res.ruleContent);
      res.ruleGroups = tomlData?.stages as BranchStage[];
    }
    setBranchDetail(res);
    // if (res.ruleContent !== null) setGroupList(TOML.parse(res.ruleContent).stages as BranchStage[]);
    switchCurrent(res.branchStatus);
  };

  useEffect(() => {
    getBranchInfo();
  }, []);

  return (
    <PageContainer>
      <Card
        title={
          <div>
            <span>
              <h1>{branchDetail?.branchName}</h1>
            </span>
          </div>
        }
      >
      </Card>
      <Step1
        branchDetail={branchDetail}
        branchId={query.id || ''}
        onRefreshDetail={getBranchInfo}
      />
    </PageContainer>
  );
};

export default MasterView;
