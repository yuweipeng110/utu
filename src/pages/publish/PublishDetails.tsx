import React, { useEffect, useMemo, useState } from 'react';
import { connect, history } from 'umi';
import type { ConnectProps } from 'umi';
import { ConnectState } from '@/models/connect';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import { Button, Card, Form, message, Popconfirm, Space, Spin, Steps, Typography } from 'antd';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import type { PublishDetail, PublishInfo } from '@/models/publish';
import ProTable from '@ant-design/pro-table';
import { PublishDetailAction } from '@/consts/publish/const';
import { closePublishOrder, queryPublishOrder, startPublishOrder } from '@/services/publish';
import { getPageQuery } from '@/utils/utils';
import { CurrentUser } from '@/models/user';
import { RuleBranchType } from '@/consts/const';
import { ReportItem } from '@/models/report';
import { queryReportList } from '@/services/report';
import RuleDiffModal from '@/pages/rule/components/Modal/RuleDiffModal';
import _ from 'lodash';
import './index.less';

const { Text } = Typography;
const { Step } = Steps;

export type PublishBaseProps = {
  currentUser?: CurrentUser;
} & Partial<ConnectProps>;

const PublishBase: React.FC<PublishBaseProps> = (props) => {
  const { currentUser } = props;
  const [form] = Form.useForm();
  const queryParams = getPageQuery();
  const publishOrderId = queryParams.publish_order_id;
  const { source } = queryParams;
  const appId = queryParams.app_id;
  const sceneId = queryParams.scene_id;
  const experimentId = queryParams.experiment_id;

  const [loading, setLoading] = useState<boolean>(false);
  const [publishData, setPublishData] = useState<Partial<PublishInfo>>(Object.create(null));
  const [stepsObj, setStepsObj] = useState({
    stepsCurrent: 0,
    stepsStatus: 'process',
    stepFlowTitle: '待审批',
    stepStatusTitle: '已关闭',
    startDisabled: false,
    closeDisabled: false,
  });
  const [diffModalVisible, setDiffModalVisible] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<PublishDetail>(Object.create(null));

  const diffModelSwitch = (modalStatus: boolean, rowCurrentData: any) => {
    setCurrentData(rowCurrentData);
    setDiffModalVisible(modalStatus);
  };

  const handleStepsRelation = (status: number) => {
    let tmpStepsCurrent;
    let tmpStepFlowTitle;
    let tmpStepStatusTitle;
    let tmpStepsStatus;
    let tmpStartDisabled;
    let tmpCloseDisabled;
    switch (status) {
      case 0:
        tmpStepsCurrent = 1;
        tmpStepStatusTitle = '发布成功';
        tmpStepFlowTitle = '待审批';
        break;
      case 200:
        tmpStepsCurrent = 2;
        tmpStepStatusTitle = '发布成功';
        tmpStepFlowTitle = '已审批';
        break;
      case 400:
        tmpStepsCurrent = 3;
        tmpStepsStatus = 'finish';
        tmpStepStatusTitle = '发布成功';
        tmpStepFlowTitle = '已审批';
        tmpStartDisabled = true;
        tmpCloseDisabled = true;
        break;
      case 600:
        tmpStepsCurrent = 3;
        tmpStepsStatus = 'error';
        tmpStepStatusTitle = '发布失败';
        tmpStepFlowTitle = '待审批';
        tmpStartDisabled = true;
        tmpCloseDisabled = true;
        break;
      case 800:
        tmpStepsCurrent = 3;
        tmpStepsStatus = 'finish';
        tmpStepStatusTitle = '已关闭';
        tmpStepFlowTitle = '待审批';
        tmpStartDisabled = true;
        tmpCloseDisabled = true;
        break;
      case 1000:
        tmpStepsCurrent = 0;
        tmpStepStatusTitle = '已关闭';
        tmpStepFlowTitle = '待审批';
        break;
      default:
        tmpStepsCurrent = 0;
        tmpStepsStatus = 'process';
        break;
    }
    if (currentUser?.userInfo !== publishData.createUser) {
      tmpStartDisabled = true;
      // tmpCloseDisabled = true;
    }
    const tmpStepsObj: any = {
      stepsCurrent: tmpStepsCurrent,
      stepsStatus: tmpStepsStatus,
      stepStatusTitle: tmpStepStatusTitle,
      stepFlowTitle: tmpStepFlowTitle,
      startDisabled: tmpStartDisabled,
      closeDisabled: tmpCloseDisabled,
    };
    setStepsObj(tmpStepsObj);
  };

  const loadPublishData = async () => {
    const res = await queryPublishOrder({
      publishOrderId,
      appId,
      sceneId,
    });
    if (res.code && res.code === -1) {
      history.push('/error');
      return;
    }
    const { data } = res;
    setPublishData(data);
  };

  const refreshCurrent = async () => {
    setLoading(true);
    await loadPublishData();
    setLoading(false);
  };

  useEffect(() => {
    refreshCurrent();
  }, []);

  useMemo(() => {
    if (!_.isEmpty(publishData)) {
      handleStepsRelation(publishData.status as number);
    }
  }, [publishData]);

  const handleStartPublishRequest = async () => {
    if (!handleFormChangeValue()) {
      return false;
    }
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在发布...', key: loadingKey, duration: 0 });
    const params = {
      publishOrderId,
      appId,
      sceneId,
      source,
      id: experimentId,
      remark: form.getFieldValue('remark'),
    };
    setLoading(true);
    handleStepsRelation(200);
    const res = await startPublishOrder(params);
    setLoading(false);
    refreshCurrent();
    if (res.code !== 1) {
      message.error({ content: `发布失败：${res.message}`, key: loadingKey, duration: 2 });
      return false;
    }
    await refreshCurrent();
    message.success({ content: '发布成功', key: loadingKey, duration: 2 });
    return true;
  };

  const handleClosePublishRequest = async () => {
    if (!handleFormChangeValue()) {
      return false;
    }
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在关闭...', key: loadingKey, duration: 0 });
    const params = {
      publishOrderId,
      appId,
      sceneId,
      source,
      experimentId,
      remark: form.getFieldValue('remark'),
    };
    setLoading(true);
    const res = await closePublishOrder(params);
    setLoading(false);
    refreshCurrent();
    if (res.code !== 1) {
      message.error({ content: `关闭失败：${res.message}`, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '关闭成功', key: loadingKey, duration: 2 });
    return true;
  };

  const handleFormChangeValue = () => {
    const remark = form.getFieldValue('remark') ?? '';
    const sceneCodeError = remark
      ? {}
      : {
          name: 'remark',
          errors: ['备注为必填项'],
        };
    const errorList = [sceneCodeError];
    // @ts-ignore
    form.setFields(errorList);
    return !!remark;
  };

  const columns: ProDescriptionsItemProps<Partial<PublishInfo>>[] = [
    {
      title: '发布单',
      dataIndex: 'name',
    },
    {
      title: '修改人',
      dataIndex: 'updateUser',
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
    },
  ];

  const publishColumns: ProColumns<PublishDetail>[] = [
    {
      title: '分支ID',
      dataIndex: 'branchId',
    },
    {
      title: '分支名称',
      dataIndex: 'branchName',
    },
    {
      title: '分支类型',
      dataIndex: 'branchType',
      valueEnum: RuleBranchType,
    },
    {
      title: '分支版本',
      dataIndex: 'version',
      render: (dom, record) => <Text type="danger">V{dom}</Text>,
    },
    {
      title: '修改人',
      dataIndex: 'createUser',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (dom, record) => [
        <a
          key="detail"
          target="_blank"
          href={`#/scene/rule/detail?id=${record.branchId}&app_id=${publishData.appId}&scene_id=${publishData.sceneId}&list_type=1&access_mode=1&version=${record.version}&base_version=${record.baseVersion}&publish_order_id=${publishOrderId}&is_online=1`}
        >
          详情
        </a>,
      ],
    },
  ];

  const currentColumns: ProColumns<PublishDetail>[] = [
    {
      title: '分支ID',
      dataIndex: 'branchId',
    },
    {
      title: '分支名称',
      dataIndex: 'branchName',
    },
    {
      title: '分支类型',
      dataIndex: 'branchType',
      valueEnum: RuleBranchType,
    },
    {
      title: '分支版本',
      dataIndex: 'version',
      render: (dom, record) => <Text type="danger">V{dom}</Text>,
    },
    {
      title: '修改人',
      dataIndex: 'createUser',
    },
    {
      title: '变更记录',
      dataIndex: 'action',
      valueEnum: PublishDetailAction,
      render: (dom) => <Text type="danger">{dom}</Text>,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (dom, record) => {
        return (
          <Space>
            <a
              target="_blank"
              href={`#/scene/rule/detail?id=${record.branchId}&app_id=${publishData.appId}&scene_id=${publishData.sceneId}&list_type=1&access_mode=1&version=${record.version}&base_version=${record.baseVersion}&publish_order_id=${publishOrderId}&is_online=0`}
            >
              详情
            </a>
            {record.action !== 5 && record.action !== 6 && (
              <a key="diff" onClick={() => diffModelSwitch(true, record)}>
                对比
              </a>
            )}
          </Space>
        );
      },
    },
  ];

  const reportColumns: ProColumns<ReportItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'App Code',
      dataIndex: 'appCode',
    },
    {
      title: 'Scene Code',
      dataIndex: 'sceneCode',
    },
    {
      title: 'IP',
      dataIndex: 'ip',
    },
    {
      title: '版本',
      dataIndex: 'version',
    },
    {
      title: '上报时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
    },
    {
      title: '状态',
      dataIndex: 'code',
      render: (dom, record) => {
        return record.code === 1 ? '成功' : '失败';
      },
    },
    {
      title: 'Message',
      dataIndex: 'message',
      ellipsis: true,
    },
  ];

  return (
    <PageContainer>
      <Spin spinning={loading}>
        <Card>
          <ProForm submitter={false} form={form}>
            <Space size="large" direction="vertical" style={{ width: '100%' }}>
              <ProDescriptions
                column={3}
                title={false}
                dataSource={publishData}
                columns={columns}
                size="small"
                bordered
              />
              <Steps size="small" current={stepsObj.stepsCurrent} status={stepsObj.stepsStatus}>
                <Step title={stepsObj.stepFlowTitle} />
                <Step title="开始" />
                <Step title="发布中" />
                <Step title={stepsObj.stepStatusTitle} />
              </Steps>
              {stepsObj.stepsCurrent === 3 || publishData.status === 1000 ? (
                <ProFormTextArea
                  name="remark"
                  label="备注"
                  rules={[
                    {
                      required: true,
                      message: '备注为必填项',
                    },
                  ]}
                  fieldProps={{
                    value: publishData.remark,
                  }}
                  disabled={true}
                />
              ) : (
                <ProFormTextArea
                  name="remark"
                  label="备注"
                  rules={[
                    {
                      required: true,
                      message: '备注为必填项',
                    },
                  ]}
                />
              )}
              <div style={{ float: 'right' }}>
                {publishData.status !== 1000 && (
                  <>
                    <Popconfirm
                      key="publish"
                      title="确认操作？"
                      onConfirm={handleStartPublishRequest}
                      disabled={stepsObj.startDisabled}
                    >
                      <Button
                        type="primary"
                        style={{ marginLeft: 10 }}
                        disabled={stepsObj.startDisabled}
                      >
                        发布
                      </Button>
                    </Popconfirm>
                    <Popconfirm
                      key="close"
                      title="确认操作？"
                      onConfirm={handleClosePublishRequest}
                      disabled={stepsObj.closeDisabled}
                    >
                      <Button style={{ marginLeft: 10 }} disabled={stepsObj.closeDisabled}>
                        关闭发布单
                      </Button>
                    </Popconfirm>
                  </>
                )}
              </div>
            </Space>
          </ProForm>
        </Card>
        <Card style={{ marginTop: 10 }}>
          <ProTable<ReportItem>
            headerTitle={'状态上报列表'}
            rowKey="id"
            search={false}
            options={false}
            request={async (params: any) => {
              const { pageSize, current = 1, ...other } = params;
              const result = await queryReportList({
                pageIndex: current - 1,
                pageSize,
                appId,
                sceneId,
                ...other,
              });
              return {
                data: result.datas,
                success: true,
                total: result.totalCount,
              };
            }}
            pagination={{
              pageSize: 10,
            }}
            columns={reportColumns}
          />
        </Card>
        <div style={{ marginTop: 10 }}>
          <Card style={{ marginTop: 10 }}>
            <ProTable<PublishDetail>
              headerTitle="线上版本"
              rowKey="branchId"
              search={false}
              options={false}
              dataSource={publishData.onlineList}
              pagination={false}
              columns={publishColumns}
            />
          </Card>
          <Card style={{ marginTop: 10 }}>
            <ProTable<PublishDetail>
              headerTitle="当前发布"
              rowKey="branchId"
              search={false}
              options={false}
              dataSource={publishData.currentList}
              pagination={false}
              columns={currentColumns}
            />
          </Card>
        </div>
      </Spin>
      <RuleDiffModal
        visible={diffModalVisible}
        onVisibleChange={setDiffModalVisible}
        currentData={currentData}
      />
    </PageContainer>
  );
};

export default connect(({ user }: ConnectState) => ({
  currentUser: user.currentUser,
}))(PublishBase);
