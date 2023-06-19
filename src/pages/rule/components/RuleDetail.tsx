import React, { useState } from 'react';
import { Tabs, Card, Affix, Tooltip, Select, Button } from 'antd';
import { CodeFilled, CodeOutlined } from '@ant-design/icons';
import RuleFormEditor from './FormEditor/RuleFormEditor';
import RuleCodeEditor from './RuleCodeEditor';
import ReactDiffViewer from 'react-diff-viewer';
import type { BranchDetail, BranchDiffStruct, BranchStage } from '@/models/rule';
import {
  allCollapse,
  allCollapsedLength,
  allExpand,
  CodeThemeList,
  EditorCodeTheme,
  handleEditorCodeTheme,
} from '@/utils/func';
import '../index.less';

const { TabPane } = Tabs;
const { Option } = Select;

export type RuleDetailProps = {
  branchDetail: BranchDetail;
  ruleObject: any;
  branchDiff: BranchDiffStruct;
  onGroupsFormChange: (value: BranchStage[]) => void;
};

const RuleDetail: React.FC<RuleDetailProps> = (props) => {
  const { branchDetail, ruleObject, branchDiff, onGroupsFormChange } = props;
  const [selKey, setSelKey] = useState('1');
  const [codeTheme, setCodeTheme] = useState<string>(EditorCodeTheme);

  const renderAllCollapsedBtn = () => {
    if (!ruleObject?.stages) {
      return false;
    }
    const rulesLength = allCollapsedLength(ruleObject);
    if (rulesLength !== -1) {
      return (
        <Tooltip title="展开全部" placement="bottom">
          <Button
            className="right"
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
      <Tooltip title="收起全部" placement="bottom">
        <Button
          className="right"
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
    <Card style={{ marginTop: '20px' }} className="rule-card">
      <div>
        <Affix>
          <div className="title-stage">
            <div className="title-tips">
              <h3>规则内容</h3>
            </div>
            <div className="title">
              <Tooltip title="编辑器主题" placement="left">
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
            </div>
          </div>
        </Affix>
        <Tabs defaultActiveKey={`${selKey}`} onChange={(val) => setSelKey(val)} type="card">
          <TabPane tab="规则内容" key="1">
            <RuleFormEditor
              readOnly={true}
              branchId={branchDetail?.branchId}
              ruleGroups={ruleObject?.stages}
              onChange={onGroupsFormChange}
              codeTheme={codeTheme}
            />
          </TabPane>
          <TabPane tab="规则内容(SourceCode)" key="2">
            <RuleCodeEditor
              readOnly={true}
              sourceCode={branchDetail?.ruleContent}
              codeTheme={codeTheme}
            />
          </TabPane>
          <TabPane tab="与基线分支diff" key="3">
            <ReactDiffViewer
              leftTitle="当前内容"
              rightTitle="线上内容"
              oldValue={branchDiff?.currentContent}
              newValue={branchDiff?.targetContent}
              splitView={true}
            />
          </TabPane>
        </Tabs>
      </div>
    </Card>
  );
};

export default RuleDetail;
