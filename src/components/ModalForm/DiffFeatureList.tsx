import React, { useEffect, useState } from 'react';
import { ModalForm } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import type { ProColumns } from '@ant-design/pro-table';
import { Form, Tag, Row, Col } from 'antd';
import type { FeatureInfo, FeatureProperties } from '@/models/featureConfig';
import { FeatureSource, FeatureDataType, FeaturePropertiesType } from '@/consts/feature/const';
import _ from 'lodash';

export type DiffFeatureListProps = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: any;
  onFinish: any;
};

const DiffFeatureList: React.FC<DiffFeatureListProps> = (props: any) => {
  const { visible, onVisibleChange, currentData, onFinish } = props;
  const [form] = Form.useForm();

  const [selfVersionHistoryList, setSelfVersionHistoryList] = useState([]);

  const formatList = (data: any) => {
    if (!data) {
      return [];
    }
    const jsonData = typeof data == 'string' ? JSON.parse(data) : data;
    const list = Object.keys(jsonData).map((key) => {
      const item = jsonData[key];
      const itemExpressionStruct =
        typeof item.expressionStruct == 'string' && !_.isEmpty(item.expressionStruct)
          ? JSON.parse(item.expressionStruct)
          : {};
      return {
        version: key,
        ...item,
        expression: itemExpressionStruct.expression,
        dependenceList: itemExpressionStruct.dependenceList,
        resultType: itemExpressionStruct.resultType,
      };
    });
    return list;
  };

  useEffect(() => {
    if (visible) {
      setSelfVersionHistoryList((formatList(currentData.selfUpgraded) as []) || []);
    }
  }, [visible]);

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
          return !_.isEmpty(jsonData.dependenceList)
            ? jsonData.dependenceList.map((item: string) => <Tag>{item}</Tag>)
            : '';
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
          rowKey="name"
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

  const selfVersionHistoryRender = () => {
    return (
      <>
        <h3>自身版本历史</h3>
        <ProTable<FeatureInfo>
          headerTitle={false}
          rowKey="version"
          className="my-edit-pro-table"
          bordered
          columns={columns}
          dataSource={selfVersionHistoryList}
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
      </>
    );
  };

  const relyFeatureHistoryRender = () => {
    return (
      <>
        <h3>依赖特征历史</h3>
        {!_.isEmpty(currentData.dependUpgraded) &&
          Object.keys(JSON.parse(currentData.dependUpgraded)).map((key) => {
            const itemData = JSON.parse(currentData.dependUpgraded)[key];
            return (
              <ProTable<FeatureInfo>
                headerTitle={key}
                rowKey="version"
                className="my-edit-pro-table"
                bordered
                columns={columns}
                dataSource={formatList(itemData) || []}
                pagination={false}
                options={false}
                search={false}
                size="small"
                scroll={{
                  y: 400,
                }}
                expandable={{
                  expandedRowRender: (record) => expandedRowRender(record),
                  rowExpandable: (record) => record.featureType === 5,
                }}
              />
            );
          })}
      </>
    );
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
      {visible &&
        !_.isEmpty(currentData.selfUpgraded) &&
        _.isEmpty(currentData.dependUpgraded) &&
        selfVersionHistoryRender()}
      {visible &&
        _.isEmpty(currentData.selfUpgraded) &&
        !_.isEmpty(currentData.dependUpgraded) &&
        relyFeatureHistoryRender()}
      {visible && !_.isEmpty(currentData.selfUpgraded) && !_.isEmpty(currentData.dependUpgraded) && (
        <Row>
          <Col span={12}>
            <div style={{ margin: 5 }}>{selfVersionHistoryRender()}</div>
          </Col>
          <Col span={12}>
            <div style={{ margin: 5 }}>{relyFeatureHistoryRender()}</div>
          </Col>
        </Row>
      )}
    </ModalForm>
  );
};

export default DiffFeatureList;
