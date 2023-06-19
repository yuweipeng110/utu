import React, { useMemo, useState } from 'react';
import { Form, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { BranchDetail, BranchStage } from '@/models/rule';
import { StrategyRuleRelation } from '@/models/strategy';
import RuleGroupFormEditor from './RuleGroupFormEditor';
import RuleSelectStrategy from '@/pages/rule/components/ModalForm/RuleSelectStrategy';
import GroupModalForm from '@/pages/rule/components/ModalForm/GroupModalForm';
import LazyLoad from 'react-lazyload';
import Placeholder from '../LazyLoad/Placeholder';
import '../../index.less';

export type formEditorProps = {
  readOnly: boolean;
  branchId: number;
  ruleGroups: BranchStage[];
  branchDetail?: BranchDetail;
  onChange?: (value: BranchStage[]) => void;
  codeTheme: string;
  branchStrategyList: StrategyRuleRelation[];
  setBranchStrategyList: (branchStrategyList: StrategyRuleRelation[]) => void;
  visualMode: boolean;
};

const RuleFormEditor: React.FC<formEditorProps> = (props) => {
  const {
    readOnly,
    branchId,
    ruleGroups,
    onChange,
    codeTheme,
    branchStrategyList,
    setBranchStrategyList,
    visualMode,
  } = props;
  const [form] = Form.useForm();

  const [ruleSelectStrategyModalVisible, setRuleSelectStrategyModalVisible] =
    useState<boolean>(false);

  const onGroupEditorChange = (index: number, group: any) => {
    // const groups = form.getFieldValue('stages');
    // const newGroup = { ...groups[index], ...group };
    // groups[index] = newGroup;
    // form.setFieldsValue({ rules: [...groups] });
    // if (onChange) {
    //   onChange([...groups]);
    // }

    const newRuleGroups = form.getFieldValue('stages');
    // newRuleGroups[index] = { ...newRuleGroups[index], ...group };
    // if (onChange) {
    //   onChange(newRuleGroups);
    // }
    newRuleGroups[index] = { ...group };
    if (onChange) {
      onChange([...newRuleGroups]);
    }
  };

  const onGroupChange = () => {
    const newRuleGroups = form.getFieldValue('stages');
    form.setFieldsValue({ stages: newRuleGroups });
    if (onChange) {
      onChange([...newRuleGroups]);
    }
  };

  useMemo(() => {
    form.setFieldsValue({ stages: ruleGroups }); // 回显
  }, [ruleGroups]);

  const strategyRender = (fields: any, add: any) => {
    return readOnly || visualMode ? null : (
      <>
        <Button style={{ width: '100%' }} onClick={() => setRuleSelectStrategyModalVisible(true)}>
          <PlusOutlined />
          选择策略
        </Button>
        <RuleSelectStrategy
          visible={ruleSelectStrategyModalVisible}
          onVisibleChange={setRuleSelectStrategyModalVisible}
          onGroupEditorChange={onGroupEditorChange}
          fieldIndex={fields.length}
          formListAdd={add}
          branchStrategyList={branchStrategyList}
          setBranchStrategyList={setBranchStrategyList}
          defaultBranchStrategyList={form.getFieldValue('stages')}
        />
      </>
    );
  };

  const groupRender = (add: any) => {
    return readOnly || !visualMode ? null : (
      <GroupModalForm
        title="添加规则阶段"
        trigger={
          <Button style={{ width: '100%' }}>
            <PlusOutlined />
            添加规则阶段
          </Button>
        }
        onFinish={async (values) => {
          add({ ...values });
          onGroupChange();
          return true;
        }}
      />
    );
  };

  return (
    <Form form={form}>
      <Form.Item shouldUpdate>
        <Form.List name="stages">
          {(fields, { add, remove, move }) => {
            const stages = form.getFieldValue('stages');
            return (
              <>
                {fields.map((field, fieldIndex) => {
                  return (
                    <LazyLoad
                      once={false}
                      key={fieldIndex}
                      placeholder={<Placeholder />}
                      debounce={50}
                    >
                      <RuleGroupFormEditor
                        key={fieldIndex}
                        ruleGroup={stages[fieldIndex]}
                        readOnly={readOnly}
                        index={fieldIndex}
                        branchId={branchId}
                        onRemove={() => {
                          remove(fieldIndex);
                          onGroupChange();
                        }}
                        onChange={onGroupEditorChange}
                        codeTheme={codeTheme}
                        branchStrategyList={branchStrategyList}
                        setBranchStrategyList={setBranchStrategyList}
                        visualMode={visualMode}
                        onMove={(sourceIndex, targetIndex) => {
                          move(sourceIndex, targetIndex);
                          onGroupChange();
                        }}
                        strategyItemsCount={fields.length}
                        stages={stages}
                      />
                    </LazyLoad>
                  );
                })}
                <div className="bottom-menu">
                  {strategyRender(fields, add)}
                  {groupRender(add)}
                </div>
              </>
            );
          }}
        </Form.List>
      </Form.Item>
    </Form>
  );
};

export default RuleFormEditor;
