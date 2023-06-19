import { Button, Result } from 'antd';
import React from 'react';
import { history } from 'umi';

const errorPage: React.FC = () => (
  <div>
    <Result
      status="500"
      title="出现问题"
      subTitle="您请求的页面暂时不可用。对由此给您造成的不便，我们深表歉意，请尝试重新刷新页面 或 几分钟后再返回查看。"
      extra={
        <>
          <Button type="primary" onClick={() => history.push('/')}>
            主页
          </Button>
          <Button type="primary" onClick={() => history.goBack()}>
            返回上一页
          </Button>
        </>
      }
    />
  </div>
);

export default errorPage;
