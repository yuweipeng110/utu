import React, { useEffect, useMemo, useRef, useState } from 'react';
import { history, Link } from 'umi';
import { Form, Spin } from 'antd';
import ProForm from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { RuleType } from '@/consts/rule/const';
import { OfflineStrategyInfo } from '@/models/offlineStrategy';
import MonacoEditor from 'react-monaco-editor';
import ProDescriptions, { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import { getOfflineStrategyDetail } from '@/services/offlineStrategy';
import { OfflineStrategyContentType, OfflineStrategyType } from '@/consts/offlineStrategy/const';
import { EditorCodeTheme } from '@/utils/func';
import CronForm from '@/components/Cron';
import _ from 'lodash';

const OfflineEditStrategy: React.ReactNode = (props: { location: { query: any } }) => {
  const {
    location: { query },
  } = props;
  const strategyId = query.id;
  const appId = query.app_id;
  const version = query.version;
  const [form] = Form.useForm();
  const editorRef: any = useRef();

  const [editorHeight, setEditorHeight] = useState<number>(0);
  const [strategyType, setStrategyType] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sourceCode, setSourceCode] = useState<string>('');
  const [currentStrategyData, setCurrentStrategyData] = useState<OfflineStrategyInfo>(
    Object.create(null),
  );
  const [strategyContentType, setStrategyContentType] = useState<string>('');

  const loadStrategyInfo = async () => {
    setIsLoading(true);
    const params: any = {
      strategyId: Number(strategyId),
    };
    if (version) {
      params.baseVersion = Number(version);
    }
    const res = await getOfflineStrategyDetail(params);
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
      setStrategyContentType(OfflineStrategyContentType[currentStrategyData.contentType]);
      setSourceCode(currentStrategyData.strategyDetail);
    }
  }, [currentStrategyData]);

  useEffect(() => {
    if (strategyId) {
      loadStrategyInfo();
    }
  }, [strategyId]);

  const onEditorResize = () => {
    const width = editorRef.current.getLayoutInfo().width;
    const height: number =
      editorRef.current.getContentHeight() <= 300 ? 300 : editorRef.current.getContentHeight();

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

  const editColumns: ProDescriptionsItemProps<OfflineStrategyInfo>[] = [
    {
      title: '策略名称',
      dataIndex: 'name',
    },
    {
      title: '所属包',
      dataIndex: 'packageName',
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
    {},
    {
      title: '调度配置',
      dataIndex: 'dispatchSetting',
      render: (dom,record) => {
        return (
              <CronForm
                value={record.dispatchSetting}
                disabled={true}
              />
        );
      },
    },
  ];

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
    let viewContent: JSX.Element = scriptRender();
    return viewContent;
  };

  const typeContent = strategyContentType && (
    <span style={{ color: 'red' }}>({strategyContentType})</span>
  );

  return (
    <PageContainer>
      <Spin spinning={isLoading} size="large">
        <ProCard
          title={<>离线策略详情{typeContent}</>}
          headerBordered
        >
          <ProForm form={form} submitter={false} layout="inline">
            {editRender()}
            <ProCard title={RuleType[strategyType]} headerBordered style={{ paddingTop: 10 }}>
              {ruleViewRender()}
            </ProCard>
          </ProForm>
        </ProCard>
      </Spin>
    </PageContainer>
  );
};

export default OfflineEditStrategy;
