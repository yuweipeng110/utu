import React, { useEffect } from 'react';
import { connect } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import type { AppInfo } from '@/models/app';
import './index.less';

type StatisticsTypeProps = {
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const StatisticsIndex: React.FC<StatisticsTypeProps> = (props) => {
  const { currentApp } = props;

  const url = `https://fbi.alibaba-inc.com/dashboard/view/page.htm?id=801757&hiddenTitle=false&copyright=false&app_name=交易风控`;

  useEffect(() => {
    window.addEventListener(
      'message',
      function (e) {
        try {
          var data = JSON.parse(e.data);
          for (var id in data) {
            document
              .getElementById('my-iframe')
              ?.setAttribute('height', data[801757]['quarkReportHeight']);
          }
        } catch (x) {}
      },
      false,
    );
  }, []);

  return (
    <PageContainer>
      <ProCard title={false} split={'vertical'} bordered={false} headerBordered>
        <iframe
          id="my-iframe"
          frameBorder="0"
          width="100%"
          height="100%"
          src={url}
          style={{ minHeight: 500 }}
        />
      </ProCard>
    </PageContainer>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
}))(StatisticsIndex);
