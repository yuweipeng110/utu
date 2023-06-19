import React, { useEffect, useMemo, useRef, useState } from 'react';
import { history, Link } from 'umi';
import { Button, Form, message, Popconfirm, Space, Spin } from 'antd';
import ProForm from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { RuleType } from '@/consts/rule/const';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { StrategyInfo, StrategyRuleInfo } from '@/models/strategy';
import EditRule from '@/pages/app/components/ModalForm/EditRule';
import MonacoEditor from 'react-monaco-editor';
import ProDescriptions, { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import { getStrategyDetail, saveStrategyStable } from '@/services/strategy';
import { StrategyContentType, StrategyType } from '@/consts/strategy/const';
import ViewStrategyCode from '@/pages/app/components/Modal/ViewStrategyCode';
import DiffStrategyList from '@/components/ModalForm/DiffStrategyList';
import { EditorCodeTheme } from '@/utils/func';
import _ from 'lodash';

const EditStrategy: React.ReactNode = (props: { location: { query: any } }) => {
  const {
    location: { query },
  } = props;
  const strategyId = query.id;
  const appId = query.app_id;
  const version = query.version;
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const editorRef = useRef();

  const [editorHeight, setEditorHeight] = useState<number>(0);
  const [strategyType, setStrategyType] = useState<number>(1);
  const [ruleList, setRuleList] = useState<StrategyRuleInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editRuleModalVisible, handleEditRuleModalVisible] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<StrategyRuleInfo>(Object.create(null));
  const [sourceCode, setSourceCode] = useState<string>('');
  const [currentStrategyData, setCurrentStrategyData] = useState<StrategyInfo>(Object.create(null));
  const [strategyContentType, setStrategyContentType] = useState<string>('');
  const [ruleIsView, setRuleIsView] = useState<boolean>(false);
  const [viewStrategyCodeModalVisible, handleViewStrategyCodeModalVisible] =
    useState<boolean>(false);
  const [diffStrategyListModalVisible, setDiffStrategyListModalVisible] = useState<boolean>(false);

  const editRuleModalStatusSwitch = (editRuleModalStatus: boolean, currentEditData?: any) => {
    setCurrentData(currentEditData);
    setRuleIsView(true);
    handleEditRuleModalVisible(editRuleModalStatus);
  };

  const viewStrategyCodeModalStatusSwitch = (viewStrategyCodeModalStatus: boolean) => {
    handleViewStrategyCodeModalVisible(viewStrategyCodeModalStatus);
  };

  const loadStrategyInfo = async () => {
    setIsLoading(true);
    const params: any = {
      strategyId: Number(strategyId),
    };
    if (version) {
      params.baseVersion = Number(version);
    }
    const res = await getStrategyDetail(params);
    setIsLoading(false);
    if (!res) {
      history.push('/error');
      return;
    }
    setCurrentStrategyData(res);
    if (res.upgradedFeature !== null) {
      setDiffStrategyListModalVisible(true);
    }
  };

  useMemo(() => {
    if (!_.isEmpty(currentStrategyData)) {
      setStrategyType(currentStrategyData.type);
      setStrategyContentType(StrategyContentType[currentStrategyData.contentType]);
      setRuleList(_.orderBy(currentStrategyData.params || [], ['index'], ['desc']));
      setSourceCode(currentStrategyData.strategyDetail);
    }
  }, [currentStrategyData]);

  useEffect(() => {
    if (strategyId) {
      loadStrategyInfo();
    }
  }, [strategyId]);

  const onEditorResize = () => {
    // @ts-ignore
    const width = editorRef.current.getLayoutInfo()?.width;
    // @ts-ignore
    const height: number =
      editorRef.current.getContentHeight() <= 300 ? 300 : editorRef.current.getContentHeight();

    // @ts-ignore
    editorRef.current.layout({ width, height });
    setEditorHeight(height);
  };

  const onEditorChange = (value: any, ev: any) => {
    setSourceCode(value);
    onEditorResize();
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    onEditorResize();
  };

  const renderBtn = (record: any) => {
    const viewBtn = (
      <a key="view" onClick={() => editRuleModalStatusSwitch(true, record)}>
        查看
      </a>
    );

    return [viewBtn];
  };

  const saveVersion = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      appId: Number(appId),
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
    };
    setIsLoading(true);
    const res = await saveStrategyStable(params);
    setIsLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功!', key: loadingKey, duration: 2 });
    history.push(`/knowledge/strategy`);
    return true;
  };

  const columns: ProColumns<StrategyRuleInfo>[] = [
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
      dataIndex: 'packageName',
      render: (dom, record) => {
        return (
          <Link to={`/knowledge/package/update?app_id=${record.appId}&id=${record.packageId}`}>
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

  const guideRender = () => {
    return (
      <ProTable<StrategyRuleInfo>
        headerTitle={
          <div>
            <span>规则集</span>
          </div>
        }
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        dataSource={ruleList}
        pagination={{
          pageSize: 10,
        }}
        columns={columns}
      />
    );
  };

  const scriptRender = () => {
    return (
      <ProCard
        title={
          <div>
            <span>规则内容</span>
          </div>
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
            readOnly: true,
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

  const typeContent = strategyContentType && (
    <span style={{ color: 'red' }}>({strategyContentType})</span>
  );

  return (
    <PageContainer>
      <Spin spinning={isLoading} size="large">
        <ProCard
          title={<>策略详情{typeContent}</>}
          headerBordered
          extra={
            <Space>
              {!_.isEmpty(currentStrategyData) && currentStrategyData.strategyDetail && (
                <Button type="primary" onClick={() => viewStrategyCodeModalStatusSwitch(true)}>
                  预览
                </Button>
              )}
              {currentStrategyData.contentType === 1 && (
                <Popconfirm title="确定要保存稳定版本吗？" onConfirm={saveVersion}>
                  <Button type="primary">保存稳定版本</Button>
                </Popconfirm>
              )}
            </Space>
          }
        >
          <ProForm form={form} submitter={false} layout="inline">
            {editRender()}
            <ProCard title={RuleType[strategyType]} headerBordered style={{ paddingTop: 10 }}>
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
          ruleIsView={ruleIsView}
          currentStrategyData={currentStrategyData}
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
        <DiffStrategyList
          visible={diffStrategyListModalVisible}
          onVisibleChange={setDiffStrategyListModalVisible}
          relyonFeatureData={currentStrategyData.upgradedFeature}
          onFinish={() => {
            setDiffStrategyListModalVisible(false);
          }}
        />
      </Spin>
    </PageContainer>
  );
};

export default EditStrategy;
