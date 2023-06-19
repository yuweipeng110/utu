import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import RuleList from './components/RuleList';

export default (): React.ReactNode => {
  return (
    <PageContainer>
      <RuleList />
    </PageContainer>
  );
};
