import React, { useState } from 'react';
import { connect } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { Button, Modal } from 'antd';
import ProCard from '@ant-design/pro-card';
import type { AppInfo } from '@/models/app';
import './index.less';

type StatisticsTypeProps = {
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const StatisticsIndex: React.FC<StatisticsTypeProps> = (props) => {
  const { currentApp } = props;
  const [viewDetailModalVisible, handleDetailCodeModalVisible] = useState<boolean>(false);

  //分应用总览图
  let allUrl = `https://fbi.alibaba-inc.com/dashboard/view/page.htm?id=800879&app_name=交易风控`;
  //分场景柱状图
  const columnarUrl = `https://fbi.alibaba-inc.com/dashboard/view/page.htm?id=800952&app_name=交易风控`;
  //分场景表格图
  const tableUrl = `https://fbi.alibaba-inc.com/dashboard/view/page.htm?id=800649&app_name=交易风控`;
  //查询明细图
  const detailUrl = `https://fbi.alibaba-inc.com/dashboard/view/page.htm?id=800714&app_name=交易风控`;

  return (
    <>
      <ProCard
        title={<div style={{ fontSize: 22 }}>数据大盘</div>}
        extra={
          <Button type="primary" onClick={() => handleDetailCodeModalVisible(true)}>
            发布/回滚明细
          </Button>
        }
        split={'vertical'}
        bordered
        headerBordered
      >
        <ProCard title=" " colSpan="40%">
          <iframe style={{ width: '100%', height: '750px', overflow: 'visible' }} src={allUrl} />
        </ProCard>
        <ProCard
          title={false}
          tabs={{
            type: 'card',
          }}
        >
          <ProCard.TabPane key="tab1" tab="分场景柱状图">
            <iframe
              style={{ width: '100%', height: '750px', overflow: 'visible' }}
              src={columnarUrl}
            />
          </ProCard.TabPane>
          <ProCard.TabPane key="tab2" tab="分场景表格图">
            <iframe
              style={{ width: '100%', height: '750px', overflow: 'visible' }}
              src={tableUrl}
            />
          </ProCard.TabPane>
        </ProCard>
      </ProCard>
      <Modal
        title={'发布/回滚明细'}
        visible={viewDetailModalVisible}
        onCancel={() => {
          handleDetailCodeModalVisible(false);
        }}
        footer={[
          <Button key="close" onClick={() => handleDetailCodeModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width="95%"
      >
        <iframe style={{ width: '100%', height: '650px', overflow: 'visible' }} src={detailUrl} />
      </Modal>
    </>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
}))(StatisticsIndex);
