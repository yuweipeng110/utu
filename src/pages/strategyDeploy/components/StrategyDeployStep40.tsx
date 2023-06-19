import React, { useState } from 'react';
import { useRequest } from 'umi';
import { Form, Space, Button, Spin, Popconfirm, message } from 'antd';
import ProCard from '@ant-design/pro-card';
import ProForm, {
  ProFormTextArea,
  ProFormSelect,
  ProFormText,
  ProFormRadio,
  ProFormCheckbox,
  ProFormDateTimePicker,
} from '@ant-design/pro-form';
import type { StrategyDeployInfo } from '@/models/strategyDeploy';
import { queryBucUserList } from '@/services/app';
import {
  StrategyDeployRiskLevel,
  StrategyDeployTestResult,
  StrategyDeployChecklist,
} from '@/consts/strategyDeploy/const';
import { appDeployStageHandler } from '@/services/appDeploy';
import { getPageQuery } from '@/utils/utils';
import _ from 'lodash';

export type StrategyDeployStep40Props = {
  setLoading: any;
  currentAppDeployData?: StrategyDeployInfo;
  setRandom?: any;
  // informationParams?: any;
  closeAppDeployRequest?: any;
  stagePrevious?: any;
  stageNext?: any;
  onRefresh?: any;
};

// 泰坦变更
const StrategyDeployStep40: React.FC<StrategyDeployStep40Props> = (props) => {
  const {
    setLoading,
    currentAppDeployData,
    setRandom,
    // informationParams,
    closeAppDeployRequest,
    stagePrevious,
    stageNext,
    onRefresh,
  } = props;
  const queryParams = getPageQuery();
  const appDeployId = queryParams['id'];
  const appId = queryParams['app_id'];
  const initialValues = !_.isEmpty(currentAppDeployData?.changeParam)
    ? {
        themeKey: currentAppDeployData?.changeParam.themeKey,
        riskLevel: currentAppDeployData?.changeParam.riskLevel,
        demand: currentAppDeployData?.changeParam.demand,
        publishTime: currentAppDeployData?.changeParam.publishTime,
        effect: currentAppDeployData?.changeParam.effect,
        testResult: currentAppDeployData?.changeParam.testResult,
        checklist: currentAppDeployData?.changeParam.checklist,
        grayScheme: currentAppDeployData?.changeParam.grayScheme,
        rollbackPlan: currentAppDeployData?.changeParam.rollbackPlan,
        //TODO 判断有没有抄送人  变更review
        reviewer: currentAppDeployData?.changeParam.reviewer
          ? currentAppDeployData?.changeParam.reviewer[0].realNameCn
          : undefined,
        ccPerson: currentAppDeployData?.changeParam.ccPerson
          ? currentAppDeployData?.changeParam.ccPerson[0].realNameCn
          : undefined,
      }
    : {
        riskLevel: 2,
        testResult: 2,
        checklist: [2],
      };
  const [form] = Form.useForm();
  const [bucUserOptions, setBucUserOptions] = useState([]);
  const [reviewerInputVal, setReviewerInputVal] = useState<string>('');
  const [ccPersonInputVal, setCcPersonInputVal] = useState<string>('');
  const formValIsDisabled =
    !_.isEmpty(currentAppDeployData) && !_.isEmpty(currentAppDeployData?.changeParam);

  const { loading, run, cancel } = useRequest(queryBucUserList, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      // const uniqData = _.uniqBy(_.concat(currentAppDeployData?.changeParam.reviewer, res.data), 'empId');
      const options: any = res.data.map((item: any) => {
        const nickName = item.nickName && item.nickName !== 'null' ? `(${item.nickName})` : '';
        const label = `${item.empName}${nickName} - ${item.empId}`;
        const optionLabel = `${item.empName}(${item.empId})`;
        return {
          value: `${item.empId},${item.nickName},${item.empName}`,
          label,
          option_label: optionLabel,
        };
      });
      setBucUserOptions(options);
    },
  });

  const handleSearchBucUser = (value: string) => {
    if (!value) return;
    setBucUserOptions([]);
    run({
      searchParam: value,
    });
  };

  /**
   * 跳过泰坦流程变更
   */
  const stageJump = async (isTitanChange?: number, values?: any) => {
    let ccPersonVal;
    if (!_.isEmpty(values) && _.isArray(values.ccPerson)) {
      ccPersonVal = values.ccPerson.map((item: any) => {
        const ccPersonArr = item.split(',');
        return {
          empId: ccPersonArr[0],
          nickNameCn: ccPersonArr[1],
          realNameCn: ccPersonArr[2],
        };
      });
    }
    let reviewerVal;
    if (!_.isEmpty(values) && _.isArray(values.reviewer)) {
      reviewerVal = values.reviewer.map((item: any) => {
        const reviewerArr = item.split(',');
        return {
          empId: reviewerArr[0],
          nickNameCn: reviewerArr[1],
          realNameCn: reviewerArr[2],
        };
      });
    }
    const titanFormValues = !_.isEmpty(values)
      ? {
          publishChangeParam: {
            ...values,
            ccPerson: ccPersonVal,
            reviewer: reviewerVal,
          },
        }
      : {};
    const tmpIsTitanChange =
      isTitanChange !== -1
        ? {
            isTitanChange: Number(isTitanChange),
          }
        : {};
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交...', key: loadingKey, duration: 0 });
    const params = {
      appId,
      stage: currentAppDeployData?.stage,
      orderId: Number(appDeployId),
      ...tmpIsTitanChange,
      ...titanFormValues,
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

  const onSubmit = async (values: any) => {
    return stageJump(1, values);
  };

  const onFinish = async (values: any) => {
    const success = await onSubmit(values);
    if (!success) {
      return false;
    }
    return true;
  };

  return (
    <ProCard
      title="泰坦变更"
      headerBordered
      extra={
        currentAppDeployData?.originalStage === 350 && (
          <Popconfirm title="确认操作？" onConfirm={closeAppDeployRequest}>
            <Button type="primary">关闭</Button>
          </Popconfirm>
        )
      }
    >
      <ProForm
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 12 }}
        layout="horizontal"
        onFinish={onFinish}
        submitter={{
          render: (props) => {
            if (!_.isEmpty(currentAppDeployData) && currentAppDeployData?.originalStage === 350) {
              if (!_.isEmpty(currentAppDeployData.changeParam)) {
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
                        onClick={() => {
                          stageJump(-1);
                        }}
                      >
                        下一步
                      </Button>
                    </Space>
                  </div>
                );
              }
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
                      onClick={() => {
                        stageJump(0);
                      }}
                    >
                      跳过
                    </Button>
                    <Button type="primary" key="submit" onClick={() => props.form?.submit?.()}>
                      提交
                    </Button>
                  </Space>
                </div>
              );
            }
            return null;
          },
        }}
        initialValues={initialValues}
      >
        <ProFormText
          name="themeKey"
          label="应用名称"
          rules={[
            {
              required: true,
            },
          ]}
          disabled={formValIsDisabled}
        />
        <ProFormRadio.Group
          name="riskLevel"
          label="风险等级"
          options={Object.keys(StrategyDeployRiskLevel).map((key) => {
            return {
              value: Number(key),
              label: StrategyDeployRiskLevel[key],
            };
          })}
          rules={[
            {
              required: true,
            },
          ]}
          disabled={formValIsDisabled}
        />
        <ProFormTextArea
          name="demand"
          label="变更背景及内容"
          rules={[
            {
              required: true,
            },
          ]}
          fieldProps={{
            rows: 2,
          }}
          disabled={formValIsDisabled}
        />
        <ProFormDateTimePicker
          name="publishTime"
          label="上线时间"
          width="sm"
          rules={[
            {
              required: true,
            },
          ]}
          fieldProps={{
            showTime: { format: 'HH:mm' },
            format: 'YYYY-MM-DD HH:mm',
          }}
          disabled={formValIsDisabled}
        />
        <ProFormTextArea
          name="effect"
          label="影响范围"
          rules={[
            {
              required: true,
            },
          ]}
          fieldProps={{
            rows: 2,
          }}
          disabled={formValIsDisabled}
        />
        <ProFormRadio.Group
          name="testResult"
          label="测试结果"
          options={Object.keys(StrategyDeployTestResult).map((key) => {
            return {
              value: Number(key),
              label: StrategyDeployTestResult[key],
            };
          })}
          rules={[
            {
              required: true,
            },
          ]}
          disabled={formValIsDisabled}
        />
        <ProFormCheckbox.Group
          name="checklist"
          label="CheckList"
          options={Object.keys(StrategyDeployChecklist).map((key) => {
            return {
              value: Number(key),
              label: StrategyDeployChecklist[key],
            };
          })}
          rules={[
            {
              required: true,
            },
          ]}
          disabled={formValIsDisabled}
        />
        <ProFormTextArea
          name="grayScheme"
          label="灰度方案"
          rules={[
            {
              required: true,
            },
          ]}
          fieldProps={{
            rows: 2,
          }}
          disabled={formValIsDisabled}
        />
        <ProFormTextArea
          name="rollbackPlan"
          label="回滚方案"
          rules={[
            {
              required: true,
            },
          ]}
          fieldProps={{
            rows: 2,
          }}
          disabled={formValIsDisabled}
        />
        <ProFormSelect
          name="reviewer"
          label="变更review"
          width="lg"
          mode="multiple"
          showSearch
          options={bucUserOptions}
          fieldProps={{
            optionLabelProp: 'option_label',
            showArrow: true,
            filterOption: false,
            searchValue: reviewerInputVal,
            onSearch: (value) => {
              setReviewerInputVal(value);
              handleSearchBucUser(value);
            },
            onChange: (value, option) => {
              setReviewerInputVal('');
              if (!_.isEmpty(value)) {
                form.setFieldsValue({ reviewer: [form.getFieldValue('reviewer')[0]] });
              }
            },
            onBlur: cancel,
            loading,
            notFoundContent: loading ? <Spin size="small" /> : null,
          }}
          disabled={formValIsDisabled}
        />
        <ProFormSelect
          name="ccPerson"
          label="抄送人"
          width="lg"
          mode="multiple"
          showSearch
          options={bucUserOptions}
          fieldProps={{
            optionLabelProp: 'option_label',
            showArrow: true,
            filterOption: false,
            searchValue: ccPersonInputVal,
            onSearch: (value) => {
              setCcPersonInputVal(value);
              handleSearchBucUser(value);
            },
            onChange: (value, option) => {
              setCcPersonInputVal('');
              if (!_.isEmpty(value)) {
                form.setFieldsValue({ ccPerson: [form.getFieldValue('ccPerson')[0]] });
              }
            },
            onBlur: cancel,
            loading,
            notFoundContent: loading ? <Spin size="small" /> : null,
          }}
          disabled={formValIsDisabled}
        />
      </ProForm>
    </ProCard>
  );
};

export default StrategyDeployStep40;
