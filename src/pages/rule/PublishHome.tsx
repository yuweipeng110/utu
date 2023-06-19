import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import PublishList from './components/PublishList';

export default (): React.ReactNode => {
  return (
    <PageContainer>
      <PublishList />
    </PageContainer>
  );
};
