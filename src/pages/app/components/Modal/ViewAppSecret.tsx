import React, { useEffect, useState } from 'react';
import { Modal, Typography } from "antd";
import ProDescriptions from '@ant-design/pro-descriptions';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import { queryAppSecret } from "@/services/app";
import type { AppInfo } from '@/models/app';

const { Paragraph } = Typography;

type ViewAppSecretProps = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: AppInfo;
};

const ViewAppSecret: React.FC<ViewAppSecretProps> = (props) => {
  const { visible, onVisibleChange, currentData } = props;

  const [dataSource, setDataSource] = useState();

  const loadAppSecretData = async () => {
    const params = {
      id: currentData.id
    };
    const res = await queryAppSecret(params);
    // @ts-ignore
    setDataSource({ appSecret: res.data });
  }

  useEffect(() => {
    if (visible) {
      loadAppSecretData();
    }
  }, [visible])

  const columns: ProDescriptionsItemProps<AppInfo>[] = [
    {
      title: 'APP Secret',
      dataIndex: 'appSecret',
      render: (value) => value ? <Paragraph copyable style={{ marginBottom: '0' }}>{value}</Paragraph> : '-',
    },
  ];

  return (
    <Modal
      title={`${currentData && currentData.appCode} 密钥`}
      visible={visible}
      onCancel={() => {
        onVisibleChange(false);
      }}
      footer={false}
    >
      <ProDescriptions column={1} title={false} bordered={true} dataSource={dataSource} columns={columns}/>
    </Modal>
  )
}

export default ViewAppSecret;
