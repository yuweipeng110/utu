import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect, history, Link, Prompt, useRequest } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { Button, Empty, Form, message, Popconfirm, Space, Spin } from 'antd';
import ProForm, {
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
  ProFormSwitch,
} from '@ant-design/pro-form';
import { InfoCircleTwoTone, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { RuleOpen, RuleType } from '@/consts/rule/const';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { StrategyInfo, StrategyRuleInfo } from '@/models/strategy';
import EditRule from '@/pages/app/components/ModalForm/EditRule';
import MonacoEditor from 'react-monaco-editor';
import ProDescriptions, { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import {
  addStrategy,
  editStrategyDetail,
  resetStrategyContent,
  saveStrategyDraft,
  saveStrategyStable,
  strageyClose,
  getNewVersion,
} from '@/services/strategy';
import { GroupInfo } from '@/models/group';
import type { AppInfo } from '@/models/app';
import { PackageInfo } from '@/models/package';
import { queryPackageList } from '@/services/package';
import { StrategyContentType, StrategyType } from '@/consts/strategy/const';
import { validateString, formatString } from '@/utils/tomlUtils';
import ViewStrategyCode from '@/pages/app/components/Modal/ViewStrategyCode';
import AddPackage from '@/pages/app/components/ModalForm/AddPackage';
import DiffStrategyList from '@/components/ModalForm/DiffStrategyList';
import { EditorCodeTheme } from '@/utils/func';
import { getPageQuery } from '@/utils/utils';
import _ from 'lodash';
import '../index.less';

export type EditStrategyProps = {
  currentApp?: AppInfo;
  currentGroup?: GroupInfo;
} & Partial<ConnectProps>;

const EditStrategy: React.FC<EditStrategyProps> = (props) => {
  const { currentApp, currentGroup } = props;
  const queryParams = getPageQuery();
  const strategyId = queryParams['id'];
  const appId = queryParams['app_id'];
  const packageId = queryParams['package_id'];
  const isCopy = queryParams['is_copy'];
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const editorRef: any = useRef();

  const [editorHeight, setEditorHeight] = useState<number>(0);
  const [strategyType, setStrategyType] = useState<number>(1);
  const [ruleList, setRuleList] = useState<StrategyRuleInfo[]>([]);
  const [ruleListCurrentPage, setRuleListCurrentPage] = useState<number>(1);
  const [ruleListPageSize, setRuleListPageSize] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editRuleModalVisible, handleEditRuleModalVisible] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<StrategyRuleInfo>(Object.create(null));
  const [sourceCode, setSourceCode] = useState<string>('');
  const [currentStrategyData, setCurrentStrategyData] = useState<StrategyInfo>(Object.create(null));
  const [strategyContentType, setStrategyContentType] = useState<string>('');
  const [strategyPackageOption, setStrategyPackageOption] = useState<PackageInfo>(
    Object.create(null),
  );
  const [random, setRandom] = useState<string>('');
  const [tomlError, setTomlError] = useState<string>('');
  const [ruleListError, setRuleListError] = useState<string>('');
  const [viewStrategyCodeModalVisible, handleViewStrategyCodeModalVisible] =
    useState<boolean>(false);
  const [resetDisable, setResetDisable] = useState<boolean>(false);
  const [packageOptions, setPackageOptions] = useState([]);
  // 添加包相关state
  const [editPackageModalVisible, handleEditPackageModalVisible] = useState<boolean>(false);
  const [editPackageTitle, setEditPackageTitle] = useState<string>('');
  const [diffStrategyListModalVisible, setDiffStrategyListModalVisible] = useState<boolean>(false);

  const createButtonDisabled = !_.isEmpty(currentStrategyData) ? false : true;
  const headerTitle = _.isEmpty(currentStrategyData) || isCopy ? '新建策略' : '编辑策略';

  const editPackageModalStatusSwitch = (
    editPackageModalStatus: boolean,
    rowEditPackageTitle: string,
    rowCurrentData?: any,
  ) => {
    setEditPackageTitle(rowEditPackageTitle);
    setCurrentData(rowCurrentData);
    handleEditPackageModalVisible(editPackageModalStatus);
  };

  const editRuleModalStatusSwitch = (editRuleModalStatus: boolean, currentEditData?: any) => {
    setCurrentData(currentEditData);
    handleEditRuleModalVisible(editRuleModalStatus);
  };

  const viewStrategyCodeModalStatusSwitch = (viewStrategyCodeModalStatus: boolean) => {
    handleViewStrategyCodeModalVisible(viewStrategyCodeModalStatus);
  };

  const loadStrategyInfo = async () => {
    setIsLoading(true);
    const res = await editStrategyDetail({
      strategyId,
    });
    setIsLoading(false);
    if (!res) {
      history.push('/error');
      return;
    }
    setResetDisable(res.baseVersion === 0);
    setCurrentStrategyData(res);
    if (!_.isEmpty(res.upgradedFeature)) {
      setDiffStrategyListModalVisible(true);
    }
  };

  useEffect(() => {
    if (!_.isEmpty(currentStrategyData)) {
      setStrategyType(currentStrategyData.type);
      setStrategyContentType(StrategyContentType[currentStrategyData.contentType]);
      setRuleList(
       !_.isEmpty(currentStrategyData.params) && currentStrategyData.params.map((item: any, index: number) => {
          return {
            ...item,
            index,
          };
        }) || [],
      );
      setSourceCode(currentStrategyData.strategyDetail);

      form.setFieldsValue(currentStrategyData);
    }
  }, [currentStrategyData]);

  useMemo(() => {
    setRuleListError('');
  }, [ruleList]);

  useEffect(() => {
    if (strategyId) {
      loadStrategyInfo();
      setTomlError('');
    }
  }, [strategyId, random]);

  const listener = (e: any) => {
    e.preventDefault();
    e.returnValue = '离开当前页后，所编辑的数据将不可恢复'; // 浏览器有可能不会提示这个信息，会按照固定信息提示
  };

  useEffect(() => {
    loadPackageList();

    window.addEventListener('beforeunload', listener);
    return () => {
      window.removeEventListener('beforeunload', listener);
    };
  }, []);

  const loadPackageList = async () => {
    await packageRun({
      pageSize: 10,
      pageIndex: 0,
      appId,
      groupId: currentGroup && currentGroup.groupId,
    });
  };

  const {
    loading: packageLoading,
    run: packageRun,
    cancel: packageCancel,
  } = useRequest(queryPackageList, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      let defaultId = undefined;
      let defaultOption: any;
      const newOptions = res.data.datas.map((item: any) => {
        if (item.name === 'default') {
          defaultId = item.id;
          defaultOption = item;
        }
        return {
          business_data: item,
          value: item.id,
          label: `${item.name}`,
        };
      });
      if (!form.getFieldValue('packageId')) {
        form.setFieldsValue({ packageId: !_.isEmpty(packageId) ? Number(packageId) : defaultId });
      }
      setStrategyPackageOption(defaultOption);
      setPackageOptions(newOptions);
    },
  });

  const handleSearchPackage = (value: string) => {
    if (value.length === 0) return;
    setPackageOptions([]);
    packageRun({
      pageSize: 10,
      pageIndex: 0,
      appId,
      groupId: currentGroup && currentGroup.groupId,
      name: value,
    });
  };

  const onEditorResize = () => {
    const width = editorRef.current.getLayoutInfo()?.width;
    const height: number =
      editorRef.current.getContentHeight() <= 300 ? 300 : editorRef.current.getContentHeight();

    editorRef.current.layout({ width, height });
    setEditorHeight(height);
  };

  const onEditorChange = (value: any, ev: any) => {
    setTomlError('');
    setSourceCode(value);
    onEditorResize();
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    onEditorResize();
  };

  // 一键导入模版，脚本式规则集
  const autoImportTemplate = async () => {
    if (!checkSaveAddStrategyForm() && _.isEmpty(currentStrategyData)) {
      return false;
    }
    const packageName = !_.isEmpty(currentStrategyData)
      ? currentStrategyData.packageName
      : strategyPackageOption.name;
    const name = !_.isEmpty(currentStrategyData)
      ? currentStrategyData.name
      : form.getFieldValue('name');
    const desc = !_.isEmpty(currentStrategyData)
      ? currentStrategyData.description
      : form.getFieldValue('description');
    setSourceCode('');
    const sourceCodeContent = `[[stages]]\npackageName = "${packageName}"\nname = "${name}"\ndesc = "${desc}"\npriority = 1\nexecutor = "SequentialExecutor"\n\n  [[stages.rules]]\n  name = "rule-1"\n  desc = "规则-1"\n  priority = 1\n  executor = "SequentialExecutor"\n  exec = """\n\n\n"""`;
    setSourceCode(sourceCodeContent);
    return true;
  };

  // 删除一条规则集
  const handleDeleteRequest = async (record: any) => {
    const newRuleList = ruleList.filter((item: any) => item.index !== record.index);
    setRuleList(newRuleList);
    return true;
  };

  const renderBtn = (record: any) => {
    const editBtn = (
      <a key="editBtn" onClick={() => editRuleModalStatusSwitch(true, record)}>
        修改
      </a>
    );

    const deleteBtn = (
      <Popconfirm
        title="确定要删除吗？"
        key="deleteBtn"
        onConfirm={() => handleDeleteRequest(record)}
      >
        <a>删除</a>
      </Popconfirm>
    );

    return [editBtn, deleteBtn];
  };

  const onMoveRule = (index1: any, index2: any) => {
    const arr = ruleList;
    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    const newArr = arr.map((item, index) => {
      return {
        ...item,
        index: index,
      };
    });
    setRuleList(newArr);
  };

  const columns: ProColumns<StrategyRuleInfo>[] = [
    {
      title: 'index',
      dataIndex: 'index',
      render: (dom, record) => {
        const moveUpBtn = (
          <Button
            key="moveUpBtn"
            type="link"
            size="small"
            onClick={() => onMoveRule(record.index!, record.index! - 1)}
            disabled={record.index! - 1 < 0}
          >
            上移
          </Button>
        );
        const moveDown = (
          <Button
            key="moveDown"
            type="link"
            size="small"
            onClick={() => onMoveRule(record.index, record.index! + 1)}
            disabled={record.index! + 1 >= ruleList.length - 1}
          >
            下移
          </Button>
        );
        return <Space size="small">{record.index! === 0 ? moveDown : moveUpBtn}</Space>;
      },
    },
    {
      title: '规则名称',
      dataIndex: 'name',
      hideInSearch: true,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      hideInSearch: true,
    },
    {
      title: '是否开启',
      dataIndex: 'open',
      valueEnum: RuleOpen,
      hideInSearch: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: '200px',
      render: (value, record) => renderBtn(record),
    },
  ];

  const editColumns: ProDescriptionsItemProps<StrategyInfo>[] = [
    {
      title: '策略名称',
      dataIndex: 'name',
    },
    {
      title: '所属包',
      dataIndex: 'package',
      render: (dom, record) => {
        return (
          <Link to={`/knowledge/package/update?id=${record.packageId}`}>
            {record.packageName}({record.packageDescription})
          </Link>
        );
      },
    },
    {
      title: '策略类型',
      dataIndex: 'type',
      valueEnum: StrategyType,
    },
    {
      title: '最新版本',
      dataIndex: 'stableVersion',
      render: (dom, record) =>
        record.stableVersion === 0 ? (
          <span style={{ color: 'red' }}>初始版本</span>
        ) : (
          <span style={{ color: 'red' }}>{dom}</span>
        ),
    },
    {
      title: '基线版本',
      dataIndex: 'baseVersion',
      render: (dom, record) =>
        record.baseVersion === 0 ? (
          <span style={{ color: 'red' }}>初始版本</span>
        ) : (
          <span style={{ color: 'red' }}>{dom}</span>
        ),
    },
    {
      title: '内容版本',
      dataIndex: 'contentVersion',
      render: (dom, record) =>
        record.contentVersion === 0 ? (
          <span style={{ color: 'red' }}>初始版本</span>
        ) : (
          <span style={{ color: 'red' }}>{dom}</span>
        ),
    },
    {
      title: '修改人',
      dataIndex: 'strategyUpdateUser',
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
  ];

  // 引导式规则显示内容
  const guideRender = () => {
    return (
      <ProTable<StrategyRuleInfo>
        headerTitle={
          <div>
            <span>规则集</span>
            <span style={{ color: 'red', display: 'block' }}>{ruleListError}</span>
          </div>
        }
        actionRef={actionRef}
        rowKey="index"
        search={false}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => editRuleModalStatusSwitch(true, null)}>
            <PlusOutlined /> 新建规则
          </Button>,
        ]}
        options={false}
        dataSource={ruleList}
        pagination={{
          defaultPageSize: ruleListPageSize,
          current: ruleListCurrentPage,
          onChange: (page, pageSize) => {
            setRuleListCurrentPage(page);
            setRuleListPageSize(pageSize || 10);
          },
          // pageSize: ruleListPageSize,
        }}
        columns={columns}
      />
    );
  };

  // 脚本式规则显示内容
  const scriptRender = () => {
    return (
      <ProCard
        title={
          <div>
            <span>
              规则内容<span style={{ color: 'red' }}>(可一键导入模版)</span>
            </span>
            <span style={{ color: 'red', display: 'block' }}>{tomlError}</span>
          </div>
        }
        extra={
          <Popconfirm
            key="resetBtn"
            title="一键导入模版会替换当前规则内容，确认操作？"
            onConfirm={autoImportTemplate}
          >
            <Button type="primary">一键导入模版</Button>
          </Popconfirm>
        }
        headerBordered
      >
        <MonacoEditor
          value={sourceCode}
          width="100%"
          height={editorHeight}
          onChange={onEditorChange}
          editorDidMount={handleEditorDidMount}
          theme={EditorCodeTheme}
          options={{
            readOnly: false,
            renderWhitespace: 'boundary',
            scrollbar: {
              alwaysConsumeMouseWheel: false,
            },
            scrollBeyondLastLine: false,
          }}
          language="go"
        />
      </ProCard>
    );
  };

  // 创建显示内容
  const createRender = () => {
    return (
      <>
        <ProForm.Group>
          <ProFormSelect
            name="packageId"
            label="所属包"
            width="sm"
            options={packageOptions}
            rules={[
              {
                required: true,
                message: '所属包为必填项',
              },
            ]}
            showSearch
            fieldProps={{
              showArrow: true,
              filterOption: false,
              onSearch: (value) => handleSearchPackage(value),
              onChange: (value, option: any) => {
                if (value) setStrategyPackageOption(option['business_data']);
              },
              onBlur: packageCancel,
              onClear: () => {
                packageRun({
                  pageSize: 10,
                  pageIndex: 0,
                  appId,
                  groupId: currentGroup && currentGroup.groupId,
                });
              },
              loading: packageLoading,
              notFoundContent: packageLoading ? <Spin size="small" /> : <Empty />,
            }}
            initialValue={packageId ? Number(packageId) : undefined}
            disabled={packageId ? true : false}
            addonAfter={
              (_.isEmpty(currentStrategyData) || isCopy) &&
              !packageId && (
                <Space>
                  <Button
                    type="primary"
                    onClick={() => editPackageModalStatusSwitch(true, '新建包')}
                  >
                    <PlusOutlined /> 新建包
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      packageRun({
                        pageSize: 10,
                        pageIndex: 0,
                        appId,
                        groupId: currentGroup && currentGroup.groupId,
                      });
                    }}
                  >
                    刷新
                  </Button>
                </Space>
              )
            }
          />
          <ProFormText
            name="name"
            label="策略名称"
            width="sm"
            rules={[
              {
                required: true,
                message: '策略名称为必填项',
              },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: '仅支持英文、数字、下划线',
              },
            ]}
            tooltip={{
              title: '仅支持英文、数字、下划线',
              icon: <InfoCircleTwoTone />,
            }}
          />
          <ProFormSelect
            name="type"
            label="策略类型"
            width="sm"
            rules={[
              {
                required: true,
                message: '策略类型为必填项',
              },
            ]}
            options={Object.keys(StrategyType).map((key) => {
              return {
                value: Number(key),
                label: StrategyType[key],
              };
            })}
            initialValue={1}
            disabled={!_.isEmpty(packageId)}
          />
          <ProFormTextArea
            name="description"
            label="描述"
            width="md"
            rules={[
              {
                required: true,
                message: '描述为必填项',
              },
            ]}
          />
        </ProForm.Group>
      </>
    );
  };

  // 修改显示内容
  const editRender = () => {
    return (
      <ProDescriptions
        bordered
        column={3}
        title={false}
        dataSource={currentStrategyData}
        columns={editColumns}
        style={{ width: '100%' }}
        size="small"
      />
    );
  };

  // 规则集显示内容
  const ruleViewRender = () => {
    let viewContent: JSX.Element;
    switch (strategyType) {
      case 1:
        viewContent = guideRender();
        break;
      case 2:
        viewContent = scriptRender();
        break;
      default:
        viewContent = guideRender();
        break;
    }
    return viewContent;
  };

  // 改变策略类型控制
  const handleFormChangeValue = () => {
    const paramStrategyType = form.getFieldValue('type');
    setStrategyType(paramStrategyType);
  };

  // 添加策略验证form
  const checkSaveAddStrategyForm = () => {
    const packageId = form.getFieldValue('packageId');
    const name = form.getFieldValue('name');
    const type = form.getFieldValue('type');
    const description = form.getFieldValue('description');
    const packageCheckRules = packageId
      ? {}
      : {
          name: 'packageId',
          errors: ['所属包为必填项'],
        };
    const nameCheckRules = name
      ? {}
      : {
          name: 'name',
          errors: ['策略名称为必填项'],
        };
    const typeCheckRules = type
      ? {}
      : {
          name: 'type',
          errors: ['策略类型为必填项'],
        };
    const descriptionCheckRules = description
      ? {}
      : {
          name: 'description',
          errors: ['描述为必填项'],
        };
    const errorList = [packageCheckRules, nameCheckRules, typeCheckRules, descriptionCheckRules];
    // @ts-ignore
    form.setFields(errorList);
    return !!packageId && !!name && !!type && !!description;
  };

  // 验证规则集列表，引导式规则
  const checkGuideRuleList = () => {
    if (strategyType === 1) {
      if (ruleList.length <= 0) {
        setRuleListError('规则集不能为空！');
        return false;
      }
    }
    return true;
  };

  // 验证规则内容（编辑器），脚本式规则
  const checkScriptSourceCode = () => {
    try {
      if (strategyType === 2) {
        const res = validateString(sourceCode);
        if (res.code !== 1) {
          setTomlError(`${res.message}`);
          return res;
        }
        const obj: any = formatString(sourceCode);
        // 验证name
        const objStagesName = obj.data.stages[0].name;
        let checkNameIsRepeat = false;
        if (!_.isEmpty(objStagesName)) {
          if (!_.isEmpty(currentStrategyData) && objStagesName !== currentStrategyData.name) {
            checkNameIsRepeat = true;
          } else if (
            _.isEmpty(currentStrategyData) &&
            objStagesName !== form.getFieldValue('name')
          ) {
            checkNameIsRepeat = true;
          }
        }
        if (checkNameIsRepeat) {
          setTomlError(`策略名称不一致，请更改name后重试`);
          return { code: -1 };
        }

        // 验证pacakageName
        const objPackageName = obj.data.stages[0].packageName;
        let checkPackageNameIsRepeat = false;
        // if (!_.isEmpty(objPackageName)) {
        if (!_.isEmpty(currentStrategyData) && objPackageName !== currentStrategyData.packageName) {
          checkPackageNameIsRepeat = true;
        } else if (
          _.isEmpty(currentStrategyData) &&
          objPackageName !== strategyPackageOption.name
        ) {
          checkPackageNameIsRepeat = true;
        }
        // }
        if (checkPackageNameIsRepeat) {
          setTomlError(`包名称不一致，请更改packageName后重试`);
          return { code: -1 };
        }
      }
      return { code: 1 };
    } catch (e) {
      setTomlError(e as string);
      return { code: -1 };
    }
  };

  // 添加策略
  const saveAddStrategy = async () => {
    if (
      !checkSaveAddStrategyForm() ||
      !checkGuideRuleList() ||
      checkScriptSourceCode().code !== 1
    ) {
      return false;
    }

    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      appId: Number(appId),
      packageId: form.getFieldValue('packageId'),
      name: form.getFieldValue('name'),
      type: form.getFieldValue('type'),
      description: form.getFieldValue('description'),
      params: ruleList,
      strategyDetail: sourceCode,
      shortCircuitEnable: form.getFieldValue('shortCircuitEnable') ? 1 : 0,
    };
    setIsLoading(true);
    const res = await addStrategy(params);
    setIsLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功!', key: loadingKey, duration: 2 });
    if (!_.isEmpty(packageId)) {
      history.push(
        `/knowledge/strategy/update?app_id=${appId}&id=${res.data}&package_id=${packageId}`,
      );
      return true;
    }
    history.push(`/knowledge/strategy/update?app_id=${appId}&id=${res.data}`);
    setRandom((Math.random() * 1000000).toFixed(0));
    return true;
  };

  // 策略-保存草稿
  const saveDraft = async () => {
    if (!checkGuideRuleList() || checkScriptSourceCode().code !== 1) {
      return false;
    }
    //TOML.stringify(formatString(sourceCode).data as JsonMap)
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      appId: Number(appId),
      packageId: Number(form.getFieldValue('packageId')),
      strategyId: Number(strategyId),
      name: currentStrategyData.name,
      strategyType: currentStrategyData.type,
      baseVersion: currentStrategyData.baseVersion,
      contentVersion: currentStrategyData.contentVersion,
      contentType: currentStrategyData.type,
      contentId: currentStrategyData.contentId,
      createUser: currentStrategyData.contentCreateUser,
      description: currentStrategyData.description,
      params: ruleList,
      strategyDetail: sourceCode,
      shortCircuitEnable: form.getFieldValue('shortCircuitEnable') ? 1 : 0,
    };
    setIsLoading(true);
    const res = await saveStrategyDraft(params);
    setIsLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功!', key: loadingKey, duration: 2 });
    setRandom((Math.random() * 1000000).toFixed(0));
    return true;
  };

  // 策略-保存稳定版本
  const saveVersion = async () => {
    if (!checkGuideRuleList() || checkScriptSourceCode().code !== 1) {
      return false;
    }
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      appId: Number(appId),
      packageId: Number(form.getFieldValue('packageId')),
      strategyId: Number(strategyId),
      name: currentStrategyData.name,
      strategyType: currentStrategyData.type,
      baseVersion: currentStrategyData.baseVersion,
      contentVersion: currentStrategyData.contentVersion,
      contentType: currentStrategyData.type,
      contentId: currentStrategyData.contentId,
      createUser: currentStrategyData.contentCreateUser,
      description: currentStrategyData.description,
      params: ruleList,
      strategyDetail: sourceCode,
      shortCircuitEnable: form.getFieldValue('shortCircuitEnable') ? 1 : 0,
    };
    setIsLoading(true);
    const res = await saveStrategyStable(params);
    setIsLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功!', key: loadingKey, duration: 2 });
    if (!_.isEmpty(packageId)) {
      history.push(`/knowledge/package/update?app_id=${appId}&id=${packageId}`);
      return true;
    }
    history.push(`/knowledge/strategy`);
    return true;
  };

  const whetherClose = async () => {
    if (!checkGuideRuleList() || checkScriptSourceCode().code !== 1) {
      return false;
    }
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在关闭...', key: loadingKey, duration: 0 });
    const params = {
      contentId: currentStrategyData.contentId,
    };
    setIsLoading(true);
    const res = await strageyClose(params);
    setIsLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '关闭成功!', key: loadingKey, duration: 2 });
    history.push(`/knowledge/strategy`);
    return true;
  };

  // 策略-加载最新版本
  const queryNewVersion = async () => {
    if (!checkGuideRuleList() || checkScriptSourceCode().code !== 1) {
      return false;
    }
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在加载...', key: loadingKey, duration: 0 });
    const params = {
      strategyId: Number(strategyId),
    };
    setIsLoading(true);
    const res = await getNewVersion(params);
    setIsLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }

    message.success({ content: '加载成功!', key: loadingKey, duration: 2 });
    history.go(0);
    return true;
  };

  const resetting = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在重置...', key: loadingKey, duration: 0 });
    const params = {
      strategyId: Number(strategyId),
      strategyType: currentStrategyData.type,
      stableVersion: currentStrategyData.stableVersion,
      contentId: currentStrategyData.contentId,
    };
    setIsLoading(true);
    const res = await resetStrategyContent(params);
    setIsLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '重置成功!', key: loadingKey, duration: 2 });
    setRandom((Math.random() * 1000000).toFixed(0));
    return true;
  };

  const typeContent = strategyContentType && (
    <span style={{ color: 'red' }}>({strategyContentType})</span>
  );

  return (
    <PageContainer>
      <Spin spinning={isLoading} size="large">
        <ProCard
          title={
            <>
              <div style={{ float: 'left' }}>{headerTitle}</div>
              {!isCopy && <div style={{ float: 'left' }}>{typeContent}</div>}
            </>
          }
          headerBordered
          extra={
            <Space>
              {!_.isEmpty(currentStrategyData) && !isCopy && currentStrategyData.strategyDetail && (
                <Button type="primary" onClick={() => viewStrategyCodeModalStatusSwitch(true)}>
                  预览
                </Button>
              )}
              {(_.isEmpty(currentStrategyData) || isCopy) && (
                <Button type="primary" onClick={saveAddStrategy}>
                  保存草稿
                </Button>
              )}
              {!_.isEmpty(currentStrategyData) &&
                currentStrategyData.stableVersion !== currentStrategyData.baseVersion && (
                  <Popconfirm
                    title="确定要关闭吗？"
                    onConfirm={whetherClose}
                    disabled={createButtonDisabled}
                  >
                    <Button type="primary" danger disabled={createButtonDisabled}>
                      关闭
                    </Button>
                  </Popconfirm>
                )}
              {!_.isEmpty(currentStrategyData) &&
                currentStrategyData.stableVersion !== currentStrategyData.baseVersion && (
                  <Popconfirm
                    title="确定要加载最新版本版本吗？"
                    onConfirm={queryNewVersion}
                    disabled={createButtonDisabled}
                  >
                    <Button type="primary" disabled={createButtonDisabled}>
                      加载最新版本
                    </Button>
                  </Popconfirm>
                )}
              {!_.isEmpty(currentStrategyData) && !isCopy && (
                <>
                  <Button type="primary" onClick={saveDraft} disabled={createButtonDisabled}>
                    保存草稿
                  </Button>
                  <Button type="primary" onClick={saveVersion} disabled={createButtonDisabled}>
                    发布策略
                  </Button>
                  <Popconfirm
                    title="确定要重置吗？"
                    onConfirm={resetting}
                    disabled={createButtonDisabled ? createButtonDisabled : resetDisable}
                  >
                    <Button disabled={createButtonDisabled ? createButtonDisabled : resetDisable}>
                      重置
                    </Button>
                  </Popconfirm>
                </>
              )}
            </Space>
          }
        >
          <ProForm
            form={form}
            onValuesChange={handleFormChangeValue}
            submitter={false}
            // layout="inline"
            initialValues={currentStrategyData ? { shortCircuitEnable: true } : currentStrategyData}
          >
            {_.isEmpty(currentStrategyData) || isCopy ? createRender() : editRender()}
            <ProCard
              title={
                <>
                  {RuleType[strategyType]}
                  <span style={{ color: 'red' }}>(新建/修改.规则 需保存策略后生效)</span>
                </>
              }
              headerBordered
              style={{ paddingTop: 10 }}
              extra={
                <>
                  {strategyType === 1 && (
                    <ProFormSwitch
                      name="shortCircuitEnable"
                      label="是否短路"
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                      tooltip={{
                        title: '开启时，当按照规则优先级执行时，命中一个规则时会停止执行其他规则',
                        icon: <InfoCircleTwoTone />,
                      }}
                    />
                  )}
                </>
              }
            >
              {ruleViewRender()}
            </ProCard>
          </ProForm>
        </ProCard>
        <EditRule
          actionRef={actionRef}
          visible={editRuleModalVisible}
          onVisibleChange={handleEditRuleModalVisible}
          ruleList={ruleList}
          setRuleList={setRuleList}
          currentData={currentData}
          setIsLoading={setIsLoading}
          setRuleListCurrentPage={setRuleListCurrentPage}
          ruleListPageSize={ruleListPageSize}
          currentStrategyData={currentStrategyData}
          saveDraft={saveDraft}
          saveAddStrategy={saveAddStrategy}
          strategyName={
            !_.isEmpty(currentStrategyData) ? currentStrategyData.name : form.getFieldValue('name')
          }
          packageId={
            !_.isEmpty(currentStrategyData)
              ? currentStrategyData.packageId
              : form.getFieldValue('packageId')
          }
          loadStrategyInfo={loadStrategyInfo}
        />
        <ViewStrategyCode
          visible={viewStrategyCodeModalVisible}
          onVisibleChange={handleViewStrategyCodeModalVisible}
          currentStrategyData={currentStrategyData}
        />
        <AddPackage
          actionRef={actionRef}
          title={editPackageTitle}
          visible={editPackageModalVisible}
          onVisibleChange={handleEditPackageModalVisible}
          loadPackageList={loadPackageList}
        />
        <DiffStrategyList
          visible={diffStrategyListModalVisible}
          onVisibleChange={setDiffStrategyListModalVisible}
          relyonFeatureData={currentStrategyData.upgradedFeature}
          onFinish={() => {
            setDiffStrategyListModalVisible(false);
          }}
        />
        <Prompt
          when={true}
          message={(location, action) => {
            if (action === 'POP') {
              return `离开当前页后，所编辑的数据将不可恢复`;
            }
            return true;
          }}
        />
      </Spin>
    </PageContainer>
  );
};

export default connect(({ app, user }: ConnectState) => ({
  currentApp: app.currentApp,
  currentGroup: app.currentGroup,
}))(EditStrategy);
