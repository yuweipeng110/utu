import React from 'react';
import { ModalForm } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import type { ProColumns } from '@ant-design/pro-table';
import { Form, Tag } from 'antd';
import ProCard from '@ant-design/pro-card';
import type { FeatureInfo, FeatureProperties } from '@/models/featureConfig';
import { FeatureSource, FeatureDataType, FeaturePropertiesType } from '@/consts/feature/const';
import _ from 'lodash';

export type DiffStrategyListProps = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  relyonFeatureData: any;
  onFinish: any;
};

const DiffStrategyList: React.FC<DiffStrategyListProps> = (props: any) => {
  const { visible, onVisibleChange, relyonFeatureData, onFinish } = props;
  const [form] = Form.useForm();

  const formatList = (data: any) => {
    if (!data) {
      return [];
    }
    const jsonData = typeof data == 'string' ? JSON.parse(data) : data;
    const list = Object.keys(jsonData).map((key) => {
      const item = jsonData[key];
      return {
        version: key,
        ...item,
      };
    });
    return list;
  };

  const columns: ProColumns<FeatureInfo>[] = [
    {
      title: '版本',
      dataIndex: 'version',
      fixed: 'left',
      width: 120,
    },
    {
      title: '特征名称',
      dataIndex: 'featureName',
      fixed: 'left',
      width: 120,
    },
    {
      title: '特征类型',
      dataIndex: 'featureType',
      valueEnum: FeatureDataType,
      width: 120,
    },
    {
      title: '特征默认值',
      dataIndex: 'featureValue',
      width: 130,
    },
    {
      title: '来源',
      dataIndex: 'sourceId',
      valueEnum: FeatureSource,
      width: 130,
    },
    {
      title: '表达式',
      dataIndex: 'expression',
      width: 120,
      render: (dom, record) => {
        if (record.expressionStruct) {
          const jsonData = JSON.parse(record.expressionStruct as any);
          return jsonData.expression;
        }
        return dom;
      },
    },
    {
      title: '依赖特征',
      dataIndex: 'dependenceList',
      width: 120,
      render: (dom, record) => {
        if (record.expressionStruct) {
          const jsonData = JSON.parse(record.expressionStruct as any);
          return jsonData.dependenceList.map((item: string) => <Tag>{item}</Tag>);
        }
        return dom;
      },
    },
    {
      title: '返回值类型',
      dataIndex: 'resultType',
      valueEnum: FeatureDataType,
      width: 130,
      render: (dom, record) => {
        if (record.expressionStruct) {
          const jsonData = JSON.parse(record.expressionStruct as any);
          return FeatureDataType[jsonData.resultType];
        }
        return dom;
      },
    },
  ];

  const expandedRowRender = (record: FeatureInfo) => {
    if (!_.isEmpty(record) && record.featureType === 5 && !_.isEmpty(record.featureProperties)) {
      const featurePropertiesData =
        typeof record.featureProperties == 'string'
          ? JSON.parse(record.featureProperties)
          : record.featureProperties;
      const ruleBranchColumns: ProColumns<FeatureProperties>[] = [
        { title: '属性名称', dataIndex: 'name' },
        { title: '描述', dataIndex: 'desc' },
        { title: '属性类型', dataIndex: 'type', valueEnum: FeaturePropertiesType },
        { title: '默认值', dataIndex: 'defaultValue' },
      ];
      return (
        <ProTable<FeatureProperties>
          headerTitle={false}
          // rowKey="branchId"
          className="my-edit-pro-table"
          bordered
          columns={ruleBranchColumns}
          dataSource={featurePropertiesData}
          pagination={false}
          options={false}
          search={false}
        />
      );
    }
    return <></>;
  };

  const featureItemRender = (data: any) => {
    if (!_.isEmpty(data)) {
      return Object.keys(data).map((key) => {
        const itemData = data[key];
        // 显示key1 特征名称
        return (
          <ProTable<FeatureInfo>
            headerTitle={key}
            bordered
            columns={columns}
            dataSource={formatList(itemData) || []}
            pagination={false}
            options={false}
            search={false}
            size="small"
            scroll={{
              x: 800,
              y: 400,
            }}
            expandable={{
              expandedRowRender: (record) => expandedRowRender(record),
              rowExpandable: (record) => record.featureType === 5,
            }}
          />
        );
      });
    }
    return <></>;
  };

  const ruleItemRender = (data: any) => {
    if (!_.isEmpty(data)) {
      return Object.keys(data).map((key) => {
        const itemData: any = data[key];
        // 显示key 规则集名称
        return (
          <div>
            <ProCard title={key} headerBordered collapsible defaultCollapsed={false} size="small">
              {featureItemRender(itemData)}
            </ProCard>
          </div>
        );
      });
    }
    return <></>;
  };

  const strategyItemRender = (data: any) => {
    if (!_.isEmpty(data)) {
      return Object.keys(data).map((key) => {
        const itemData: any = data[key];
        // 显示key 策略名称
        return (
          <div>
            <ProCard
              title={`${key}(策略)`}
              headerBordered
              collapsible
              defaultCollapsed={false}
              size="small"
            >
              {ruleItemRender(itemData)}
            </ProCard>
          </div>
        );
      });
    }
    return <></>;
  };

  return (
    <ModalForm
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
      }}
      form={form}
      width={'80%'}
      onFinish={onFinish}
    >
      <h3>依赖策略更新历史</h3>
      {!_.isEmpty(relyonFeatureData) && strategyItemRender(JSON.parse(relyonFeatureData))}
    </ModalForm>
  );
};

export default DiffStrategyList;
