import { Button, Result } from 'antd';
import React from 'react';
import { history } from 'umi';

const errorPage: React.FC = () => (
  <div>
    <Result
      status="500"
      title="出现问题"
      subTitle="错误：未选择组 或 应用。"
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
