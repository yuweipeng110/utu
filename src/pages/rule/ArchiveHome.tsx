import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ArchiveList from './components/ArchiveList';

export default (): React.ReactNode => {
  return (
    <PageContainer>
      <ArchiveList />
    </PageContainer>
  );
};
