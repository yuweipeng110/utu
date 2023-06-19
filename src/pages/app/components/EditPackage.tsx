import React, { useEffect, useState } from 'react';
import { history, Link, useRequest } from 'umi';
import type { ConnectProps } from 'umi';
import { Button, Empty, Form, message, Space, Spin } from 'antd';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import ProDescriptions, { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import { getPackageDetail, previewPackage } from '@/services/package';
import { AppInfo } from '@/models/app';
import { PackageFlowContent, PackageInfo, PackageStrategyContent } from '@/models/package';
import { getStrategyStableVersion } from '@/services/strategy';
import { getFlowVersion } from '@/services/flow';
import { getPageQuery } from '@/utils/utils';
import SavePackage from './ModalForm/SavePackage';
import ViewCode from './Modal/ViewCode';
import '../index.less';
import _ from 'lodash';
import moment from 'moment';

const defaultSelectStrategy = {
  index: -999,
  editable: true,
};

const defaultSelectFlow = {
  index: -999,
  editable: true,
};

const EditPackage: React.FC = () => {
  const queryParams = getPageQuery();
  const appId = queryParams['app_id'];
  const packageId = queryParams['id'];
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPackageData, setCurrentPackageData] = useState<PackageInfo>(Object.create(null));
  const [selectStrategy, setSelectStrategy] = useState<Partial<PackageStrategyContent>>(
    Object.create(null),
  );
  const [selectStrategyVersion, setSelectStrategyVersion] = useState(Object.create(null));
  const [strategyContentList, setStrategyContentList] = useState<Partial<PackageStrategyContent>[]>(
    [defaultSelectStrategy],
  );
  const [strategyOptions, setStrategyOptions] = useState([]);
  const [selectFlow, setSelectFlow] = useState<Partial<PackageFlowContent>>(Object.create(null));
  const [selectFlowVersion, setSelectFlowVersion] = useState(Object.create(null));
  const [flowContentList, setFlowContentList] = useState<Partial<PackageFlowContent>[]>([
    defaultSelectFlow,
  ]);
  const [flowOptions, setFlowOptions] = useState([]);
  const [refreshRandom, setRefreshRandom] = useState<string>('');
  const [savePackageModalVisible, handleSavePackageModalVisible] = useState<boolean>(false);
  const [viewPackageCodeModalVisible, handleViewPackageCodeModalVisible] = useState<boolean>(false);
  const [previewSourceCode, setPreviewSourceCode] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);

  const loadPackageInfo = async () => {
    setIsLoading(true);
    const res = await getPackageDetail({
      packageId,
    });
    setIsLoading(false);
    if (!res) {
      history.push('/error');
      return;
    }
    setCurrentPackageData(res);
    res.strategyContentList &&
      setStrategyContentList([defaultSelectStrategy, ...res.strategyContentList]);
    res.flowContentList && setFlowContentList([defaultSelectFlow, ...res.flowContentList]);
  };

  useEffect(() => {
    if (packageId) {
      loadPackageInfo();
      strategyRun({
        appId,
        packageId,
      });
      flowRun({
        appId,
        packageId,
      });
    }
  }, [packageId, refreshRandom]);

  const viewPackageModalStatusSwitch = async (viewPackageModalStatus: boolean) => {
    handleViewPackageCodeModalVisible(viewPackageModalStatus);
    setPreviewLoading(true);
    const resetStrategyContentList = strategyContentList.slice(1);
    const resetFlowContentList = flowContentList.slice(1);
    const res = await previewPackage({
      packageId: packageId,
      strategyContentList: resetStrategyContentList.map((item: any, index: number) => {
        return {
          ...item,
          index,
        };
      }),
      flowContentList: resetFlowContentList.map((item: any, index: number) => {
        return {
          ...item,
          index,
        };
      }),
    });
    setPreviewLoading(false);
    if (res.code !== 1) {
      message.error(res.message);
      handleViewPackageCodeModalVisible(false);
      return false;
    }
    setPreviewSourceCode(res.data);
    return true;
  };

  const resetStrategyForm = () => {
    form.setFieldsValue({ strategyId: undefined });
    form.setFieldsValue({ strategyVersion: undefined });
    setSelectStrategy(Object.create(null));
    setSelectStrategyVersion(Object.create(null));
  };

  const resetFlowForm = () => {
    form.setFieldsValue({ flowId: undefined });
    form.setFieldsValue({ flowVersion: undefined });
    setSelectFlow(Object.create(null));
    setSelectFlowVersion(Object.create(null));
  };

  const {
    loading: strategyLoading,
    run: strategyRun,
    cancel: strategyCancel,
  } = useRequest(getStrategyStableVersion, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      const newOptions = res.map((item: any) => {
        return {
          business_data: item,
          value: item.strategyId,
          label: `${item.name}(${item.description})`,
        };
      });
      setStrategyOptions(newOptions);
    },
  });

  const handleSearchStrategy = (value: string) => {
    if (value.length === 0) return;
    setStrategyOptions([]);
    strategyRun({
      appId,
      packageId,
      keywords: value,
    });
  };

  const {
    loading: flowLoading,
    run: flowRun,
    cancel: flowCancel,
  } = useRequest(getFlowVersion, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      const newOptions = res.map((item: any) => {
        return {
          business_data: item,
          value: item.flowId,
          label: `${item.name}(${item.description})`,
        };
      });
      setFlowOptions(newOptions);
    },
  });

  const handleSearchFlow = (value: string) => {
    if (value.length === 0) return;
    setFlowOptions([]);
    flowRun({
      appId,
      packageId,
      name: value,
    });
  };

  const editColumns: ProDescriptionsItemProps<PackageInfo>[] = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '版本',
      dataIndex: 'version',
      render: (dom, record) => {
        if (record.version === 0) {
          return '-';
        }
        return <span style={{ color: 'red' }}>V{dom}</span>;
      },
    },
    {
      title: '修改人',
      dataIndex: 'modifyUser',
    },
    {
      title: '修改时间',
      dataIndex: 'modifyTime',
      valueType: 'dateTime',
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'changeDesc',
      ellipsis: true,
    },
  ];

  /**
   * 添加关联策略
   */
  const addRelationStrategy = () => {
    let checkResult = false;
    const strategyId = form.getFieldValue('strategyId');
    const stableVersion = form.getFieldValue('stableVersion');
    if (strategyId && stableVersion) {
      const newRelationStrategy = {
        index: strategyContentList.length - 1,
        strategyId,
        name: selectStrategy.name,
        description: selectStrategy.description,
        updateUser: selectStrategyVersion.updateUser,
        updateTime: selectStrategyVersion.updateTime,
        stableVersion,
      };
      const newData =
        strategyContentList.map((item) => {
          if (strategyId === item.strategyId) {
            checkResult = true;
          }
          return item;
        }) || [];
      if (checkResult) {
        message.error('同一个策略不能多次引用');
        return false;
      }
      newData.push(newRelationStrategy);
      setStrategyContentList(newData);
      // 重置选择
      resetStrategyForm();
      return true;
    }
    return false;
  };

  /**
   * 删除关联策略
   *
   * @param index
   */
  const removeRelationStrategy = (index: any) => {
    const newData: any = strategyContentList?.filter((item) => item.index !== index);
    const handleData = newData.slice(1).map((item: any, index: number) => {
      return {
        ...item,
        index,
      };
    });
    setStrategyContentList([defaultSelectStrategy, ...handleData]);
  };

  /**
   * 添加关联决策流
   */
  const addRelationFlow = () => {
    let checkResult = false;
    const flowId = form.getFieldValue('flowId');
    const flowVersion = form.getFieldValue('flowVersion');
    if (flowId && flowVersion) {
      const newRelationFlow = {
        index: flowContentList.length - 1,
        flowId,
        name: selectFlow.name,
        description: selectFlow.description,
        updateUser: selectFlowVersion.updateUser,
        updateTime: selectFlowVersion.updateTime,
        version: Number(flowVersion),
      };
      const newData =
        flowContentList.map((item) => {
          if (flowId === item.flowId) {
            checkResult = true;
          }
          return item;
        }) || [];
      if (checkResult) {
        message.error('同一个决策流不能多次引用');
        return false;
      }
      newData.push(newRelationFlow);
      setFlowContentList(newData);
      // 重置选择
      resetFlowForm();
      return true;
    }
    return false;
  };

  /**
   * 删除关联决策流
   * @param index
   */
  const removeRelationFlow = (index: any) => {
    const newData: any = flowContentList?.filter((item) => item.index !== index);
    const handleData = newData.slice(1).map((item: any, index: number) => {
      return {
        ...item,
        index,
      };
    });
    setFlowContentList([defaultSelectFlow, ...handleData]);
  };

  const relationStrategyColumns: ProColumns<Partial<PackageStrategyContent>>[] = [
    {
      title: '策略名称',
      dataIndex: 'name',
      width: '40%',
      // @ts-ignore
      editable: true,
      render: (dom, record) => {
        if (!record.editable) {
          return (
            <a
              href={`#/knowledge/strategy/detail?app_id=${appId}&id=${record.strategyId}&version=${record.stableVersion}`}
              target="_blank"
            >
              {dom}
            </a>
          );
        }
        return (
          <ProFormSelect
            name="strategyId"
            // width="md"
            showSearch
            options={strategyOptions}
            fieldProps={{
              showArrow: true,
              filterOption: false,
              onSearch: (value) => handleSearchStrategy(value),
              onChange: (value, option: any) => {
                if (value) {
                  if (_.isEmpty(option['business_data'].stableVersionList)) {
                    message.error('当前策略没有保存稳定版本');
                  }
                  setSelectStrategy(option['business_data']);
                  form.setFieldsValue({ stableVersion: undefined });
                }
              },
              onBlur: strategyCancel,
              onClear: async () => {
                await strategyRun({
                  appId,
                  packageId,
                });
                resetStrategyForm();
              },
              // onClick: async () => {
              //   if (!form.getFieldValue('strategyId')) {
              //     await strategyRun({
              //       appId,
              //       packageId,
              //     });
              //   }
              // },
              loading: strategyLoading,
              notFoundContent: strategyLoading ? <Spin size="small" /> : <Empty />,
            }}
          />
        );
      },
    },
    {
      title: '策略版本',
      dataIndex: 'stableVersion',
      width: '20%',
      // @ts-ignore
      editable: true,
      render: (dom, record) => {
        if (!record.editable) {
          return <span style={{ color: 'red' }}>V{dom}</span>;
        }
        if (!_.isEmpty(selectStrategy)) {
          const strategyVersionOptions = selectStrategy.stableVersionList?.map((item: any) => {
            return {
              business_data: item,
              value: item.stableVersion,
              label: `V${item.stableVersion}`,
            };
          });
          return (
            <ProFormSelect
              name="stableVersion"
              // width="md"
              options={strategyVersionOptions}
              fieldProps={{
                onChange: (value, option: any) => {
                  if (value) {
                    setSelectStrategyVersion(option['business_data']);
                  }
                },
              }}
            />
          );
        }
        return null;
      },
    },
    {
      title: '修改人',
      dataIndex: 'updateUser',
      render: (dom, record) => {
        if (!record.editable) {
          return dom;
        }
        return !_.isEmpty(selectStrategyVersion) && selectStrategyVersion.updateUser;
      },
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      render: (dom, record) => {
        if (!record.editable) {
          return record.updateTime && moment(record.updateTime).format('YYYY-MM-DD HH:mm:ss');
        }
        return (
          !_.isEmpty(selectStrategyVersion) &&
          moment(selectStrategyVersion.updateTime).format('YYYY-MM-DD HH:mm:ss')
        );
      },
    },
    {
      title: '操作',
      align: 'center',
      valueType: 'option',
      render: (dom, record) => {
        const addBtn = (
          <Button type="link" onClick={addRelationStrategy}>
            添加
          </Button>
        );
        const deleteBtn = (
          <Button
            key="deleteBtn"
            type="link"
            size="small"
            onClick={() => removeRelationStrategy(record.index)}
          >
            删除
          </Button>
        );
        if (record.editable) {
          return addBtn;
        }
        return deleteBtn;
      },
    },
  ];

  const relationFlowColumns: ProColumns<Partial<PackageFlowContent>>[] = [
    {
      title: '决策流名称',
      dataIndex: 'name',
      width: '40%',
      // @ts-ignore
      editable: true,
      render: (dom, record) => {
        if (!record.editable) {
          return (
            <a
              href={`#/knowledge/flow/update?app_id=${appId}&id=${record.flowId}&version=${record.version}`}
              target="_blank"
            >
              {dom}
            </a>
          );
        }
        return (
          <ProFormSelect
            name="flowId"
            // width="md"
            showSearch
            options={flowOptions}
            fieldProps={{
              showArrow: true,
              filterOption: false,
              onSearch: (value) => handleSearchFlow(value),
              onChange: (value, option: any) => {
                if (value) {
                  setSelectFlow(option['business_data']);
                  form.setFieldsValue({ flowVersion: undefined });
                }
              },
              onBlur: flowCancel,
              onClear: async () => {
                await flowRun({
                  appId,
                  packageId,
                });
                resetStrategyForm();
              },
              // onClick: async () => {
              //   if (!form.getFieldValue('flowId')) {
              //     await flowRun({
              //       appId,
              //       packageId,
              //     });
              //   }
              // },
              loading: flowLoading,
              notFoundContent: flowLoading ? <Spin size="small" /> : <Empty />,
            }}
          />
        );
      },
    },
    {
      title: '决策流版本',
      dataIndex: 'version',
      width: '20%',
      // @ts-ignore
      editable: true,
      render: (dom, record) => {
        if (!record.editable) {
          return <span style={{ color: 'red' }}>V{dom}</span>;
        }
        if (!_.isEmpty(selectFlow)) {
          const flowVersionOptions = selectFlow.versionList?.map((item: any) => {
            return {
              business_data: item,
              value: item.version,
              label: `V${item.version}`,
            };
          });
          return (
            <ProFormSelect
              name="flowVersion"
              // width="md"
              options={flowVersionOptions}
              fieldProps={{
                onChange: (value, option: any) => {
                  if (value) {
                    setSelectFlowVersion(option['business_data']);
                  }
                },
              }}
            />
          );
        }
        return null;
      },
    },
    {
      title: '修改人',
      dataIndex: 'updateUser',
      render: (dom, record) => {
        if (!record.editable) {
          return dom;
        }
        return !_.isEmpty(selectFlowVersion) && selectFlowVersion.updateUser;
      },
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      render: (dom, record) => {
        if (!record.editable) {
          return record.updateTime && moment(record.updateTime).format('YYYY-MM-DD HH:mm:ss');
        }
        return (
          !_.isEmpty(selectFlowVersion) &&
          moment(selectFlowVersion.updateTime).format('YYYY-MM-DD HH:mm:ss')
        );
      },
    },
    {
      title: '操作',
      align: 'center',
      valueType: 'option',
      render: (dom, record) => {
        const addBtn = <a onClick={addRelationFlow}>添加</a>;
        const deleteBtn = <a onClick={() => removeRelationFlow(record.index)}>删除</a>;
        if (record.editable) {
          return addBtn;
        }
        return deleteBtn;
      },
    },
  ];

  return (
    <PageContainer>
      <Spin spinning={isLoading} size="large">
        <ProCard
          title="包内容"
          headerBordered
          extra={
            <Space>
              <Button type="primary" onClick={() => viewPackageModalStatusSwitch(true)}>
                预览
              </Button>
              <Button type="primary" onClick={() => handleSavePackageModalVisible(true)}>
                保存
              </Button>
            </Space>
          }
        >
          <ProForm form={form} submitter={false} layout="inline">
            <Space size="large" direction="vertical" style={{ width: '100%' }}>
              <ProDescriptions
                bordered
                column={3}
                title={false}
                dataSource={currentPackageData}
                columns={editColumns}
                style={{ width: '100%' }}
                size="small"
              />
              <ProCard
                tabs={{
                  type: 'card',
                  animated: true,
                }}
              >
                <ProCard.TabPane
                  key="tab1"
                  tab="策略管理"
                  cardProps={{
                    extra: (
                      <Space size="small">
                        <Button type="primary">
                          <Link
                            to={`/knowledge/strategy/update?app_id=${appId}&package_id=${packageId}`}
                          >
                            创建策略
                          </Link>
                        </Button>
                      </Space>
                    ),
                  }}
                >
                  <ProTable<Partial<PackageStrategyContent>>
                    rowKey="index"
                    columns={relationStrategyColumns}
                    dataSource={strategyContentList}
                    pagination={false}
                    options={false}
                    search={false}
                    size="small"
                  />
                </ProCard.TabPane>
                <ProCard.TabPane
                  key="tab2"
                  tab="决策流管理"
                  cardProps={{
                    extra: (
                      <Space size="small">
                        <Button type="primary">
                          <Link to={`/knowledge/flow`}>创建决策流</Link>
                        </Button>
                      </Space>
                    ),
                  }}
                >
                  <ProTable<Partial<PackageFlowContent>>
                    rowKey="index"
                    columns={relationFlowColumns}
                    dataSource={flowContentList}
                    pagination={false}
                    options={false}
                    search={false}
                    size="small"
                  />
                </ProCard.TabPane>
              </ProCard>
            </Space>
          </ProForm>
        </ProCard>
      </Spin>
      <SavePackage
        visible={savePackageModalVisible}
        onVisibleChange={handleSavePackageModalVisible}
        currentPackageData={currentPackageData}
        setIsLoading={setIsLoading}
        strategyContentList={strategyContentList}
        flowContentList={flowContentList}
        setRefreshRandom={setRefreshRandom}
        resetStrategyForm={resetStrategyForm}
      />
      <ViewCode
        visible={viewPackageCodeModalVisible}
        onVisibleChange={handleViewPackageCodeModalVisible}
        sourceCode={previewSourceCode}
        previewLoading={previewLoading}
      />
    </PageContainer>
  );
};

export default EditPackage;
