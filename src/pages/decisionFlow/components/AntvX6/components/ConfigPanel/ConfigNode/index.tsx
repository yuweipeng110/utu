import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Empty, Form, Space, Spin } from 'antd';
import FlowGraph from '../../../Graph';
import ProForm, {
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
  ProFormRadio,
} from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';
import type { Cell } from '@antv/x6';
import { DiversionTypeEnum, DiversionTypeParamEnum } from '@/consts/decisionFlow/const';
import { FeatureDataType } from '@/consts/feature/const';
import { getPageQuery } from '@/utils/utils';
import _ from 'lodash';
import '../../../index.less';

type ConfigNodeProps = {
  id: string;
  setPackageList: any;
  packageList: [];
  packageLoading: boolean;
  packageRun: any;
  packageCancel: any;
  setFeatureList: any;
  featureList: any;
  featureLoading: boolean;
  featureRun: any;
  featureCancel: any;
};

export default (props: ConfigNodeProps) => {
  // const { id } = props;
  const {
    id,
    setPackageList,
    packageList,
    packageLoading,
    packageRun,
    packageCancel,
    setFeatureList,
    featureList,
    featureLoading,
    featureRun,
    featureCancel,
  } = props;
  const queryParams = getPageQuery();
  const appId = queryParams['app_id'];

  const cellRef = useRef<Cell>();
  const [baseForm] = Form.useForm();
  const [businessForm] = Form.useForm();

  const [currentNodeData, setCurrentNodeData] = useState(Object.create(null));
  const [selectPackage, setSelectPackage] = useState(Object.create(null));
  const [selectStrategy, setSelectStrategy] = useState(Object.create(null));
  const [selectFeature, setSelectFeature] = useState(Object.create(null));
  const [selectDiversionType, setSelectDiversionType] = useState(0);
  const [packageOptions, setPackageOptions] = useState([]);
  const [strategyOptions, setStrategyOptions] = useState([]);
  const [featureOptions, setFeatureOptions] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * 查询包
   */
  const handleSearchPackage = (value: string) => {
    if (value.length === 0) return;
    setPackageList([]);
    packageRun({
      appId,
      name: value,
    });
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
    if (!_.isEmpty(featureList) && featureList.length > 0) {
      handleFeatureOptions(featureList);
    }
  }, [featureList]);

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

  const handlePackageOptions = (list: any) => {
    console.log('list',list);
    
    if (!_.isEmpty(list)) {
      const tempPackageOptions: any = list.map((item: any) => {
        return {
          business_data: item,
          value: item.packageId,
          label: `${item.name}(${item.packageDesc})`,
        };
      });
      setPackageOptions(tempPackageOptions);
    }
  };

  const handleStrategyOptions = (list: any) => {
    if (!_.isEmpty(list)) {
      const tempStrategyOptions = list.map((item: any) => {
        return {
          business_data: item,
          value: item.strategyId,
          label: `${item.name}(${item.description})`,
        };
      });
      setStrategyOptions(tempStrategyOptions);
    }
  };

  useEffect(() => {
    if (id) {
      const { graph } = FlowGraph;
      const cell = graph.getCellById(id);
      if (!cell || !cell.isNode()) {
        return;
      }
      cellRef.current = cell;

      // 设置业务属性data
      const cellData = cell.getData();
      // 设置包options
      setSelectPackage(Object.create(null));
      setPackageOptions([]);
      handlePackageOptions(packageList);
      if (cell.getData().type === 5) {
        // 刷新特征list
        featureRun({
          appId,
        });
      }
      // 设置包下策略options
      setSelectStrategy(Object.create(null));
      setStrategyOptions([]);
      if (cellData.hasOwnProperty('packageId')) {
        const findStrategyList: any = _.find(packageList, {
          packageId: Number(cellData.packageId),
        });
        handleStrategyOptions(findStrategyList.strategyContentParams);
      }
      // 设置策略options
      handleFeatureOptions(featureList);
      businessForm.resetFields();
      businessForm.setFieldsValue(cellData);
      setCurrentNodeData(cellData);
      // businessForm.setFieldsValue({ packageId: Number(cellData.packageId) });
      // 设置基本属性data
      const baseData = cell.getProp('baseData');
      baseForm.resetFields();
      baseForm.setFieldsValue(baseData);
    }
  }, [id]);

  // 节点属性值发生变化
  const onAttrsChange = (changedValues: any) => {
    // cellRef.current?.setAttrs(allValues);

    const currentBaseData = cellRef.current?.getProp('baseData');
    // 设置name以及label名称
    if (changedValues.hasOwnProperty('name')) {
      // ['text', 'textWrap', 'text']
      const currentAttrs = cellRef.current?.getAttrs();

      cellRef.current?.setProp('attrs', {
        ...currentAttrs,
        text: { ...currentAttrs?.text, textWrap: { text: changedValues.name } },
      });
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

  const onDataChange = (_changedValues: any, allValues: any) => {
    const cellData = cellRef.current?.getData();
    if (cellData.type === 5) {
      allValues.appId = Number(appId);
    }
    // console.log('allValues',allValues);

    // if (!_.isEmpty(allValues.diversionTypeParam)) {
    //   // delete allValues.diversionTypeParam;
    //   if (!_.isEmpty(allValues.diversionTypeParam.diversionType) && allValues.diversionTypeParam.diversionType === 1) {
    //     allValues.diversionTypeParam.defineTypeBottomStrategy = 1;
    //   }
    //   else {
    //     delete allValues.diversionTypeParam.defineTypeBottomStrategy;
    //     delete allValues.diversionTypeParam.featureId;
    //     delete allValues.diversionTypeParam.featureName;
    //   }
    // }

    cellRef.current?.setData(allValues);
    // setCurrentEdgeData(cellRef.current?.getProp('data'));
    setCurrentNodeData(allValues);
  };

  useMemo(() => {
    if (!_.isEmpty(selectPackage)) {
      const cellData = cellRef.current?.getData();
      // 重选包下拉框时重置 策略 策略版本data
      delete cellData.strategyId;
      delete cellData.strategyName;
      delete cellData.strategyDesc;
      delete cellData.strategyVersion;
      delete cellData.strategyContentId;
      cellRef.current?.setData({
        ...cellData,
        packageId: selectPackage.packageId,
        packageName: selectPackage.name,
        packageDesc: selectPackage.packageDesc,
        packageVersion: selectPackage.version,
        packageContentId: selectPackage.packageContentId,
      });
    }
  }, [selectPackage]);

  useMemo(() => {
    if (!_.isEmpty(selectStrategy)) {
      const cellData = cellRef.current?.getData();
      cellRef.current?.setData({
        ...cellData,
        strategyId: selectStrategy.strategyId,
        strategyName: selectStrategy.name,
        strategyDesc: selectStrategy.description,
        strategyVersion: selectStrategy.stableVersion,
        strategyContentId: selectStrategy.strategyContentId,
      });
    }
  }, [selectStrategy]);

  useMemo(() => {
    if (!_.isEmpty(selectFeature)) {
      const cellData = cellRef.current?.getData();
      const featureObj = {
        featureId: selectFeature.id,
        featureName: selectFeature.featureName,
      };
      cellRef.current?.setData({
        ...cellData,
        diversionTypeParam: {
          ...cellData.diversionTypeParam,
          ...featureObj,
        },
      });
    }
  }, [selectFeature]);

  // useMemo(() => {
  //   const cellData = cellRef.current?.getData();
  //   if (!_.isEmpty(cellData)) {
  //     console.log('cellData', cellData);

  //     delete cellData.diversionTypeParam;
  //     let defineTypeBottomStrategyObj = Object.create(null);
  //     if (selectDiversionType === 1) {
  //       defineTypeBottomStrategyObj = {
  //         defineTypeBottomStrategy: 1,
  //       };
  //     }
  //     console.log('eeee',selectDiversionType,defineTypeBottomStrategyObj);

  //     cellRef.current?.setData({
  //       ...cellData,
  //       diversionTypeParam: {
  //         diversionType: selectDiversionType,
  //         ...defineTypeBottomStrategyObj,
  //       },
  //     });
  //     console.log('selectDiversionType data ', cellRef.current?.getData());
  //   }
  // }, [selectDiversionType]);

  /**
   * 策略属性
   */
  const renderStrategyProperty = () => {
    // packageId: 1,
    // packageName: '包名称',
    // packageDesc: '包描述'
    // packageVersion: 1,
    // packageContentId: 100, //策略内容ID 根据version
    // 根据包 查找策略
    // strategyId: 1,
    // strategyName: '策略名称',
    // strategyDesc: '策略描述',
    // 根据策略 查找策略版本及策略内容ID
    // strategyVersion: 1,
    // strategyContentId: 100, //策略内容ID 根据version
    return (
      <Spin spinning={loading} tip="加载中...">
        <ProCard
          title="策略配置"
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
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={async () => {
                  setLoading(true);
                  // 重新加载获取包列表接口
                  await packageRun({ appId });
                  // 设置包options
                  setPackageOptions([]);
                  handlePackageOptions(packageList);
                  // 设置包下策略options
                  setStrategyOptions([]);
                  if (!_.isEmpty(selectPackage)) {
                    const findStrategyList: any = _.find(packageList, {
                      packageId: Number(selectPackage.packageId),
                    });
                    handleStrategyOptions(findStrategyList.strategyContentParams);
                  }
                  setLoading(false);
                }}
              >
                获取最新
              </Button>
            </Space>
            <ProFormSelect
              name="packageId"
              label="包"
              showSearch
              options={packageOptions}
              rules={[
                {
                  required: true,
                },
              ]}
              fieldProps={{
                size: 'small',
                showArrow: true,
                // filterOption: false,
                filterOption: (input, option) =>
                  option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0,
                // onSearch: (value) => handleSearchPackage(value),
                onChange: (value, option) => {
                  if (value) {
                    setSelectPackage(option['business_data']);
                    setSelectStrategy(Object.create(null));
                    businessForm.setFieldsValue({ strategyId: undefined });
                    businessForm.setFieldsValue({
                      packageVersion: option['business_data'].version,
                    });
                    businessForm.setFieldsValue({ strategyVersion: undefined });
                    handleStrategyOptions(option['business_data'].strategyContentParams);
                  }
                },
                onBlur: packageCancel,
                onClear: () => {
                  setSelectPackage(Object.create(null));
                  setSelectStrategy(Object.create(null));
                  businessForm.setFieldsValue({ strategyId: undefined });
                  businessForm.setFieldsValue({ packageVersion: undefined });
                  businessForm.setFieldsValue({ strategyVersion: undefined });
                  // packageRun({
                  //   appId,
                  // });
                },
                loading: packageLoading,
                notFoundContent: packageLoading ? <Spin size="small" /> : <Empty />,
              }}
            />
            <ProFormText
              name="packageVersion"
              label="包版本"
              placeholder=""
              fieldProps={{
                size: 'small',
              }}
              disabled
            />
            <ProFormSelect
              name="strategyId"
              label="策略"
              showSearch
              options={strategyOptions}
              rules={[
                {
                  required: true,
                },
              ]}
              fieldProps={{
                size: 'small',
                showArrow: true,
                // filterOption: false,
                filterOption: (input, option) =>
                  option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0,
                // onSearch: (value) => handleSearchStrategy(value),
                onChange: (value, option) => {
                  if (value) {
                    setSelectStrategy(option['business_data']);
                    businessForm.setFieldsValue({
                      strategyVersion: option['business_data'].stableVersion,
                    });
                  }
                },
                // onBlur: strategyCancel,
                onClear: () => {
                  setSelectStrategy(Object.create(null));
                  businessForm.setFieldsValue({ strategyId: undefined });
                  businessForm.setFieldsValue({ strategyVersion: undefined });
                },
              }}
              // disabled={_.isEmpty(selectPackage) && !cellData.isReadOnly}
            />
            <ProFormText
              name="strategyVersion"
              label="策略版本"
              placeholder=""
              fieldProps={{
                size: 'small',
              }}
              disabled
            />
          </ProForm>
        </ProCard>
      </Spin>
    );
  };

  /**
   * 实验分流类型
   */
  const defineTypeBottomStrategyRender = () => {
    const cellData = cellRef.current?.getData();
    try {
      if (
        !_.isEmpty(cellData.diversionTypeParam) &&
        cellData.diversionTypeParam.diversionType === 1
      ) {
        return (
          <>
            <ProFormSelect
              name={['diversionTypeParam', 'featureId']}
              label="特征"
              showSearch
              options={featureOptions}
              rules={[
                {
                  required: true,
                },
              ]}
              fieldProps={{
                size: 'small',
                showArrow: true,
                filterOption: false,
                onSearch: (value) => handleSearchFeature(value),
                onChange: (value, option: any) => {
                  if (value) {
                    setSelectFeature(option['business_data']);
                  }
                },
                onBlur: featureCancel,
                onClear: async () => {
                  setSelectFeature(Object.create(null));
                  // await featureRun({
                  //   appId,
                  // });
                },
                loading: featureLoading,
                notFoundContent: featureLoading ? <Spin size="small" /> : <Empty />,
              }}
              disabled={currentNodeData.isReadOnly}
            />
            <div className="define-type-bottom-strategy">
              <ProFormRadio.Group
                name={['diversionTypeParam', 'defineTypeBottomStrategy']}
                label="实验分流类型"
                options={Object.keys(DiversionTypeParamEnum).map((key) => {
                  return {
                    value: Number(key),
                    label: DiversionTypeParamEnum[key],
                  };
                })}
                rules={[
                  {
                    required: true,
                  },
                ]}
                fieldProps={{ size: 'small' }}
                // initialValue={cellData.diversionTypeParam.defineTypeBottomStrategy}
              />
            </div>
          </>
        );
      }
      return <></>;
    } catch (e) {
      return <></>;
    }
  };

  /**
   * 实验属性
   */
  const renderExperimentProperty = () => {
    // experimentName: '实验名称',
    // experimentDesc: '实验描述',
    // flag: '实验表示',
    // diversionType: '分流类型',
    // diversionFun: '分流函数',
    return (
      <ProCard
        title="实验配置"
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
          <ProFormText
            name={['experimentName']}
            label="实验名称"
            rules={[
              {
                required: true,
              },
            ]}
            fieldProps={{ size: 'small', autoFocus: false }}
            disabled={currentNodeData.isReadOnly}
          />
          <ProFormTextArea
            name={['experimentDesc']}
            label="实验描述"
            fieldProps={{
              rows: 2,
              size: 'small',
            }}
            disabled={currentNodeData.isReadOnly}
          />
          <ProFormText
            name={['flag']}
            label="实验标识"
            rules={[
              {
                required: true,
              },
            ]}
            fieldProps={{ size: 'small' }}
            disabled={currentNodeData.isReadOnly}
          />
          <ProFormRadio.Group
            name={['diversionTypeParam', 'diversionType']}
            label="分流类型"
            options={Object.keys(DiversionTypeEnum).map((key) => {
              return {
                value: Number(key),
                label: DiversionTypeEnum[key],
              };
            })}
            rules={[
              {
                required: true,
              },
            ]}
            fieldProps={{
              size: 'small',
              onChange: (e) => {
                setSelectDiversionType(e.target.value);
              },
            }}
          />
          {defineTypeBottomStrategyRender()}
          {/* <ProFormText name={['diversionFun']} label="分流函数" fieldProps={{ size: 'small' }} /> */}
        </ProForm>
      </ProCard>
    );
  };

  const renderNodeProperty = () => {
    let renderContent;
    const dataType: number = cellRef.current?.getData().type || 0;
    switch (dataType) {
      case 5:
        renderContent = renderExperimentProperty();
        break;
      case 6:
        renderContent = renderStrategyProperty();
        break;
      default:
        renderContent = <></>;
        break;
    }
    return renderContent;
  };

  return (
    <>
      <ProCard title="节点设置" headerBordered size="small" className="my-flow-pro-card">
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
        </ProForm>
      </ProCard>
      {renderNodeProperty()}
    </>
  );
};
