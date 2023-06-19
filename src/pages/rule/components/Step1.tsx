import React, { useEffect, useState } from 'react';
import { Button, Card, Affix, Tooltip, Select } from 'antd';
import { CodeOutlined, CodeFilled } from '@ant-design/icons';
import { connect } from 'umi';
import type { ConnectState } from '@/models/connect';
import type { BranchDetail } from '@/models/rule';
import {
  allCollapsedLength,
  allExpand,
  allCollapse,
  EditorCodeTheme,
  handleEditorCodeTheme,
  CodeThemeList,
} from '@/utils/func';
import RuleCodeEditor from './RuleCodeEditor';
import RuleFormEditor from './FormEditor/RuleFormEditor';
import { StrategyRuleRelation } from "@/models/strategy";
import '../index.less';
import _ from 'lodash';

const { Option } = Select;

export type StepProps = {
  branchDetail: BranchDetail;
  branchId: number;
  onRefreshDetail?: () => void;
  isEdit: any;
  branchStrategyList: StrategyRuleRelation[];
  setBranchStrategyList: (branchStrategyList: StrategyRuleRelation[]) => void;
  setLoading: (isLoading: boolean) => void;
  ruleObject: any;
  onSwitchCodeMode: any;
  onSourceCodeChange: any;
  onGroupsFormChange: any;
  codeMode: any;
  sourceCode: any;
  tomlError: any;
};

const Step1 = (props: StepProps) => {
  const {
    branchId,
    branchDetail,
    // onRefreshDetail,
    isEdit,
    branchStrategyList,
    setBranchStrategyList,
    // setLoading,
    ruleObject,
    onSwitchCodeMode,
    onSourceCodeChange,
    onGroupsFormChange,
    codeMode,
    sourceCode,
    tomlError
  } = props;
  // const [sourceCode, setSourceCode] = useState<string>('');
  // const [ruleObject, setRuleObject] = useState(Object.create(null));
  // const [codeMode, setCodeMode] = useState<boolean>(false);
  // const [showSave, setShowSave] = useState<boolean>(false);
  // const [tomlError, setTomlError] = useState<string>('');
  const [codeTheme, setCodeTheme] = useState<string>(EditorCodeTheme);
  const [visualMode, setVisualMode] = useState<boolean>(true);
  // 分支类型： master、对照组， OR isEdit： 1
  const readOnly = branchDetail?.branchType === 0 || branchDetail?.branchType === 3 || Number(isEdit) === 1;

  useEffect(() => {
    if (!_.isEmpty(ruleObject.stages) && _.isEmpty(branchStrategyList)) {
      setVisualMode(true);
    } else {
      setVisualMode(false);
    }
  }, [ruleObject, branchStrategyList]);

  const onSwitchVisualMode = () => {
    setVisualMode(!visualMode);
  };

  const renderAllCollapsedBtn = () => {
    if (!ruleObject?.stages) {
      return false;
    }
    const rulesLength = allCollapsedLength(ruleObject);
    if (rulesLength !== -1) {
      return (
        <Tooltip title="展开全部">
          <Button
            className="right-button"
            style={{ marginRight: '5px' }}
            onClick={() => {
              allExpand(ruleObject, onGroupsFormChange);
            }}
          >
            <CodeOutlined style={{ fontSize: 18 }} />
          </Button>
        </Tooltip>
      );
    }
    return (
      <Tooltip title="收起全部">
        <Button
          className="right-button"
          style={{ marginRight: '5px' }}
          onClick={() => {
            allCollapse(ruleObject, onGroupsFormChange);
          }}
        >
          <CodeFilled style={{ fontSize: 18 }} />
        </Button>
      </Tooltip>
    );
  };

  return (
    <Card className="rule-card">
      <div>
        <Affix>
          <div className="title-stage">
            <div className="title-tips">
              <h3>规则内容</h3>
              <span style={{ color: 'red', display: 'block', overflow: 'auto' }}>{tomlError}</span>
            </div>
            <div className="title">
              {!readOnly && (
                visualMode ? (
                  <Button
                    type={visualMode ? 'primary' : 'default'}
                    className="right-button"
                    onClick={onSwitchVisualMode}
                    style={{ marginRight: '5px' }}
                    disabled={!_.isEmpty(ruleObject.stages) && _.isEmpty(branchStrategyList.length) ? true : false}
                  >
                    切换可视化界面
                  </Button>
                ) : (
                  <Button
                    type={visualMode ? 'primary' : 'default'}
                    className="right-button"
                    onClick={onSwitchVisualMode}
                    style={{ marginRight: '5px' }}
                    disabled={!_.isEmpty(branchStrategyList) ? true : false}
                  >
                    切换默认界面
                  </Button>
                )
              )}
              <Tooltip title="编辑器主题">
                <Select
                  style={{ width: 180, marginRight: '5px' }}
                  defaultValue={codeTheme}
                  onSelect={(value) => {
                    handleEditorCodeTheme(value, setCodeTheme);
                  }}
                >
                  {CodeThemeList.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Tooltip>
              {renderAllCollapsedBtn()}
              <Button
                type={codeMode ? 'primary' : 'default'}
                className="right-button"
                onClick={onSwitchCodeMode}
              >
                Source Code
              </Button>
            </div>
          </div>
        </Affix>
        <div>
          {codeMode ? (
            <RuleCodeEditor
              readOnly={readOnly}
              sourceCode={sourceCode}
              onValueChange={onSourceCodeChange}
              codeTheme={codeTheme}
              visualMode={visualMode}
            />
          ) : (
            <RuleFormEditor
              readOnly={readOnly}
              branchId={branchId}
              ruleGroups={ruleObject?.stages}
              onChange={onGroupsFormChange}
              codeTheme={codeTheme}
              branchStrategyList={branchStrategyList}
              setBranchStrategyList={setBranchStrategyList}
              visualMode={visualMode}
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentScene: app.currentScene,
}))(Step1);
