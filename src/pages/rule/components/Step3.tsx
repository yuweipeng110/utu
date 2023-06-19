import React, { useState, useEffect } from 'react';
import { Button, Card } from 'antd';
import type { BranchDetail } from '@/models/rule';
import RuleCodeEditor from './RuleCodeEditor';
import RuleFormEditor from './FormEditor/RuleFormEditor';
import TOML from '@iarna/toml';
import type { BranchStage } from '@/models/rule';
import '../index.less';

export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
} & Partial<BranchDetail>;

export type StepProps = {
  branchDetail: BranchDetail;
  branchId: number;
};

const Step3 = ({ branchId, branchDetail }: StepProps) => {
  const [groupList, setGroupList] = useState<BranchStage[]>([]);
  const [codeMode, setCodeMode] = useState<boolean>(false);

  useEffect(() => {
    setGroupList(TOML.parse(branchDetail.ruleContent).stages as BranchStage[]);
  }, [branchDetail]);

  return (
    <Card
      className="rule-card"
      title={
        <div>
          <h2>{branchDetail.branchName}</h2>
        </div>
      }
      extra={
        <div className="title">
          <Button
            type={codeMode ? 'primary' : 'default'}
            className="right-bottom"
            onClick={() => {
              setCodeMode(!codeMode);
            }}
          >
            Source Code
          </Button>
        </div>
      }
    >
      {codeMode ? (
        <RuleCodeEditor readOnly={true} sourceCode={branchDetail.ruleContent} />
      ) : (
        <RuleFormEditor readOnly={true} branchId={branchId} ruleGroups={groupList} />
      )}
    </Card>
  );
};

export default Step3;
