import React, { useMemo } from 'react';
import { Button, Form, Popconfirm, Tooltip } from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CloseOutlined,
  CodeFilled,
  CodeOutlined,
  PlusOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons';
import type { BranchStage } from '@/models/rule';
import RuleItemFormEditor from './RuleItemFormEditor';
import { StrategyRuleRelation } from '@/models/strategy';
import LazyLoad from 'react-lazyload';
import Placeholder from '../LazyLoad/Placeholder';
import ItemModalForm from '../ModalForm/ItemModalForm';
import _ from 'lodash';
import '../../index.less';

export type groupFormEditorProps = {
  readOnly: boolean;
  index: number;
  ruleGroup: BranchStage;
  branchId: number;
  onChange: (index: number, ruleGroup: any) => void;
  onRemove: (index: number) => void;
  codeTheme?: string;
  branchStrategyList: StrategyRuleRelation[];
  setBranchStrategyList: (branchStrategyList: StrategyRuleRelation[]) => void;
  visualMode: boolean;
  onMove: (sourceIndex: number, targetIndex: number) => void;
  strategyItemsCount: number;
  stages: any;
};

const RuleGroupFormEditor: React.FC<groupFormEditorProps> = (props) => {
  const {
    readOnly,
    index,
    ruleGroup,
    onChange,
    onRemove,
    codeTheme,
    branchStrategyList,
    setBranchStrategyList,
    visualMode,
    onMove,
    strategyItemsCount,
    stages,
  } = props;
  const [form] = Form.useForm();

  const onRuleItemEditorChange = (itemIndex: number, item: any) => {
    const items = form.getFieldValue('rules');
    const newItem = { ...items[itemIndex], ...item };
    items[itemIndex] = newItem;
    form.setFieldsValue({ rules: [...items] });
    onChange(index, { ...ruleGroup, rules: items });
  };

  const onRuleItemChange = () => {
    const items = form.getFieldValue('rules');
    onChange(index, { ...ruleGroup, rules: items });
  };

  const onCardCollapsed = (itemIndex: number, collapsed: boolean) => {
    const items = form.getFieldValue('rules');
    items[itemIndex].collapsed = collapsed;
    onChange(index, { ...ruleGroup, rules: items });
  };

  const renderCollapsedBtn = () => {
    const rules = form.getFieldValue('rules');
    const rulesLength = _.findIndex(rules, { collapsed: true });
    if (rulesLength !== -1) {
      return (
        <Tooltip title="展开当前策略" placement="bottom">
          <Button
            className="right-button"
            onClick={() => {
              form.getFieldValue('rules').forEach((item: any) => {
                // eslint-disable-next-line no-param-reassign
                item.collapsed = false;
              });
              onRuleItemChange();
            }}
          >
            <CodeOutlined />
          </Button>
        </Tooltip>
      );
    }

    return (
      <Tooltip title="收起当前策略" placement="bottom">
        <Button
          className="right-button"
          onClick={() => {
            form.getFieldValue('rules').forEach((item: any) => {
              // eslint-disable-next-line no-param-reassign
              item.collapsed = true;
            });
            onRuleItemChange();
          }}
        >
          <CodeFilled />
        </Button>
      </Tooltip>
    );
  };

  useMemo(() => {
    form.setFieldsValue(ruleGroup); // 回显
  }, [ruleGroup]);

  const ruleRender = (rules: any, add: any) => {
    return readOnly || !visualMode ? null : (
      <ItemModalForm
        title={`添加规则`}
        trigger={
          <Button type="dashed">
            <PlusOutlined />
            添加规则
          </Button>
        }
        onFinish={async (values) => {
          const name = rules ? `rule-${rules.length + 1}` : `rule-1`;
          await add({ name, ...values });
          onRuleItemChange();
          return true;
        }}
      />
    );
  };

  return (
    <div className="rule-group-item" key={index}>
      <div className="title">
        <span className="left">{`[阶段${index + 1}] ${ruleGroup.packageName || 'default'} - ${ruleGroup.name} - ${ruleGroup.desc}`}</span>
        {readOnly ? null : (
          <>
            <Tooltip title="删除当前策略" placement="bottom">
              <Popconfirm
                title="确定要删除吗？"
                key="2"
                onConfirm={async () => {
                  let repeatCount = 0;
                  for (let idx = 0; idx < stages.length; idx += 1) {
                    const stage = { ...stages[idx] };
                    if (ruleGroup.name === stage.name && ruleGroup.packageName === stage.packageName) {
                      repeatCount++;
                    }
                  }
                  if (repeatCount <= 1) {
                    const newBranchStrategyList = branchStrategyList.filter((item: any) => {
                      if (!item.packageName) {
                        return item.name !== ruleGroup.name;
                      }
                      return (
                        item.name !== ruleGroup.name || item.packageName !== ruleGroup.packageName
                      );
                    });
                    setBranchStrategyList(newBranchStrategyList);
                  }
                  onRemove(index);
                }}
              >
                <Button type="text" className="right-button">
                  <CloseOutlined />
                </Button>
              </Popconfirm>
            </Tooltip>
            <Tooltip title="上移" placement="bottom">
              <Button
                disabled={index === 0}
                onClick={() => {
                  onMove(index, index - 1);
                }}
                className="right-button"
              >
                <ArrowUpOutlined />
              </Button>
            </Tooltip>
            <Tooltip title="下移" placement="bottom">
              <Button
                onClick={() => {
                  onMove(index, index + 1);
                }}
                disabled={strategyItemsCount === index + 1}
                className="right-button"
              >
                <ArrowDownOutlined />
              </Button>
            </Tooltip>
            <Tooltip title="移到首位" placement="bottom">
              <Button
                disabled={index === 0}
                onClick={() => {
                  onMove(index, 0);
                }}
                className="right-button"
              >
                <VerticalAlignTopOutlined />
              </Button>
            </Tooltip>
            {renderCollapsedBtn()}
          </>
        )}
      </div>
      <div className="content">
        <Form form={form}>
          <Form.Item name="rules_item" shouldUpdate>
            <Form.List name="rules">
              {(fields, { add, remove, move }) => {
                const rules = form.getFieldValue('rules');
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
                          <RuleItemFormEditor
                            key={fieldIndex}
                            ruleItem={rules[fieldIndex]}
                            onChange={onRuleItemEditorChange}
                            index={fieldIndex}
                            readOnly={readOnly}
                            itemsCount={fields.length}
                            onMove={(sourceIndex, targetIndex) => {
                              move(sourceIndex, targetIndex);
                              onRuleItemChange();
                            }}
                            onDelete={() => {
                              remove(fieldIndex);
                              onRuleItemChange();
                            }}
                            onCardCollapsed={onCardCollapsed}
                            codeTheme={codeTheme}
                            visualMode={visualMode}
                          />
                        </LazyLoad>
                      );
                    })}
                    <div className="bottom-menu">{ruleRender(rules, add)}</div>
                  </>
                );
              }}
            </Form.List>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default RuleGroupFormEditor;
