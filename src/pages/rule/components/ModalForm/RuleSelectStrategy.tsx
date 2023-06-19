import React, { useEffect, useState } from 'react';
import { useRequest } from 'umi';
import type { ConnectProps } from 'umi';
import { ModalForm, ProFormSelect } from '@ant-design/pro-form';
import { Empty, Form, Spin } from 'antd';
import { queryExistStrategyList } from '@/services/strategy';
import { StrategyInfo, StrategyRuleRelation } from '@/models/strategy';
import TOML from '@iarna/toml';
import { BranchStage } from '@/models/rule';
import { getPageQuery } from '@/utils/utils';
import _ from 'lodash';

export type RuleSelectStrategyProps = {
  visible: any;
  onVisibleChange: any;
  initialValue?: StrategyInfo;
  onGroupEditorChange: any;
  fieldIndex: number;
  formListAdd: any;
  branchStrategyList: StrategyRuleRelation[];
  setBranchStrategyList: (branchStrategyList: StrategyRuleRelation[]) => void;
  defaultBranchStrategyList: BranchStage[];
} & Partial<ConnectProps>;

const RuleSelectStrategy: React.FC<RuleSelectStrategyProps> = (props) => {
  const {
    visible,
    onVisibleChange,
    initialValue,
    onGroupEditorChange,
    fieldIndex,
    formListAdd,
    branchStrategyList,
    setBranchStrategyList,
    defaultBranchStrategyList,
  } = props;
  const [form] = Form.useForm();
  const queryParams = getPageQuery();
  const appId = queryParams.app_id;

  const [strategyOptions, setStrategyOptions] = useState([]);
  const [selectStrategy, setSelectStrategy] = useState(Object.create(null));

  const { loading, run, cancel } = useRequest(queryExistStrategyList, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      const newAssembleBranchStrategyList = branchStrategyList.map((item) => ({
        ...item,
        // id: item.strategyId,
        strategyId: item.id,
      }));
      const list = _.differenceBy(
        _.concat(newAssembleBranchStrategyList, res || []),
        newAssembleBranchStrategyList,
        'name',
      );
      const options: any = res.map((item: any) => {
        return {
          business_data: {
            // strategyId: item.id,
            // strategyVersion: item.stableVersion,
            // stableContent: item.stableContent,
            // name: item.name,
            // strategyContentId: item.strategyContentId,
            // packageName: item.packageName,
            ...item,
            strategyId: item.id,
            strategyVersion: item.stableVersion,
          },
          value: item.id,
          label: !_.isEmpty(item.upgradedFeature) ? (
            <span style={{ color: 'red' }}>
              {item.packageName}|{item.name}({item.description})
            </span>
          ) : (
            `${item.packageName}|${item.name}(${item.description})`
          ),
          // 加title 是为了搜索后鼠标移动上去显示title
          title: `${item.packageName}|${item.name}(${item.description})`,
        };
      });
      const option: any = [...options];
      const newDefaultBranchStrategyList: BranchStage[] = [];
      defaultBranchStrategyList.forEach((item: any) => {
        if (item.rules[0].exec != '\n\n\n\n\n') {
          newDefaultBranchStrategyList.push(item);
        }
      });
      const newOptions = option.filter((item: any) => {
        let flag = false;
        newDefaultBranchStrategyList.forEach((info: any) => {
          if (info.name == item.label) {
            flag = true;
          }
        });
        if (!flag) {
          return item;
        }
      });
      setStrategyOptions(newOptions);
    },
  });

  const handleSearchStrategy = (value: string) => {
    if (value.length === 0) return;
    setStrategyOptions([]);
    run({
      appId,
      name: value,
    });
  };

  useEffect(() => {
    if (visible) {
      setStrategyOptions([]);
      run({
        appId,
      });
    }
  }, [visible]);

  const onFinish = async (values: any) => {
    setBranchStrategyList(
      _.uniqBy(
        [
          ...branchStrategyList,
          {
            strategyIndex: branchStrategyList.length || 0,
            strategyId: selectStrategy.strategyId,
            name: selectStrategy.name,
            strategyContentId: selectStrategy.strategyContentId,
            packageName: selectStrategy.packageName,
            // id: selectStrategy.strategyId,
            // strategyVersion: selectStrategy.strategyVersion,
          },
        ],
        'strategyId',
      ),
    );

    const tomlData = TOML.parse(selectStrategy.stableContent);
    const ruleGroups = tomlData?.stages as BranchStage[];
    // 为了以防万一
    if (ruleGroups) {
      ruleGroups[0] = { packageName: selectStrategy.packageName, ...ruleGroups[0] };
    }
    formListAdd({ ...ruleGroups });
    onGroupEditorChange(fieldIndex, ...ruleGroups);
    return true;
  };

  return (
    <ModalForm
      title="添加策略"
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
      }}
      form={form}
      onFinish={onFinish}
      initialValues={initialValue}
      layout={'horizontal'}
    >
      <ProFormSelect
        name="strategyId"
        label="选择策略"
        width="md"
        showSearch
        options={strategyOptions}
        rules={[
          {
            required: true,
            message: '策略为必填项',
          },
        ]}
        fieldProps={{
          showArrow: true,
          filterOption: false,
          onSearch: (value) => handleSearchStrategy(value),
          onChange: (value, option: any) => {
            if (value) {
              setSelectStrategy(option['business_data']);
            }
          },
          onBlur: cancel,
          onClear: () => {
            run({
              appId,
            });
          },
          onClick: async () => {
            if (!form.getFieldValue('strategyId')) {
              await run({
                appId,
              });
            }
          },
          loading,
          notFoundContent: loading ? <Spin size="small" /> : <Empty />,
        }}
      />
      <p style={{ color: 'red' }}>红色策略引用的特征被修改过，请谨慎使用！</p>
    </ModalForm>
  );
};

export default RuleSelectStrategy;
