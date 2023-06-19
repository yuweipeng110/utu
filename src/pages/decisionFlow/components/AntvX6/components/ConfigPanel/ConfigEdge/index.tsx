import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Row, Col, Form, InputNumber, Popover, Spin, Empty } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ProDescriptions from '@ant-design/pro-descriptions';
import FlowGraph from '../../../Graph';
import type { Cell } from '@antv/x6';
import ProForm, {
  ProFormText,
  ProFormRadio,
  ProFormTextArea,
  ProFormSlider,
  ProFormSelect,
} from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';
import { ExperimentGroupMark } from '@/consts/experiment/const';
import { FeatureDataType } from '@/consts/feature/const';
import { getPageQuery } from '@/utils/utils';
import _ from 'lodash';
import '../../../index.less';

const EdgeType = {
  3: '实线',
  4: '虚线',
  8: '点虚线',
};

const EdgeConnector = {
  normal: '简单连接器',
  smooth: '平滑连接器',
  rounded: '圆角连接器',
  // jumpover: '跳线连接器',
};

type ConfigEdgeProps = {
  id: string;
  setFeatureList: any;
  featureList: any;
  featureLoading: boolean;
  featureRun: any;
  featureCancel: any;
};

export default (props: ConfigEdgeProps) => {
  const { id, setFeatureList, featureList, featureLoading, featureRun, featureCancel } = props;
  const queryParams = getPageQuery();
  const appId = queryParams['app_id'];
  const cellRef = useRef<Cell>();
  const [baseForm] = Form.useForm();
  const [businessForm] = Form.useForm();

  const [attrs, setAttrs] = useState({
    stroke: '#5F95FF',
    strokeWidth: 1,
    connector: 'normal',
  });
  const [currentEdgeData, setCurrentEdgeData] = useState(Object.create(null));
  const [flowRate, setFlowRate] = useState<number>(0);
  const [selectFeature, setSelectFeature] = useState(Object.create(null));
  const [featureOptions, setFeatureOptions] = useState([]);

  const setAttr = (key: string, val: any) => {
    setAttrs((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleFeatureOptions = (list: any) => {
    if (!_.isEmpty(list)) {
      const tempFeatureOptions: any = list.map((item: any) => {
        return {
          business_data: item,
          value: item.id,
          label: `${item.featureName}(${item.featureDesc})|${FeatureDataType[item.featureType]}`,
        };
      });
      setFeatureOptions(tempFeatureOptions);
    }
  };

  /**
   * 查询特征
   */
  const handleSearchFeature = (value: string) => {
    if (value.length === 0) return;
    setFeatureList([]);
    featureRun({
      appId,
      keywords: value,
    });
  };

  // featureList改变时重置featureOptions
  useEffect(() => {
    if (featureList.length > 0) {
      handleFeatureOptions(featureList.filter((item: any) => item.featureType === 1));
    }
  }, [featureList]);

  useEffect(() => {
    if (id) {
      const { graph } = FlowGraph;
      const cell = graph.getCellById(id);
      if (!cell || !cell.isEdge()) {
        return;
      }
      cellRef.current = cell;

      const connector = cell.getConnector() || {
        name: 'smooth',
      };
      // setAttr('stroke', cell.attr('line/stroke'));
      // setAttr('strokeWidth', cell.attr('line/strokeWidth'));
      setAttr('connector', connector.name);
      // 重置流量比例
      setFlowRate(0);
      if (cell.getData().type === 4) {
        // 刷新特征list
        featureRun({
          appId,
        });
      }
      // 设置策略options
      handleFeatureOptions(featureList.filter((item: any) => item.featureType === 1));

      // 设置业务属性data
      const cellData = cell.getData();

      businessForm.resetFields();
      businessForm.setFieldsValue(cellData);
      setCurrentEdgeData(cellData);
      setFlowRate(cellData.flowRate || 0);
      // 设置基本属性data
      const baseData = cell.getProp('baseData');
      baseForm.resetFields();
      baseForm.setFieldsValue(baseData);
    }
  }, [id]);

  // useMemo(() => {
  //   if (!_.isEmpty(selectFeature)) {
  //     const cellData = cellRef.current?.getData();
  //     const featureObj = {
  //       whitelistTypeId: selectFeature.id,
  //       whitelistTypeCode: selectFeature.featureName,
  //     };
  //     cellRef.current?.setData({
  //       ...cellData,
  //       ...featureObj,
  //     });
  //   }
  // }, [selectFeature]);

  const onStrokeChange = (e: any) => {
    const val = e.target.value;
    setAttr('stroke', val);
    cellRef.current?.attr('line/stroke', val);
  };

  const onStrokeWidthChange = (val: any) => {
    setAttr('strokeWidth', val);
    cellRef.current?.attr('line/strokeWidth', val);
  };

  const onConnectorChange = (val: any) => {
    setAttr('connector', val);
    const cell: any = cellRef.current;
    cell.setConnector(val);
  };

  // 线属性值发生变化
  const onAttrsChange = (changedValues: any, allValues: any) => {
    const currentBaseData = cellRef.current?.getProp('baseData');
    // 设置name以及label名称
    if (changedValues.hasOwnProperty('name')) {
      cellRef.current?.setProp('labels', [{ attrs: { text: { text: changedValues.name } } }]);
      cellRef.current?.setProp('baseData', { ...currentBaseData, name: changedValues.name });
    }
    // 设置线englishName
    if (changedValues.hasOwnProperty('englishName')) {
      cellRef.current?.setProp('baseData', {
        ...currentBaseData,
        englishName: changedValues.englishName,
      });
    }
    // 设置线描述
    if (changedValues.hasOwnProperty('desc')) {
      cellRef.current?.setProp('baseData', { ...currentBaseData, desc: changedValues.desc });
    }
  };

  const onDataChange = (changedValues: any, allValues: any) => {
    if (changedValues.hasOwnProperty('type')) {
      if (changedValues.type === 3) {
        // 置为实线
        cellRef.current?.attr('line/strokeDasharray', '');
      } else if (changedValues.type === 4) {
        // 置为虚线
        cellRef.current?.attr('line/strokeDasharray', 5);
      } else {
        // 置为点虚线
        cellRef.current?.attr('line/strokeDasharray', 10);
      }
    }
    // 处理流量比例小数点问题
    if (changedValues.hasOwnProperty('flowRate')) {
      allValues.flowRate = changedValues.flowRate.toString().replace(/[^\d]+/g, '');
    }
    if (changedValues.hasOwnProperty('whitelistTypeId')) {
      allValues.whitelistTypeCode = businessForm.getFieldValue('whitelistTypeCode');

      // allValues.whitelistTypeCode = selectFeature.featureName;
    } else {
      delete allValues.whitelistTypeCode;
    }
    cellRef.current?.setData(allValues);
    setCurrentEdgeData(cellRef.current?.getProp('data'));
  };

  // const saveBusinessFormData = () => {
  //   const cellData = cellRef.current?.getData();
  //   const businessFormData = businessForm.getFieldsValue();
  //   Object.keys(businessFormData).forEach((key) => {
  //     if (businessFormData[key] === undefined) {
  //       delete businessFormData[key];
  //     }
  //   });

  //   cellRef.current?.setData({
  //     ...cellData,
  //     ...businessFormData,
  //   });
  // };

  const renderEdgeExperiment = () => {
    const limitInput = (value: any) => {
      let newValue = value.toString().replace(/[^\d]+/g, '');
      return `${newValue}%`;
    };
    try {
      const edgeDataType = cellRef.current?.getData().type;
      if (edgeDataType === 4) {
        //   // 指向关系 0: 向上、1:向下、2:双向
        //   pointtoRelation: 0,
        //   // 流量比例
        //   flowRate: 20,
        //   // 流量标记
        //   flowMark: '流量标记',
        //   // 白名单
        //   whitelist: '白名单',
        return (
          <>
            <ProFormRadio.Group
              name={['experimentMark']}
              label="实验标记"
              options={Object.keys(ExperimentGroupMark).map((key) => {
                return {
                  value: Number(key),
                  label: ExperimentGroupMark[key],
                };
              })}
              rules={[
                {
                  required: true,
                },
              ]}
              fieldProps={{ size: 'small' }}
              disabled={currentEdgeData.isReadOnly}
            />
            <ProFormText
              name={['groupName']}
              label="组名称"
              rules={[
                {
                  required: true,
                },
              ]}
              fieldProps={{ size: 'small' }}
              disabled={currentEdgeData.isReadOnly}
            />
            {/* 流量标记没用到 可以隐藏 */}
            <ProFormText
              name={['flowMark']}
              label="流量标记"
              fieldProps={{ size: 'small' }}
              disabled={currentEdgeData.isReadOnly}
            />
            <Row>
              <Col span={12}>
                <ProFormSlider
                  name={['flowRate']}
                  label="流量比例"
                  min={0}
                  max={100}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  // marks={marks}
                  fieldProps={{
                    tipFormatter: (value) => {
                      return `${value}%`;
                    },
                    onChange: (value) => {
                      setFlowRate(value);
                    },
                    value: flowRate,
                  }}
                />
              </Col>
              <Col span={4}>
                <Form.Item name={['flowRate']}>
                  <InputNumber
                    className="my-antd-input-number"
                    min={0}
                    max={100}
                    size="small"
                    value={flowRate}
                    onChange={(value) => {
                      if (value) {
                        let newValue = value.toString().replace(/[^\d]+/g, '');
                        setFlowRate(newValue);
                        businessForm.setFieldsValue({ flowRate: newValue });
                      }
                    }}
                    // formatter={(value) => `${value}%`}
                    formatter={(value) => limitInput(value)}
                    parser={(value: any) => value?.replace('%', '')}
                  />
                </Form.Item>
              </Col>
            </Row>
            <ProFormSelect
              name={['whitelistTypeId']}
              label="白名单类型"
              showSearch
              options={featureOptions}
              fieldProps={{
                size: 'small',
                showArrow: true,
                filterOption: false,
                onSearch: (value) => handleSearchFeature(value),
                onChange: (value, option: any) => {
                  if (value) {
                    setSelectFeature(option['business_data']);
                    // businessForm.setFields({
                    //   whitelistTypeCode: {
                    //     value: 'xxx'
                    //   }
                    // });
                    const cellData = cellRef.current?.getData();
                    cellData.whitelistTypeId = value;
                    cellData.whitelistTypeCode = option['business_data'].featureName;
                    cellRef.current?.setData({
                      ...cellData,
                    });
                  }
                },
                onBlur: featureCancel,
                onClear: async () => {
                  setSelectFeature(Object.create(null));
                  if (selectFeature) {
                    const cellData = cellRef.current?.getData();
                    delete cellData.whitelistTypeId;
                    delete cellData.whitelistTypeCode;
                    cellRef.current?.setData({
                      ...cellData,
                    });
                  }
                  // await featureRun({
                  //   appId,
                  // });
                },
                loading: featureLoading,
                notFoundContent: featureLoading ? <Spin size="small" /> : <Empty />,
              }}
            />
            <ProFormTextArea
              name={['whitelist']}
              label="白名单"
              fieldProps={{
                rows: 2,
                size: 'small',
              }}
            />
          </>
        );
      } else if (edgeDataType === 8) {
        //   // 命中条件
        //   hitCondition: if(a > b),
        return (
          <ProFormTextArea
            name={['hitCondition']}
            label="命中条件"
            placeholder="if(a > b)"
            rules={[
              {
                required: true,
              },
            ]}
            fieldProps={{
              rows: 2,
              size: 'small',
            }}
          />
        );
      }
      return <></>;
    } catch (e) {
      return <></>;
    }
  };

  const columns: any = [
    {
      title: '实线',
      render: () => '有向线段，链接各个节点的连线',
    },
    {
      title: '虚线',
      render: () => '有向线段，实验分组的连线，有实验相关信息',
    },
    {
      title: '点虚线',
      render: () => '有向线段，选择分组的连线',
    },
  ];

  return (
    <>
      <ProCard title="线设置" headerBordered size="small" className="my-flow-pro-card">
        <ProForm
          form={baseForm}
          submitter={{
            render: () => null,
          }}
          onValuesChange={onAttrsChange}
        >
          <ProFormText
            name={['name']}
            label="名称"
            fieldProps={{ size: 'small', autoFocus: false }}
          />
          <ProFormText name={['englishName']} label="英文名" fieldProps={{ size: 'small' }} />
          <ProFormTextArea
            name={['desc']}
            label="描述"
            fieldProps={{
              rows: 2,
              size: 'small',
            }}
          />
          <ProFormSelect
            label="连接器"
            showSearch
            options={Object.keys(EdgeConnector).map((key) => {
              return {
                value: key,
                label: EdgeConnector[key],
              };
            })}
            fieldProps={{
              size: 'small',
              onChange: onConnectorChange,
            }}
          />
        </ProForm>
      </ProCard>
      <ProCard
        title="规则配置"
        headerBordered
        collapsible
        size="small"
        className="my-flow-pro-card"
      >
        <ProForm
          form={businessForm}
          submitter={{
            render: () => null,
          }}
          onValuesChange={onDataChange}
        >
          <ProFormRadio.Group
            name={['type']}
            label={
              <>
                边类型&nbsp;
                <Popover
                  content={
                    <ProDescriptions
                      bordered
                      column={1}
                      title={false}
                      columns={columns}
                      style={{ width: '100%', fontSize: '10px' }}
                      size="small"
                    />
                  }
                >
                  <QuestionCircleOutlined style={{ cursor: 'pointer' }} />
                </Popover>
              </>
            }
            options={Object.keys(EdgeType).map((key) => {
              return {
                value: Number(key),
                label: EdgeType[key],
              };
            })}
            rules={[
              {
                required: true,
              },
            ]}
            fieldProps={{ size: 'small' }}
            // disabled={currentEdgeData.isReadOnly}
            disabled
          />
          {renderEdgeExperiment()}
        </ProForm>
      </ProCard>
    </>
  );
};
