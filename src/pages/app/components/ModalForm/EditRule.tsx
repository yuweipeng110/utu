import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect, useRequest } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { Button, Col, Form, Mentions, message, Popconfirm, Row, Spin } from 'antd';
import ProForm, {
  ProFormText,
  ProFormTextArea,
  ProFormCheckbox,
  ProFormDigit,
  ModalForm,
  ProFormSelect,
} from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';
import { previewRule, searchFeature } from '@/services/strategy';
import { GroupInfo } from '@/models/group';
import { AppInfo } from '@/models/app';
import { StrategyRuleInfo } from '@/models/strategy';
import { CloseOutlined, InfoCircleTwoTone, ThunderboltTwoTone } from '@ant-design/icons';
import MonacoEditor from 'react-monaco-editor';
import { EditorCodeTheme } from '@/utils/func';
import { FeatureDataZhType, FeaturePropertiesType } from '@/consts/feature/const';
import {
  RuleOptionBoolOperator,
  RuleOptionFloatOperator,
  RuleOptionNumberOperator,
  RuleOptionStringOperator,
  RuleType,
} from '@/consts/rule/const';
import RuleTableForm from '@/pages/app/components/RuleTableForm';
import ActionForm from '@/pages/app/components/Form/ActionForm';
import { queryActionList } from '@/services/action';
import { FeatureProperties } from '@/models/featureConfig';
import { StrategyInfo } from '@/models/strategy';
import { getPageQuery } from '@/utils/utils';
import _ from 'lodash';
import '../../index.less';

const { Option } = Mentions;

type OptionType = {
  label: string;
  value: string;
};

export type EditRuleProps = {
  actionRef: any;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  ruleList: any;
  setRuleList: (ruleList: any) => void;
  currentData?: StrategyRuleInfo;
  setIsLoading: (isLoading: boolean) => void;
  setRuleListCurrentPage?: any;
  ruleListPageSize: number;
  ruleIsView?: boolean;
  currentStrategyData: StrategyInfo;
  saveDraft: any;
  saveAddStrategy: any;
  strategyName: string;
  packageId: number;
  loadStrategyInfo: any;
  currentGroup?: GroupInfo;
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const EditRule: React.FC<EditRuleProps> = (props) => {
  const {
    actionRef,
    visible,
    onVisibleChange,
    ruleList,
    setRuleList,
    currentData,
    setIsLoading,
    setRuleListCurrentPage,
    ruleListPageSize,
    ruleIsView,
    currentStrategyData,
    saveDraft,
    saveAddStrategy,
    strategyName,
    packageId,
    loadStrategyInfo,
    currentGroup,
    currentApp,
  } = props;
  const queryParams = getPageQuery();
  const isCopy = queryParams['is_copy'];
  const [form] = Form.useForm();
  const modalCancelFlag = useRef<boolean>(false);
  const initialValues = !_.isEmpty(currentData)
    ? { ...currentData }
    : { priority: ruleList ? ruleList.length + 1 : 1 };

  const [dataSource, setDataSource] = useState([]);
  const [options, setOptions] = useState<OptionType[]>([]);
  const [isShowSenior, setIsShowSenior] = useState<boolean>(true);
  const [isShowPreview, setIsShowPreview] = useState<boolean>(false);
  const [previewSourceCode, setPreviewSourceCode] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [ruleTableLoading, setRuleTableLoading] = useState<boolean>(true);
  // const [actionList, setActionList] = useState([]);
  // 动作相关state
  const [actionOptions, setActionOptions] = useState<OptionType[]>([]);
  const [leftActionList, setLeftActionList] = useState([]);
  const [rightActionList, setRightActionList] = useState([]);
  const [elseActionIsShow, setElseActionIsShow] = useState<boolean>(true);
  const [customIfActionIsShow, setCustomIfActionIsShow] = useState<boolean>(false);
  const [customElseActionIsShow, setCustomElseActionIsShow] = useState<boolean>(false);
  // 条件相关state
  const [conditionsPrefix, setConditionsPrefix] = useState<string>('');
  // loading
  const [modalIsLoading, setModalIsLoading] = useState<boolean>(false);
  const [isSave, setIsSave] = useState<boolean>(false);
  const conditionsKeywordList = {
    A: ['AND'],
    O: ['OR'],
    N: ['NOT'],
    ' ': ['AND', 'OR', 'NOT'],
  };

  const loadPreviewCondition = async () => {
    const strategyIdObj = !_.isEmpty(currentStrategyData)
      ? { strategyId: currentStrategyData?.strategyId }
      : {};
    setPreviewLoading(true);
    const res = await previewRule({
      ...strategyIdObj,
      appId: currentApp && currentApp.id,
      name: strategyName,
      packageId,
      params: [
        {
          name: form.getFieldValue('name'),
          // leftType: form.getFieldValue('leftType'),
          description: form.getFieldValue('description'),
          open: form.getFieldValue('open') ? 1 : 0,
          priority: form.getFieldValue('priority'),
          conditions: form.getFieldValue('conditions'),
          leftActionParams: leftActionList,
          rightActionParams: rightActionList,
          ruleContents: formatRuleData(dataSource),
          action: form.getFieldValue('action'),
          elseAction: form.getFieldValue('elseAction'),
        },
      ],
    });
    setPreviewLoading(false);
    if (res.code !== 1) {
      setIsShowPreview(false);
      message.error(res.message);
      return false;
    }
    setPreviewSourceCode(res.data.scriptContent);
    return true;
  };

  const importPlaceholder = () => {
    const conditionsVal = dataSource.map((item: any) => item.placeholder).join('  ');
    form.setFieldsValue({ conditions: conditionsVal });
  };

  const isShowPreviewStatusSwitch = () => {
    setIsShowPreview(!isShowPreview);
    setPreviewSourceCode('');
    if (!isShowPreview) {
      loadPreviewCondition();
    }
  };

  const getFeaturePropertiesOptions = (featureProperties: FeatureProperties[]) => {
    if (featureProperties) {
      return featureProperties.map((itemProperties: any) => {
        return {
          ...itemProperties,
          label: `${itemProperties.name}${itemProperties.desc ? `(${itemProperties.desc})` : ''}|${FeaturePropertiesType[itemProperties.type]
            }`,
          value: itemProperties.name,
          option_label: `${itemProperties.desc ? `${itemProperties.desc}|` : ''}${FeaturePropertiesType[itemProperties.type]
            }`,
        };
      });
    }
    return [];
  };

  const loadFeatureListData = async () => {
    const res = await searchFeature({
      appId: currentApp && currentApp.id,
    });
    if (res && res.data && res.data.length > 0) {
      let laterFeList: any = res.data;
      if (!_.isEmpty(currentData)) {
        const processedRuleContentsLeft = currentData?.ruleContents.map((item: any) => {
          if (item.leftType !== 5) {
            return {
              featureName: item.leftVal,
              featureType: item.leftType,
              featureDesc: item.leftDesc,
              featureProperties: item.featureProperties,
            };
          }
          return false;
        });
        const processedRuleContentsRight = currentData?.ruleContents.map((item: any) => {
          // 是特征列表里面的
          if (item.rightType !== 5 && item.source === 1) {
            return {
              featureName: item.rightVal,
              featureType: item.rightType,
              featureDesc: item.rightDesc,
              featureProperties: item.featureProperties,
            };
          }
          return false;
        });
        laterFeList = _.uniqBy(
          _.compact(res.data.concat(processedRuleContentsLeft.concat(processedRuleContentsRight))),
          'featureName',
        );
      }
      const options = laterFeList.map((item: any) => {
        let label =
          item.featureType <= 5
            ? `${item.featureName}(${item.featureDesc || ''})|${FeatureDataZhType[item.featureType]
            }`
            : item.expressionStructParam
              ? `${item.featureName}(${item.featureDesc || ''})|${FeatureDataZhType[item.expressionStructParam.resultType]
              }`
              : item.featureDesc;
        let optionLabel =
          item.featureType <= 5
            ? `${item.featureDesc || ''}|${FeatureDataZhType[item.featureType]}`
            : item.expressionStructParam
              ? `${item.featureDesc || ''}|${FeatureDataZhType[item.expressionStructParam.resultType]
              }`
              : item.featureDesc;
        return {
          ...item,
          label,
          value: item.featureName,
          option_label: optionLabel,
          // featureType: item.featureType,
          // featureDesc: item.featureDesc,
          featureProperties: getFeaturePropertiesOptions(item.params),
          ...item.expressionStructParam, //函数类型/聚合类型
        };
      });
      setOptions(options);
      return true;
    }
    return false;
  };

  const { loading, run, cancel, params } = useRequest(searchFeature, {
    debounceInterval: 300,
    manual: true,
    formatResult: (res) => {
      const currentOptions = res.data.map((item: any) => {
        let label =
          item.featureType <= 5
            ? `${item.featureName}(${item.featureDesc || ''})|${FeatureDataZhType[item.featureType]
            }`
            : item.expressionStructParam
              ? `${item.featureName}(${item.featureDesc || ''})|${FeatureDataZhType[item.expressionStructParam.resultType]
              }`
              : item.featureDesc;
        return {
          ...item,
          label,
          value: item.featureName,
          // featureType: item.featureType,
          // featureDesc: item.featureDesc,
          featureProperties: getFeaturePropertiesOptions(item.params),
          ...item.expressionStructParam, //函数类型/聚合类型
          // expression: item.expression,
          // dependenceList: item.dependenceList,
          // resultType: item.resultType,
        };
      });
      const tmpDataSource: any = dataSource.map((data: any, index) => {
        if (index === params[0].index && params[0].searchType === 'leftSearch') {
          return {
            ...data,
            leftOptions: currentOptions,
            // rightOptions: currentOptions.filter((item: any) => item.featureType === data.leftType),
          };
        }
        if (index === params[0].index && params[0].searchType === 'rightSearch') {
          return {
            ...data,
            rightOptions: currentOptions,
          };
        }
        return data;
      });
      setDataSource(tmpDataSource);
    },
  });

  const handleSearchLeftVal = (
    value: string,
    index: number,
    searchType: string,
    leftType?: number,
  ) => {
    // if (!value) return;
    run({
      keywords: value,
      appId: currentApp && currentApp.id,
      type: leftType,
      index: Number(index),
      searchType,
    });
  };

  const {
    loading: actionLoading,
    run: actionRun,
    cancel: actionCancel,
  } = useRequest(queryActionList, {
    debounceInterval: 300,
    manual: true,
    formatResult: (res) => {
      const options = res.data.datas.map((item: any) => {
        return {
          label: item.name,
          value: item.id,
          action_id: item.id,
          action_name: item.name,
          function_name: item.param.functionName,
          action_type: item.type,
          param_list: item.param.paramList,
        };
      });
      setActionOptions(options);
    },
  });

  // 初始化/回显，动作数据
  const initActionDataList = async () => {
    if (!_.isEmpty(currentData)) {
      // action 回显
      setLeftActionList(currentData?.leftActionParams || []);
      if (currentData?.leftActionParams) {
        form.setFieldsValue({
          leftActionList: currentData?.leftActionParams.map((item: any) => item.actionId),
        });
      }
      setRightActionList(currentData?.rightActionParams || []);
      if (currentData?.rightActionParams) {
        form.setFieldsValue({
          rightActionList: currentData?.rightActionParams.map((item: any) => item.actionId),
        });
      }
      // 自定义动作回显
      setCustomIfActionIsShow(!_.isEmpty(currentData?.action));
      setCustomElseActionIsShow(!_.isEmpty(currentData?.elseAction));
      setElseActionIsShow(false);
    }
  };

  const refreshCurrent = async () => {
    setModalIsLoading(true);
    // 加载动作列表
    await actionRun({
      groupId: currentGroup && currentGroup.groupId,
      appId: currentApp && currentApp.id,
      pageSize: 10,
      pageIndex: 0,
    });
    await initActionDataList();
    // 加载特征列表
    const loadFeatureData = await loadFeatureListData();
    if (!loadFeatureData) {
      setRuleTableLoading(false);
    }
    setModalIsLoading(false);
  };

  // useEffect(() => {
  //   if (visible) {
  //     refreshCurrent()
  //   }
  // }, [visible]);

  useEffect(() => {
    if (visible) {
      modalCancelFlag.current = false;
      refreshCurrent();
    } else {
      closeClearData();
    }
    // if (visible && ruleIsView) {
    //   setElseActionIsShow(false);
    // }
  }, [visible, ruleIsView]);

  const getOptionTypeByLeftType = (leftType: number | null, option: string) => {
    let optionType;
    switch (leftType) {
      case 1:
        RuleOptionStringOperator.map((item: any) => {
          if (item.value === option) {
            optionType = item.option_type;
          }
        });
        break;
      case 2:
        RuleOptionNumberOperator.map((item: any) => {
          if (item.value === option) {
            optionType = item.option_type;
          }
        });
        break;
      case 3:
        RuleOptionFloatOperator.map((item: any) => {
          if (item.value === option) {
            optionType = item.option_type;
          }
        });
        break;
      case 4:
        RuleOptionBoolOperator.map((item: any) => {
          if (item.value === option) {
            optionType = item.option_type;
          }
        });
        break;
      default:
        optionType = 2;
        break;
    }
    return optionType;
  };

  const initRuleDataList = async () => {
    let currentRuleList;
    if (visible && !_.isEmpty(currentData)) {
      currentRuleList = currentData?.ruleContents.map((item: any) => {
        let currentLeftType = item.leftType || 0;
        options.map((option: any) => {
          if (option.value === item.leftVal) {
            currentLeftType = option.featureType;
            return;
          }
        });
        let currentRightType = item.rightType || 0;
        options.map((option: any) => {
          if (option.value === item.rightVal) {
            currentRightType = option.featureType;
            return;
          }
        });
        return {
          ...item,
          id: (Math.random() * 1000000).toFixed(0),
          leftOptions: options,
          leftType: currentLeftType,
          leftPropertiesOption: getFeaturePropertiesOptions(item.leftProperties),
          rightOptions: options,
          rightType: currentRightType,
          rightPropertiesOption: getFeaturePropertiesOptions(item.rightProperties),
          option: item.source === 1 ? `#${item.option}` : item.option,
          optionType: item.optionType || getOptionTypeByLeftType(item.leftType, item.option),
        };
      });
    } else if (visible) {
      currentRuleList = [
        {
          id: (Math.random() * 1000000).toFixed(0),
          leftOptions: options,
          index: 0,
          placeholder: '$1',
          leftVal: undefined,
          leftType: 0,
          leftDesc: '',
          option: undefined,
          optionType: 1,
          rightVal: undefined,
          rightType: 0,
          rightDesc: '',
          rightOptions: options,
          source: 0,
        },
      ];
    }

    if (visible) {
      setRuleTableLoading(true);
      setDataSource(currentRuleList);
      setRuleTableLoading(false);
    }
  };

  useMemo(() => {
    initRuleDataList();
  }, [options]);

  const checkUserRepeat = (name: string) => {
    let isRepeat = false;
    ruleList.map((rule: any) => {
      if (rule.name === name) {
        isRepeat = true;
        return;
      }
    });
    return isRepeat;
  };

  const formatRuleData = (data: any) => {
    if (!data) {
      return data;
    }

    const newRules = [];
    for (let idx1 = 0; idx1 < data.length; idx1 += 1) {
      const newRule = { ...data[idx1] };
      delete newRule.id;
      delete newRule.leftOptions;
      delete newRule.rightOptions;
      delete newRule.leftPropertiesOption;
      delete newRule.rightPropertiesOption;
      delete newRule.leftValTwo;
      delete newRule.rightValTwo;
      delete newRule.leftExpression;
      // delete newRule.leftResultType;
      delete newRule.leftDependenceList;
      newRule.nullValueHandle = newRule.nullValueHandle === '-1' ? null : newRule.nullValueHandle;
      if (newRule.option && newRule.option.indexOf('#') >= 0) {
        newRule.option = newRule.option.replace('#', '');
      }
      newRules[idx1] = newRule;
    }
    return newRules;
  };

  //规则集自动跳转分页
  const autoJumpPage = () => {
    const dataCount: number = ruleList.length + 1;
    let pageCount = Number(dataCount / ruleListPageSize);
    if (dataCount % ruleListPageSize > 0) {
      pageCount++;
    }
    setRuleListCurrentPage(Number(Math.floor(pageCount)));
  };

  const onSubmit = async (values: any) => {
    if (!currentData && checkUserRepeat(values.name)) {
      message.error('策略下规则名称不可重复！');
      return;
    }

    const params = {
      ...values,
    };
    const newStrategyRule = {
      // id: (Math.random() * 1000000).toFixed(0),
      index: !currentData ? ruleList.length + 1 : currentData?.index,
      name: params.name,
      description: params.description,
      open: params.open ? 1 : 0,
      priority: params.priority,
      leftType: params.leftType,
      conditions: params.conditions,
      action: params.action,
      elseAction: params.elseAction,
      // actionParams: actionList === null ? [] : actionList,
      leftActionParams: leftActionList === null ? [] : leftActionList,
      rightActionParams: rightActionList === null ? [] : rightActionList,
      ruleContents: formatRuleData(dataSource),
    };
    setIsLoading(true);
    const tmpRuleList = !currentData
      ? [...ruleList, newStrategyRule]
      : ruleList.map((item: any) => {
        if (item.index === currentData?.index) {
          return {
            ...item,
            ...newStrategyRule,
          };
        }
        return item;
      });
    setRuleList(tmpRuleList);
    setIsLoading(false);
    autoJumpPage();
    setIsSave(true);
    message.success('保存规则成功，保存草稿或稳定版本后规则生效！');
    return true;
  };

  useEffect(() => {
    if (!_.isEmpty(ruleList) && isSave) {
      !_.isEmpty(currentStrategyData) && !isCopy ? saveDraft() : saveAddStrategy();
      setIsSave(false);
    }
  }, [ruleList, isSave]);

  const onFinish = async (values: any) => {
    const success = await onSubmit(values);
    if (!success) {
      return false;
    }
    onVisibleChange(false);
    setIsShowPreview(false);
    if (actionRef.current) {
      actionRef.current.reload();
    }
    return true;
  };

  const viewCondition = (isDisplay: boolean) => {
    return (
      <span style={{ display: isDisplay ? 'none' : '' }}>
        <Form.Item
          name="conditions"
          label="条件"
          rules={[
            { required: true, message: '条件不能为空!' },
            {
              pattern: /\$|\d|\(.+\)|\&\&|\|\|/,
              message: '条件输入错误',
            },
          ]}
        >
          <Mentions
            rows={3}
            placeholder="例如：$1 AND ($2 OR $3)"
            prefix={['A', 'O', 'N', ' ']}
            split=""
            onSearch={(text, prefix) => {
              setConditionsPrefix(prefix);
            }}
            disabled={ruleIsView}
          >
            {(conditionsKeywordList[conditionsPrefix.toUpperCase()] || []).map((value: any) => {
              return (
                <>
                  <Option key={value} value={value.replace(conditionsPrefix, '')}>
                    <div>
                      <ThunderboltTwoTone /> {value}{' '}
                      <span style={{ color: '#909090' }}>关键字</span>
                    </div>
                  </Option>
                </>
              );
            })}
          </Mentions>
        </Form.Item>
        <RuleTableForm
          ruleTableLoading={ruleTableLoading}
          form={form}
          options={options}
          isView={ruleIsView}
          isShowSenior={isShowSenior}
          data={dataSource}
          setData={setDataSource}
          handleSearchLeftVal={handleSearchLeftVal}
          searchLeftValCancel={cancel}
          searchLeftValLoading={loading}
        />
      </span>
    );
  };

  const previewCondition = () => {
    return (
      <Spin spinning={previewLoading}>
        <MonacoEditor
          value={previewSourceCode}
          width="100%"
          height={380}
          theme={EditorCodeTheme}
          options={{
            readOnly: true,
            renderWhitespace: 'boundary',
            scrollbar: {
              alwaysConsumeMouseWheel: false,
            },
            minimap: {
              enabled: false,
            },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
          language="go"
        />
        {viewCondition(true)}
      </Spin>
    );
  };

  const guideRender = () => {
    return (
      <Col span={24}>
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <ProCard
              title="命中条件"
              bordered
              size="small"
              style={{ maxHeight: '745px' }}
              id="my-condition-card"
              extra={[
                !isShowPreview && !ruleIsView && (
                  <Button
                    key="importPlaceholder"
                    size="small"
                    shape="round"
                    type={'primary'}
                    onClick={() => importPlaceholder()}
                    style={{ marginRight: '5px' }}
                  >
                    导入占位符
                  </Button>
                ),
                // !isShowPreview && (
                //   <Button
                //     key="senior"
                //     size="small"
                //     shape="round"
                //     type={isShowSenior ? 'primary' : 'default'}
                //     onClick={() => setIsShowSenior(!isShowSenior)}
                //     style={{ marginRight: '5px' }}
                //   >
                //     高级
                //   </Button>
                // ),
                // <Button
                //   key="preview"
                //   size="small"
                //   shape="round"
                //   type={isShowPreview ? 'primary' : 'default'}
                //   onClick={() => isShowPreviewStatusSwitch()}
                // >
                //   预览
                // </Button>,
              ]}
            >
              {isShowPreview ? previewCondition() : viewCondition(false)}
            </ProCard>
          </Col>
        </Row>
      </Col>
    );
  };

  const closeClearData = () => {
    setDataSource([]);
    setOptions([]);
    setIsShowPreview(false);
    setRuleTableLoading(true);
    setElseActionIsShow(true);
    setLeftActionList([]);
    setRightActionList([]);
    setCustomIfActionIsShow(false);
    setCustomElseActionIsShow(false);
    if (!_.isEmpty(currentStrategyData)) loadStrategyInfo();
  };

  const cancelConfirm = (isIcon: boolean) => (
    <Popconfirm
      title="离开当前页后，所编辑的数据将不可恢复"
      onConfirm={() => {
        onVisibleChange(false);
        modalCancelFlag.current = true;
      }}
      onCancel={() => {
        form.resetFields();
        onVisibleChange(true);
        modalCancelFlag.current = false;
      }}
      okText="确认"
      cancelText="取消"
    >
      {isIcon ? <CloseOutlined /> : <Button key="cancelBtn">取消</Button>}
    </Popconfirm>
  );

  return (
    <div id="my-rule-modal">
      <ModalForm
        title="编辑规则"
        visible={visible}
        onVisibleChange={(visibleValue) => {
          form.resetFields();
          onVisibleChange(visibleValue);
        }}
        form={form}
        onFinish={onFinish}
        initialValues={initialValues}
        onKeyPress={() => { }}
        width={'95%'}
        layout="horizontal"
        submitter={{
          render: (props, defaultDoms) => {
            return [
              ruleIsView ? (
                <Button key="close" onClick={() => onVisibleChange(false)}>
                  关闭
                </Button>
              ) : (
                <>
                  {cancelConfirm(false)}
                  <Button
                    key="cancelBtn"
                    type="primary"
                    onClick={async () => {
                      props.submit();
                    }}
                  >
                    保存草稿
                  </Button>
                </>
              ),
            ];
          },
        }}
        modalProps={{
          maskClosable: false,
          getContainer: document.getElementById('my-rule-modal'),
          onCancel: () => {
            if (modalCancelFlag.current) {
              modalCancelFlag.current = false;
              return;
            }
            form.resetFields();
            onVisibleChange(true);
            modalCancelFlag.current = false;
            return;
          },
          closeIcon: ruleIsView ? (
            <CloseOutlined
              onClick={() => {
                onVisibleChange(false);
                modalCancelFlag.current = true;
              }}
              style={{ cursor: 'pointer' }}
            />
          ) : (
            cancelConfirm(true)
          ),
        }}
      >
        <Spin spinning={modalIsLoading}>
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Row gutter={[8, 8]}>
                <Col span={20}></Col>
                <Col span={4}>
                  <Button
                    key="preview"
                    size="small"
                    shape="round"
                    type={isShowPreview ? 'primary' : 'default'}
                    onClick={() => isShowPreviewStatusSwitch()}
                    style={{ float: 'right' }}
                  >
                    预览
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <ProCard title="基本" bordered size="small">
                    <ProForm.Group>
                      <ProFormText
                        name="name"
                        label="规则名称"
                        width="sm"
                        placeholder="请输入名称"
                        rules={[
                          { required: true, message: '名称不能为空!' },
                          {
                            pattern: /^[a-zA-Z0-9-_]+$/,
                            message: '仅支持英文、数字、中横线、下划线',
                          },
                        ]}
                        initialValue={`rule-${ruleList ? ruleList.length + 1 : 1}`}
                        disabled={ruleIsView}
                      />
                      <ProFormSelect
                        name="type"
                        label="规则类型"
                        width="sm"
                        rules={[{ required: true, message: '规则类型不能为空!' }]}
                        options={Object.keys(RuleType).map((key) => {
                          return {
                            value: Number(key),
                            label: RuleType[key],
                          };
                        })}
                        initialValue={1}
                        disabled
                      />
                      <ProFormTextArea
                        name="description"
                        label="规则描述"
                        width="sm"
                        placeholder="请输入描述"
                        rules={[{ required: true, message: '描述不能为空!' }]}
                        disabled={ruleIsView}
                      />
                    </ProForm.Group>
                  </ProCard>
                </Col>
                <Col span={12}>
                  <ProCard title="属性" bordered size="small">
                    <ProForm.Group>
                      <ProFormCheckbox
                        name="open"
                        label="是否开启"
                        rules={[{ required: true, message: '开启状态不能为空!' }]}
                        initialValue={1}
                        disabled={ruleIsView}
                      />
                      <ProFormDigit
                        name="priority"
                        label="优先级"
                        width="xs"
                        min={1}
                        max={999}
                        rules={[{ required: true, message: '优先级不能为空!' }]}
                        tooltip={{
                          title: '优先级会影响规则的执行顺序',
                          icon: <InfoCircleTwoTone />,
                        }}
                        disabled={ruleIsView}
                      />
                    </ProForm.Group>
                  </ProCard>
                </Col>
              </Row>
            </Col>
            {guideRender()}
            <Col span={24}>
              <ProCard
                title="动作"
                bordered
                size="small"
                extra={[
                  <Button
                    key="showElseAction"
                    size="small"
                    shape="round"
                    type={!elseActionIsShow ? 'primary' : 'default'}
                    onClick={() => setElseActionIsShow(!elseActionIsShow)}
                    style={{ marginRight: '5px' }}
                  >
                    未命中动作
                  </Button>,
                ]}
              >
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <ActionForm
                      actionName={'命中动作'}
                      formName={'leftActionList'}
                      actionList={leftActionList}
                      onActionItemChange={setLeftActionList}
                      ruleIsView={ruleIsView || false}
                      actionIsShow={false}
                      setActionIsShow={setElseActionIsShow}
                      actionOptions={actionOptions}
                      setActionOptions={setActionOptions}
                      actionLoading={actionLoading}
                      actionRun={actionRun}
                      actionCancel={actionCancel}
                      customActionIsShow={customIfActionIsShow}
                      setCustomActionIsShow={setCustomIfActionIsShow}
                    />
                    {customIfActionIsShow && (
                      <ProFormTextArea name="action" label="自定义命中动作" disabled={ruleIsView} />
                    )}
                  </Col>
                  <Col span={12}>
                    <ActionForm
                      actionName={'未命中动作'}
                      formName={'rightActionList'}
                      actionList={rightActionList}
                      onActionItemChange={setRightActionList}
                      ruleIsView={ruleIsView || false}
                      actionIsShow={elseActionIsShow}
                      setActionIsShow={setElseActionIsShow}
                      actionOptions={actionOptions}
                      setActionOptions={setActionOptions}
                      actionLoading={actionLoading}
                      actionRun={actionRun}
                      actionCancel={actionCancel}
                      customActionIsShow={customElseActionIsShow}
                      setCustomActionIsShow={setCustomElseActionIsShow}
                    />
                    {!elseActionIsShow && customElseActionIsShow && (
                      <ProFormTextArea
                        name="elseAction"
                        label="自定义未命中动作"
                        disabled={ruleIsView}
                      />
                    )}
                  </Col>
                </Row>
              </ProCard>
            </Col>
          </Row>
        </Spin>
      </ModalForm>
    </div>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
  currentGroup: app.currentGroup,
}))(EditRule);
