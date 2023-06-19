import { useRef, useState } from 'react';
import { connect } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';
import { StatisticCard } from '@ant-design/pro-card';
import { Button, Col, Row, Spin, Tag, Form } from 'antd';
import ProForm, { ProFormDateRangePicker } from '@ant-design/pro-form';
import { Column } from '@ant-design/charts';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { getStrategyRunCount } from '@/services/offlineStrategy';
import { StrategyRunCountType } from '@/models/strategy';
import type { AppInfo } from '@/models/app';
import {
  OfflineStrategyJobStatusType,
  OfflineStrategyJobType,
} from '@/consts/offlineStrategy/const';
import { getPageQuery } from '@/utils/utils';
import '../index.less';
import moment from 'moment';
import Sampling from './ModalForm/Sampling';

const dateFormat = 'YYYY-MM-DD';

export type FlowListProps = {
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const StrategyRunCount: React.FC<FlowListProps> = (props) => {
  const { currentApp } = props;
  const queryParams = getPageQuery();
  const strategyId = queryParams['strategy_id'];
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();

  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [chartsData, setChartsData] = useState([]);
  const [statisticData, setStatisticData] = useState(Object.create(null));
  const [searchDate, setSearchDate] = useState<moment.Moment[]>([moment(), moment()]);
  const [samplingModalVisible, setSamplingModalVisible] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<StrategyRunCountType>(Object.create(null));

  const chartsConfig = {
    data: chartsData,
    isGroup: true,
    xField: 'date',
    yField: 'cnt',
    seriesField: 'name',
    // 分组柱状图 组内柱子间的间距 (像素级别)
    // dodgePadding: 2,
    // 分组柱状图 组间的间距 (像素级别)
    // intervalPadding: 20,
    label: {
      // 可手动配置 label 数据标签位置
      position: 'middle',
      // 'top', 'middle', 'bottom'
      // 可配置附加的布局方法
      layout: [
        // 柱形图数据标签位置自动调整
        {
          type: 'interval-adjust-position',
        }, // 数据标签防遮挡
        {
          type: 'interval-hide-overlap',
        }, // 数据标签文颜色自动调整
        {
          type: 'adjust-color',
        },
      ],
    },
  };

  const columns: ProColumns<StrategyRunCountType>[] = [
    {
      title: '任务ID',
      dataIndex: 'jobId',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      valueType: 'dateTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      valueType: 'dateTime',
    },
    {
      title: '执行时长(s)',
      dataIndex: 'execTime',
    },
    {
      title: '任务类型',
      dataIndex: 'jobType',
      valueEnum: OfflineStrategyJobType,
    },
    {
      title: '处理量',
      dataIndex: 'dealCnt',
    },
    {
      title: '命中量',
      dataIndex: 'hitCnt',
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: OfflineStrategyJobStatusType,
      render: (dom, record) => {
        let domTag;
        switch (record.status) {
          case 1:
            domTag = (
              <Tag icon={<ExclamationCircleOutlined />} color="warning">
                {dom}
              </Tag>
            );
            break;
          case 3:
            domTag = (
              <Tag icon={<SyncOutlined spin />} color="processing">
                {dom}
              </Tag>
            );
            break;
          case 4:
            domTag = (
              <Tag icon={<CheckCircleOutlined />} color="success">
                {dom}
              </Tag>
            );
            break;
          case 5:
            domTag = (
              <Tag icon={<CloseCircleOutlined />} color="error">
                {dom}
              </Tag>
            );
            break;
          case 9:
            domTag = (
              <Tag icon={<ClockCircleOutlined />} color="default">
                {dom}
              </Tag>
            );
            break;
        }
        return domTag;
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: '200px',
      render: (value, record) => {
        const samplingBtn = (
          <a
            key="samplingBtn"
            onClick={() => {
              setCurrentData(record);
              setSamplingModalVisible(true);
            }}
          >
            抽样
          </a>
        );

        if (record.hitCnt <= 0) {
          return [];
        }
        return [samplingBtn];
      },
    },
  ];

  return (
    <PageContainer>
      <Spin spinning={tableLoading}>
        <ProCard style={{ marginBottom: 10 }}>
          <Row>
            <Col span={20}>
              <ProForm form={form} layout="horizontal" submitter={{ render: () => null }}>
                <ProFormDateRangePicker
                  name="searchDate"
                  label="开始/结束时间"
                  fieldProps={{
                    value: searchDate,
                    onChange: (values: any) => {
                      setSearchDate(values);
                    },
                  }}
                />
              </ProForm>
            </Col>
            <Col span={4}>
              <Button
                type="primary"
                onClick={() => {
                  actionRef.current?.reload();
                }}
                style={{ float: 'right' }}
              >
                搜索
              </Button>
            </Col>
          </Row>
        </ProCard>
        <ProCard title="策略运行统计" headerBordered style={{ marginBottom: 10 }}>
          <Row>
            <Col span={4}>
              <StatisticCard
                statistic={{
                  title: '处理量',
                  value: statisticData?.totalDealCnt,
                }}
                className="my-statistic-card statistic-card-dealcnt"
              />
              <StatisticCard
                statistic={{
                  title: '命中量',
                  value: statisticData?.totalHitCnt,
                }}
                className="my-statistic-card statistic-card-hitcnt"
              />
              <StatisticCard
                statistic={{
                  title: '命中占比',
                  value: `${(statisticData?.totalDealCnt === 0
                    ? 0
                    : (statisticData?.totalHitCnt / statisticData?.totalDealCnt) * 100
                  ).toFixed(2)}%`,
                }}
                className="my-statistic-card statistic-card-percentage"
              />
            </Col>
            <Col span={20}>
              <Column {...chartsConfig} />
            </Col>
          </Row>
        </ProCard>
        <ProTable<StrategyRunCountType>
          headerTitle="监控任务"
          actionRef={actionRef}
          rowKey="startTime"
          search={false}
          options={false}
          loading={tableLoading}
          params={{
            appId: currentApp && currentApp.id,
          }}
          request={async (params) => {
            const { pageSize, current = 1, ...other } = params;
            setTableLoading(true);
            const result = await getStrategyRunCount({
              pageIndex: current - 1,
              pageSize,
              appId: currentApp && currentApp.id,
              strategyId: Number(strategyId),
              startTime: searchDate[0].format(dateFormat),
              endTime: searchDate[1].format(dateFormat),
              ...other,
            });
            setTableLoading(false);
            setStatisticData(result.datas[0]);
            setChartsData(result.datas[0].statisticalData);
            return {
              data: result.datas[0].params,
              success: true,
              total: result.totalCount,
            };
          }}
          pagination={{
            pageSize: 10,
          }}
          onRow={(record) => {
            return {
              onClick: () => {
                setTableLoading(true);
                setChartsData([
                  {
                    name: '处理量',
                    date: moment(record.startTime).format(dateFormat),
                    cnt: record.dealCnt,
                  },
                  {
                    name: '命中量',
                    date: moment(record.startTime).format(dateFormat),
                    cnt: record.hitCnt,
                  },
                ]);
                setStatisticData({
                  totalDealCnt: record.dealCnt,
                  totalHitCnt: record.hitCnt,
                });
                setTableLoading(false);
              },
            };
          }}
          columns={columns}
        />
      </Spin>
      <Sampling
        actionRef={actionRef}
        visible={samplingModalVisible}
        onVisibleChange={setSamplingModalVisible}
      />
    </PageContainer>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
}))(StrategyRunCount);
