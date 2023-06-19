import React, { useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType } from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';
import ProList from '@ant-design/pro-list';
import { Space, List, Typography, Slider, Row, Col, InputNumber, Spin } from 'antd';
import { getAppExperimentDetail } from '@/services/experiment';
import type { ExperimentGroup, ExperimentInfo } from '@/models/experiment';
import { getPageQuery } from '@/utils/utils';
import { ExperimentGroupMark, ExperimentStatus } from '@/consts/experiment/const';
import '../index.less';
import _ from 'lodash';
import ProDescriptions, { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';

const { Paragraph } = Typography;

const AppExperimentDetail: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const queryParams = getPageQuery();
  const experimentId = queryParams['id'];
  const appId = queryParams['app_id'];

  // 新建实验组弹框相关state
  const [createEGList, setCreateEGList] = useState<Partial<ExperimentGroup[]>>([]);
  // 修改实验相关state
  const [loading, setLoading] = useState<boolean>(false);
  const [experimentInfo, setExperimentInfo] = useState<Partial<ExperimentInfo>>(
    Object.create(null),
  );
  const flowRatioMax = 100;

  const loadExperimentInfo = async () => {
    if (!_.isEmpty(experimentId)) {
      setLoading(true);
      const res = await getAppExperimentDetail({
        experimentId,
        appId,
      });
      setLoading(false);
      if (res.code && res.code === -1) {
        history.push('/error');
        return;
      }
      const { data } = res;
      setExperimentInfo(data);
      const experimentGroupList = data.experimentGroups.map((item: any, index: number) => {
        item.index = index;
        return item;
      });
      setCreateEGList(experimentGroupList);
    }
  };

  useEffect(() => {
    loadExperimentInfo();
  }, []);

  const columns: ProDescriptionsItemProps<Partial<ExperimentInfo>>[] = [
    {
      title: '实验名称',
      dataIndex: 'name',
    },
    {
      title: '实验标识',
      dataIndex: 'flag',
    },
    {
      title: '实验描述',
      dataIndex: 'experimentDesc',
    },
    {
      title: '场景',
      dataIndex: 'sceneName',
    },
    {
      title: '决策流',
      dataIndex: 'flowName',
    },
    {
      title: '分流ID',
      dataIndex: 'diversionType',
    },
    {
      title: '分流函数',
      dataIndex: 'diversionFunc',
    },
  ];

  return (
    <PageContainer>
      <Spin spinning={loading}>
        <ProCard
          headerBordered
          title={
            <>
              {experimentInfo.name}({ExperimentStatus[experimentInfo.publishStatus!]})
            </>
          }
        >
          <div>
            <ProDescriptions
              bordered
              column={3}
              title={false}
              dataSource={experimentInfo}
              columns={columns}
              style={{ width: '100%' }}
              size="small"
            />
            <ProCard
              title="实验组"
              ghost
              gutter={8}
              collapsible
              headerBordered
              style={{ margin: '20px' }}
            >
              <div className="cardList">
                <ProList<any>
                  headerTitle={false}
                  actionRef={actionRef}
                  rowKey="id"
                  grid={{ column: 4, gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
                  dataSource={createEGList}
                  renderItem={(item, index) => {
                    if (item && item.createTime) {
                      const groupMarkName = ExperimentGroupMark[item.mark];
                      const groupMarkClass =
                        item.mark === 0 ? 'card experiment-card' : 'card contrast-card';
                      return (
                        <List.Item key={index}>
                          <ProCard
                            title={`【${item.name}】${groupMarkName}`}
                            hoverable
                            bordered
                            extra={
                              <Space>
                                <a
                                  key="detail"
                                  href={`#/knowledge/flow/update?app_id=${experimentInfo.appId}&id=${experimentInfo.flowId}&app_experiment_group_id=${item.id}`}
                                  target="_blank"
                                  style={{ color: 'black' }}
                                >
                                  决策流详情
                                </a>
                              </Space>
                            }
                            className={groupMarkClass}
                          >
                            <Paragraph className="item">
                              <ul>
                                <li>实验组名称：{item.name}</li>
                                <li>实验组标记：{ExperimentGroupMark[item.mark]}</li>
                                <li>
                                  流量配比：
                                  <Row>
                                    <Col span={18}>
                                      <Slider
                                        min={0}
                                        max={flowRatioMax}
                                        value={item.flowRatio}
                                        tipFormatter={(value) => `${value}%`}
                                        disabled
                                      />
                                    </Col>
                                    <Col span={2}>
                                      <InputNumber
                                        className="ant-input-number"
                                        min={0}
                                        max={flowRatioMax}
                                        value={item.flowRatio}
                                        formatter={(value) => `${value}%`}
                                        parser={(value: any) => value?.replace('%', '')}
                                        disabled
                                      />
                                    </Col>
                                  </Row>
                                </li>
                              </ul>
                            </Paragraph>
                          </ProCard>
                        </List.Item>
                      );
                    }
                    return <></>;
                  }}
                />
              </div>
            </ProCard>
          </div>
        </ProCard>
      </Spin>
    </PageContainer>
  );
};

export default AppExperimentDetail;
