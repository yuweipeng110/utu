import React, { useEffect, useState } from 'react';
import { useRequest, history } from 'umi';
import { Form, Spin, Empty, Space, Button, message } from 'antd';
import ProCard from '@ant-design/pro-card';
import ProForm, { ProFormTextArea, ProFormSelect } from '@ant-design/pro-form';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import type { StrategyDeployInfo } from '@/models/strategyDeploy';
import { querySceneList } from '@/services/app';
import { getStrategyPackage, getPackageList } from '@/services/package';
import type { PackageContentInfo } from '@/models/package';
import { appDeployStageHandler, appDeployPreview } from '@/services/appDeploy';
import { getPageQuery } from '@/utils/utils';
import ViewCode from '@/components/Modal/ViewCode';
import _ from 'lodash';

const defaultSelectPackage = {
  index: -999,
  editable: true,
};

export type StrategyDeployStep10Props = {
  setLoading: any;
  currentAppDeployData?: StrategyDeployInfo;
  createAppDeployResultSwitch?: any;
  setRandom?: any;
  stagePrevious: any;
  stageNext: any;
  onRefresh?: any;
};

const StrategyDeployStep10: React.FC<StrategyDeployStep10Props> = (props) => {
  const {
    setLoading,
    currentAppDeployData,
    createAppDeployResultSwitch,
    setRandom,
    stagePrevious,
    stageNext,
    onRefresh,
  } = props;
  const queryParams = getPageQuery();
  const appId = queryParams['app_id'];
  const [form] = Form.useForm();

  const [sceneOptions, setSceneOptions] = useState([]);
  const [relationPackageList, setRelationPackageList] = useState([defaultSelectPackage]);
  const [packageOptions, setPackageOptions] = useState([]);
  const [selectPackage, setSelectPackage] = useState(Object.create(null));
  const [selectPackageVersion, setSelectPackageVersion] = useState(Object.create(null));
  const [relationPackageLoading, setRelationPackageLoading] = useState<boolean>(false);
  const [viewDeployCodeModalVisible, handleViewDeployCodeModalVisible] = useState<boolean>(false);
  const [previewSourceCode, setPreviewSourceCode] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const tmpRelationPackageList = !_.isEmpty(currentAppDeployData)
    ? relationPackageList
    : relationPackageList.slice(1);

  useEffect(() => {
    if (!_.isEmpty(currentAppDeployData)) {
      !_.isEmpty(currentAppDeployData?.packageList) &&
        setRelationPackageList([...(currentAppDeployData?.packageList as any)]);
    }
  }, [currentAppDeployData]);

  const {
    loading: sceneLoading,
    run: sceneRun,
    cancel: sceneCancel,
  } = useRequest(querySceneList, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      const newOptions = res.data.datas.map((item: any) => {
        return {
          business_data: item,
          value: item.sceneId,
          label: `${item.sceneName}`,
        };
      });
      setSceneOptions(newOptions);
    },
  });

  const {
    loading: packageLoading,
    run: packageRun,
    cancel: packageCancel,
  } = useRequest(getStrategyPackage, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      const newOptions = res.map((item: any) => {
        return {
          business_data: item,
          value: item.packageId,
          label: item.name,
        };
      });
      setPackageOptions(newOptions);
    },
  });

  useEffect(() => {
    sceneRun({
      pageSize: 10,
      pageIndex: 0,
      appId,
    });
    packageRun({
      pageSize: 10,
      pageIndex: 0,
      appId,
    });
  }, []);

  const handleSearchScene = (value: string) => {
    if (value.length === 0) return;
    setSceneOptions([]);
    sceneRun({
      pageSize: 10,
      pageIndex: 0,
      appId,
      sceneName: value,
    });
  };

  const handleSearchPackage = (value: string) => {
    if (value.length === 0) return;
    setPackageOptions([]);
    packageRun({
      pageSize: 10,
      pageIndex: 0,
      appId,
      name: value,
    });
  };

  const selectAddRelationPackage = async (sceneId: number) => {
    setRelationPackageLoading(true);
    const res = await getPackageList({
      appId: Number(appId),
      sceneId,
    });
    setRelationPackageList([defaultSelectPackage]);
    if (res.paramList) {
      const tmpRelationPackageList = res.paramList.map((item: any, index: number) => {
        return {
          index,
          name: item.packageName,
          description: item.description,
          packageId: item.packageId,
          version: item.version,
          remark: item.remark,
        };
      });
      setRelationPackageList([defaultSelectPackage, ...tmpRelationPackageList]);
    }
    setRelationPackageLoading(false);
  };

  const viewDeployModalStatusSwitch = async (viewDeployModalStatus: boolean) => {
    handleViewDeployCodeModalVisible(viewDeployModalStatus);
    setPreviewLoading(true);
    const res = await appDeployPreview({
      orderId: currentAppDeployData?.id,
      paramList: tmpRelationPackageList.map((item: any, index: number) => {
        return {
          ...item,
          index,
        };
      }),
    });
    setPreviewLoading(false);
    if (res.code !== 1) {
      handleViewDeployCodeModalVisible(false);
      return false;
    }
    setPreviewSourceCode(res.data);
    return true;
  };

  const addRelationPackage = () => {
    let checkResult = false;
    const packageId = form.getFieldValue('packageId');
    const packageVersion = form.getFieldValue('packageVersion');
    if (packageId && packageVersion) {
      const newRelationPackage = {
        index: relationPackageList.length - 1,
        name: selectPackage.packageName,
        description: selectPackage.description,
        packageId: selectPackage.packageId,
        version: Number(packageVersion),
        remark: selectPackageVersion.remark,
      };
      const newData =
        relationPackageList.map((item: any) => {
          if (selectPackage.packageName === item.name) {
            checkResult = true;
          }
          return item;
        }) || [];
      if (checkResult) {
        message.error('不能添加相同数据');
        return false;
      }
      newData.push(newRelationPackage);
      setRelationPackageList(newData);
      // 重置选择
      form.setFieldsValue({ packageId: undefined });
      form.setFieldsValue({ packageVersion: undefined });
      setSelectPackage(Object.create(null));
      setSelectPackageVersion(Object.create(null));
      return true;
    }
    setRelationPackageLoading(false);
    return false;
  };

  const removeRelationPackage = (index: number) => {
    const newData: any = relationPackageList?.filter((item) => item.index !== index);
    const handleData = newData.slice(1).map((item: any, index: number) => {
      return {
        ...item,
        index,
      };
    });
    setRelationPackageList([defaultSelectPackage, ...handleData]);
  };

  const onMovePackage = (index1: any, index2: any) => {
    const arr = relationPackageList.slice(1);
    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    const newArr = arr.map((item, index) => {
      return {
        ...item,
        index,
      };
    });
    setRelationPackageList([defaultSelectPackage, ...newArr]);
  };

  const relationPackageColumns: ProColumns<Partial<PackageContentInfo>>[] = [
    {
      title: '包',
      dataIndex: 'name',
      width: '40%',
      // @ts-ignore
      editable: true,
      render: (dom, record) => {
        if (!record.editable) {
          return dom;
        }
        return (
          <ProFormSelect
            label={false}
            name="packageId"
            showSearch
            options={packageOptions}
            fieldProps={{
              showArrow: true,
              filterOption: false,
              onSearch: (value) => handleSearchPackage(value),
              onChange: (value, option: any) => {
                if (value) {
                  setSelectPackage(option['business_data']);
                  form.setFieldsValue({ packageVersion: undefined });
                }
              },
              onBlur: packageCancel,
              onClear: async () => {
                await packageRun({
                  pageSize: 10,
                  pageIndex: 0,
                  appId,
                });
                // resetStrategyForm();
              },
              loading: packageLoading,
              notFoundContent: packageLoading ? <Spin size="small" /> : <Empty />,
            }}
          />
        );
      },
    },
    {
      title: '包版本',
      dataIndex: 'version',
      width: '20%',
      render: (dom, record) => {
        if (!record.editable) {
          return <>V{dom}</>;
        }
        if (!_.isEmpty(selectPackage) && !_.isEmpty(selectPackage.versionMap)) {
          let temSelectPackageVersionMap: any = [];
          for (var key in selectPackage.versionMap) {
            temSelectPackageVersionMap.push({
              version: key,
              remark: selectPackage.versionMap[key],
            });
          }

          let flowVersionOptions = _.sortBy(temSelectPackageVersionMap, (soryByItem) => {
            return -soryByItem.version;
          }).map((item: any) => {
            return {
              business_data: item,
              value: item.version,
              label: `V${item.version}(${item.remark})`,
            };
          });
          return (
            <ProFormSelect
              name="packageVersion"
              options={flowVersionOptions}
              fieldProps={{
                onChange: (value, option: any) => {
                  if (value) {
                    setSelectPackageVersion(option['business_data']);
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
      title: '描述',
      dataIndex: 'remark',
      render: (dom, record) => {
        if (!record.editable) {
          return dom;
        }
        return !_.isEmpty(selectPackageVersion) && selectPackageVersion.remark;
      },
    },
    {
      title: '操作',
      align: 'center',
      valueType: 'option',
      render: (dom, record) => {
        const addBtn = (
          <Button key="addBtn" type="link" onClick={addRelationPackage}>
            添加
          </Button>
        );
        const moveUpBtn = (
          <Button
            key="moveUpBtn"
            type="link"
            size="small"
            onClick={() => onMovePackage(record.index, record.index! - 1)}
            disabled={record.index! - 1 < 0}
          >
            上移
          </Button>
        );
        const moveDown = (
          <Button
            key="moveDown"
            type="link"
            size="small"
            onClick={() => onMovePackage(record.index, record.index! + 1)}
            disabled={record.index! + 1 >= relationPackageList.length - 1}
          >
            下移
          </Button>
        );
        const deleteBtn = (
          <Button key="deleteBtn" type="link" onClick={() => removeRelationPackage(record.index!)}>
            删除
          </Button>
        );
        if (!_.isEmpty(currentAppDeployData)) {
          return null;
        }
        if (record.editable) {
          return addBtn;
        }
        return (
          <Space size="small">
            {moveUpBtn}
            {moveDown}
            {deleteBtn}
          </Space>
        );
      },
    },
  ];

  const onSubmit = async (values: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      appId,
      stage: 0,
      paramList: relationPackageList.slice(1).map((item, index) => {
        return {
          ...item,
          index,
        };
      }),
    };
    setLoading(true);
    const res = await appDeployStageHandler(params);
    setLoading(false);
    if (res.code !== 1) {
      // message.error({ content: res.message, key: loadingKey, duration: 2 });
      message.destroy();
      createAppDeployResultSwitch(true, res);
      return false;
    }
    message.success({ content: '提交成功! ', key: loadingKey, duration: 2 });
    // refreshCurrent();
    history.push(`/app/strategyDeploy/update?app_id=${appId}&id=${res.data}`);
    // await onRefresh(currentAppDeployData?.stage);
    return true;
  };

  const onFinish = async (values: any) => {
    const success = await onSubmit(values);
    if (!success) {
      return false;
    }
    return true;
  };

  return (
    <>
      <ProCard
        title="选择包"
        headerBordered
        extra={
          <Button type="primary" onClick={() => viewDeployModalStatusSwitch(true)}>
            预览
          </Button>
        }
      >
        <ProForm
          form={form}
          onFinish={onFinish}
          layout="inline"
          submitter={{
            render: (props) => {
              if (_.isEmpty(currentAppDeployData)) {
                return (
                  <div style={{ textAlign: 'center', width: '100%', margin: '20px' }}>
                    <Space size="large">
                      <Button
                        type="default"
                        key="rest"
                        onClick={() => {
                          props.form?.resetFields();
                          setRelationPackageList([defaultSelectPackage]);
                          setSelectPackage(Object.create(null));
                          setSelectPackageVersion(Object.create(null));
                        }}
                      >
                        重置
                      </Button>
                      <Button type="primary" key="submit" onClick={() => props.form?.submit?.()}>
                        下一步
                      </Button>
                    </Space>
                  </div>
                );
              }
              return null;
            },
          }}
          initialValues={currentAppDeployData}
        >
          <Space size="large" direction="vertical" style={{ width: '100%' }}>
            <ProFormSelect
              name="sceneId"
              label="请选择场景"
              width="md"
              showSearch
              options={sceneOptions}
              rules={[
                {
                  required: true,
                },
              ]}
              fieldProps={{
                showArrow: true,
                filterOption: false,
                onSearch: (value) => handleSearchScene(value),
                onChange: (value) => {
                  if (value) {
                    selectAddRelationPackage(value);
                  }
                },
                onBlur: sceneCancel,
                onClear: async () => {
                  await sceneRun({
                    pageSize: 10,
                    pageIndex: 0,
                    appId,
                  });
                },
                onClick: async () => {
                  if (!form.getFieldValue('sceneId')) {
                    await sceneRun({
                      pageSize: 10,
                      pageIndex: 0,
                      appId,
                    });
                  }
                },
                loading: sceneLoading,
                notFoundContent: sceneLoading ? <Spin size="small" /> : <Empty />,
              }}
              disabled={!_.isEmpty(currentAppDeployData)}
            />
            <ProTable<Partial<PackageContentInfo>>
              rowKey="index"
              columns={relationPackageColumns}
              dataSource={relationPackageList}
              pagination={false}
              options={false}
              search={false}
              loading={relationPackageLoading}
              size="small"
            />
            <ProFormTextArea
              name="deployRemark"
              label="备注"
              placeholder="请输入备注"
              rules={[
                {
                  required: true,
                },
              ]}
              disabled={!_.isEmpty(currentAppDeployData)}
            />
          </Space>
        </ProForm>
      </ProCard>
      <ViewCode
        visible={viewDeployCodeModalVisible}
        onVisibleChange={handleViewDeployCodeModalVisible}
        sourceCode={previewSourceCode}
        previewLoading={previewLoading}
      />
    </>
  );
};

export default StrategyDeployStep10;
