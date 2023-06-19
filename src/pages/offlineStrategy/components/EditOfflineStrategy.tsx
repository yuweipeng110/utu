import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect, history, Link, useRequest } from 'umi';
import type { ConnectProps } from 'umi';
import { ConnectState } from '@/models/connect';
import { Button, Empty, Form, message, Popconfirm, Popover, Space, Spin } from 'antd';
import ProForm, { ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-form';
import { InfoCircleTwoTone, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { RuleType } from '@/consts/rule/const';
import { ActionType } from '@ant-design/pro-table';
import { OfflineStrategyInfo } from '@/models/offlineStrategy';
import ProDescriptions, { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import {
  addOfflineStrategy,
  editOfflineStrategyDetail,
  resetOfflineStrategyContent,
  saveOfflineStrategyDraft,
  saveOfflineStrategyStable,
  offlineStrageyClose,
  getOfflineNewVersion,
} from '@/services/offlineStrategy';
import { GroupInfo } from '@/models/group';
import { AppInfo } from '@/models/app';
import { PackageInfo } from '@/models/package';
import { queryPackageList } from '@/services/package';
import { OfflineStrategyContentType, OfflineStrategyType } from '@/consts/offlineStrategy/const';
import AddPackage from '@/pages/app/components/ModalForm/AddPackage';
import CronForm from '@/components/Cron';
import MonacoEditor from 'react-monaco-editor';
import { EditorCodeTheme } from '@/utils/func';
import _ from 'lodash';

export type EditOfflineStrategyProps = {
  location: any;
  currentApp?: AppInfo;
  currentGroup?: GroupInfo;
} & Partial<ConnectProps>;

const EditOfflineStrategy: React.FC<EditOfflineStrategyProps> = (props) => {
  const {
    location: { query },
    currentApp,
    currentGroup,
  } = props;
  const strategyId = query.id;
  const appId = query.app_id;
  const packageId = query.package_id;
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const editorRef: any = useRef();

  const [editorHeight, setEditorHeight] = useState<number>(0);
  const [strategyType, setStrategyType] = useState<number>(2);
  const [cronValue, setCronValue] = useState<string>('0 10 * * * ? *');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [currentData, setCurrentData] = useState<StrategyRuleInfo>(Object.create(null));
  const [sourceCode, setSourceCode] = useState<string>('');
  const [currentStrategyData, setCurrentStrategyData] = useState<OfflineStrategyInfo>(
    Object.create(null),
  );
  const [offlineStrategyContentType, setOfflineStrategyContentType] = useState<string>('');
  const [strategyPackageOption, setStrategyPackageOption] = useState<PackageInfo>(
    Object.create(null),
  );
  const [random, setRandom] = useState<string>('');
  const [tomlError, setTomlError] = useState<string>('');
  const [resetDisable, setResetDisable] = useState<boolean>(false);
  const [packageOptions, setPackageOptions] = useState([]);
  // 添加包相关state
  const [editPackageModalVisible, handleEditPackageModalVisible] = useState<boolean>(false);
  const [editPackageTitle, setEditPackageTitle] = useState<string>('');

  const createButtonDisabled = !_.isEmpty(currentStrategyData) ? false : true;
  const headerTitle = _.isEmpty(currentStrategyData) ? '新建离线策略' : '编辑离线策略';

  const editPackageModalStatusSwitch = (
    editPackageModalStatus: boolean,
    rowEditPackageTitle: string,
  ) => {
    setEditPackageTitle(rowEditPackageTitle);
    handleEditPackageModalVisible(editPackageModalStatus);
  };

  const loadStrategyInfo = async () => {
    setIsLoading(true);
    const res = await editOfflineStrategyDetail({
      strategyId,
    });
    res.baseVersion === 0 ? setResetDisable(true) : setResetDisable(false);
    setIsLoading(false);
    if (!res) {
      history.push('/error');
      return;
    }
    setCurrentStrategyData(res);
  };

  useMemo(() => {
    if (!_.isEmpty(currentStrategyData)) {
      setStrategyType(currentStrategyData.type);
      !_.isEmpty(currentStrategyData.dispatchSetting) &&
        setCronValue(currentStrategyData.dispatchSetting);
      setOfflineStrategyContentType(OfflineStrategyContentType[currentStrategyData.contentType]);
      setSourceCode(currentStrategyData.strategyDetail);
    }
  }, [currentStrategyData]);

  useEffect(() => {
    if (strategyId) {
      loadStrategyInfo();
      setTomlError('');
    }
  }, [strategyId, random]);

  useEffect(() => {
    if (Number(currentApp?.id) !== Number(appId)) {
      message.error('应用发生改变，请重新选择策略');
      history.push('/knowledge/offlineStrategy');
    }
  }, [currentApp]);

  useEffect(() => {
    loadPackageList();
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
      form.setFieldsValue({ packageId: !_.isEmpty(packageId) ? Number(packageId) : defaultId });
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
    setSourceCode('');
    const sourceCodeContent = `order_dt!='' and amap_order_id!=''`;
    setSourceCode(sourceCodeContent);
    return true;
  };

  const editColumns: ProDescriptionsItemProps<OfflineStrategyInfo>[] = [
    {
      title: '策略名称',
      dataIndex: 'name',
    },
    {
      title: '所属包',
      dataIndex: 'package',
      render: (dom, record) => {
        return (
          <Link to={`/knowledge/package/update?app_id=${appId}&id=${record.packageId}`}>
            {record.packageName}({record.packageDescription})
          </Link>
        );
      },
    },
    {
      title: '策略类型',
      dataIndex: 'type',
      valueEnum: OfflineStrategyType,
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

  // 脚本式规则显示内容
  const scriptRender = () => {
    return (
      <ProCard
        title={
          <div>
            <span>
              规则内容<span style={{ color: 'red' }}>(可一键导入模版)</span>&nbsp;
              <Popover content="脚本语法：参考SQL中的WHERE条件语法，多个特征之间用AND连接">
                <QuestionCircleOutlined style={{ cursor: 'pointer' }} />
              </Popover>
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
                setStrategyPackageOption(option);
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
              onClick: async () => {
                if (!form.getFieldValue('packageId')) {
                  await packageRun({
                    pageSize: 10,
                    pageIndex: 0,
                    appId,
                    groupId: currentGroup && currentGroup.groupId,
                  });
                }
              },
              loading: packageLoading,
              notFoundContent: packageLoading ? <Spin size="small" /> : <Empty />,
            }}
            initialValue={packageId ? Number(packageId) : undefined}
            disabled={packageId}
            addonAfter={
              _.isEmpty(currentStrategyData) &&
              !packageId && (
                <Button type="primary" onClick={() => editPackageModalStatusSwitch(true, '新建包')}>
                  <PlusOutlined /> 新建包
                </Button>
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
                pattern: /^[a-zA-Z0-9-_]+$/,
                message: '仅支持英文、数字、中横线、下划线',
              },
            ]}
            tooltip={{
              title: '仅支持英文、数字、中横线、下划线',
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
            options={Object.keys(OfflineStrategyType).map((key) => {
              return {
                value: Number(key),
                label: OfflineStrategyType[key],
              };
            })}
            initialValue={2}
            disabled
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
        <ProForm.Group>
          <ProFormText
            name="dispatchSetting"
            label="调度配置"
            width="sm"
            placeholder=""
            rules={[
              {
                required: true,
                message: '调度配置为必填项',
              },
            ]}
            fieldProps={{
              value: cronValue,
            }}
            // initialValue={cronValue}
            disabled
          />
          <div style={{ paddingTop: 30 }}>
            <CronForm
              value={cronValue}
              onChange={(value) => {
                setCronValue(value);
              }}
            />
          </div>
        </ProForm.Group>
      </>
    );
  };

  // 修改显示内容
  const editRender = () => {
    return (
      <>
        <ProDescriptions
          bordered
          column={3}
          title={false}
          dataSource={currentStrategyData}
          columns={editColumns}
          style={{ width: '100%' }}
          size="small"
        />
        <ProForm.Group style={{ paddingTop: 30 }}>
          <ProFormText
            // name="dispatchSetting"
            label="调度配置"
            width="sm"
            placeholder=""
            rules={[
              {
                required: true,
                message: '调度配置为必填项',
              },
            ]}
            fieldProps={{
              value: cronValue,
            }}
            // initialValue={cronValue}
            disabled
          />
          <div style={{ paddingTop: 30 }}>
            <CronForm
              value={cronValue}
              onChange={(value) => {
                setCronValue(value);
              }}
            />
          </div>
        </ProForm.Group>
      </>
    );
  };

  // 规则集显示内容
  const ruleViewRender = () => {
    let viewContent: JSX.Element = scriptRender();
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

  // 验证规则内容（编辑器），脚本式规则
  const checkScriptSourceCode = () => {
    try {
      if (strategyType === 2) {
        if (sourceCode.length <= 0) {
          setTomlError(`规则内容不能为空`);
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
    if (!checkSaveAddStrategyForm() || checkScriptSourceCode().code !== 1) {
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
      strategyDetail: sourceCode,
      dispatchSetting: cronValue,
    };
    setIsLoading(true);
    const res = await addOfflineStrategy(params);
    setIsLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功!', key: loadingKey, duration: 2 });
    if (!_.isEmpty(packageId)) {
      history.push(
        `/knowledge/offlineStrategy/update?id=${res.data}&app_id=${appId}&package_id=${packageId}`,
      );
      return true;
    }
    history.push(`/knowledge/offlineStrategy/update?id=${res.data}&app_id=${appId}`);
    setRandom((Math.random() * 1000000).toFixed(0));
    return true;
  };

  // 策略-保存草稿
  const saveDraft = async () => {
    if (checkScriptSourceCode().code !== 1) {
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
      strategyDetail: sourceCode,
      dispatchSetting: cronValue,
    };
    setIsLoading(true);
    const res = await saveOfflineStrategyDraft(params);
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
    if (checkScriptSourceCode().code !== 1) {
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
      strategyDetail: sourceCode,
      dispatchSetting: cronValue,
    };
    setIsLoading(true);
    const res = await saveOfflineStrategyStable(params);
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
    history.push(`/knowledge/offlineStrategy`);
    return true;
  };

  const whetherClose = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在关闭...', key: loadingKey, duration: 0 });
    const params = {
      contentId: currentStrategyData.contentId,
    };
    setIsLoading(true);
    const res = await offlineStrageyClose(params);
    setIsLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '关闭成功!', key: loadingKey, duration: 2 });
    history.push(`/knowledge/offlineStrategy`);
    return true;
  };

  // 策略-加载最新版本
  const queryNewVersion = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在加载...', key: loadingKey, duration: 0 });
    const params = {
      strategyId: Number(strategyId),
    };
    setIsLoading(true);
    const res = await getOfflineNewVersion(params);
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
    const res = await resetOfflineStrategyContent(params);
    setIsLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '重置成功!', key: loadingKey, duration: 2 });
    setRandom((Math.random() * 1000000).toFixed(0));
    return true;
  };

  const typeContent = offlineStrategyContentType && (
    <span style={{ color: 'red' }}>({offlineStrategyContentType})</span>
  );

  return (
    <PageContainer>
      <Spin spinning={isLoading} size="large">
        <ProCard
          title={
            <>
              <div style={{ float: 'left' }}>{headerTitle}</div>
              <div style={{ float: 'left' }}>{typeContent}</div>
            </>
          }
          headerBordered
          extra={
            <Space>
              {_.isEmpty(currentStrategyData) && (
                <Button type="primary" onClick={saveAddStrategy}>
                  保存为草稿
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
              {!_.isEmpty(currentStrategyData) && (
                <Button type="primary" onClick={saveDraft} disabled={createButtonDisabled}>
                  保存为草稿
                </Button>
              )}
              {!_.isEmpty(currentStrategyData) && (
                <Button type="primary" onClick={saveVersion} disabled={createButtonDisabled}>
                  试运行并保存
                </Button>
              )}
              {!_.isEmpty(currentStrategyData) && (
                <Popconfirm
                  title="确定要重置吗？"
                  onConfirm={resetting}
                  disabled={createButtonDisabled ? createButtonDisabled : resetDisable}
                >
                  <Button disabled={createButtonDisabled ? createButtonDisabled : resetDisable}>
                    重置
                  </Button>
                </Popconfirm>
              )}
            </Space>
          }
        >
          <ProForm
            form={form}
            onValuesChange={handleFormChangeValue}
            submitter={false}
            // layout="inline"
          >
            {!_.isEmpty(currentStrategyData) ? editRender() : createRender()}
            <ProCard
              title={
                <>
                  {RuleType[strategyType]}
                  <span style={{ color: 'red' }}>(新建/修改.规则 需保存策略后生效)</span>
                </>
              }
              headerBordered
              style={{ paddingTop: 10 }}
            >
              {ruleViewRender()}
            </ProCard>
          </ProForm>
        </ProCard>
        <AddPackage
          actionRef={actionRef}
          title={editPackageTitle}
          visible={editPackageModalVisible}
          onVisibleChange={handleEditPackageModalVisible}
          loadPackageList={loadPackageList}
        />
      </Spin>
    </PageContainer>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
  currentGroup: app.currentGroup,
}))(EditOfflineStrategy);
