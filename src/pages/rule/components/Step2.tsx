import React, { useEffect, useState } from 'react';
import { Button, Tabs, Radio, Select, message, Form, Card } from 'antd';
import type { BranchDetail, BranchDiffStruct, BranchStage } from '@/models/rule';
import RuleDetail from './RuleDetail';
import { getPageQuery } from '@/utils/utils';
import {
  fetchPublishDetail,
  publishStart,
  fetchLibraSug,
  abortPublishRequest,
  publishStop,
  branchDiffWith,
} from '@/services/rule';
import type { BPMSItem } from '@/models/rule';
import Step1 from "@/pages/rule/components/Step1";

const { TabPane } = Tabs;
const { Option } = Select;
const FormItem = Form.Item;

export type StepProps = {
  branchDetail: BranchDetail;
  branchId: number;
  bpms?: BPMSItem;
  changeMergeRequestDisabled?: Function;
  onRefreshDetail?: () => void;
};

interface PublishDetailStruct {
  branchId: string;
  publishState: number;
  runType: number;
  libra: {
    createTime: string;
    updateTime: string;
    id: number;
    branchId: string;
    conditionType: number;
    conditionValue: string;
  };
  diuWhiteList: any[] | null;
  adiuWhiteList: any[] | null;
}

type OptionList = {
  displayName: string;
  name: string;
};

const Step2 = ({ branchId, branchDetail, bpms, changeMergeRequestDisabled, onRefreshDetail }: StepProps) => {
  const [form] = Form.useForm();
  const [PublishDetail, setPublishDetail] = useState<PublishDetailStruct>(Object.create(null));
  const [options, setOptions] = useState<OptionList[]>([]);
  const [branchDiff, setBranchDiff] = useState<BranchDiffStruct>(Object.create(null));
  const [ruleObject, setRuleObject] = useState(Object.create(null));
  // const [groupList, setGroupList] = useState<BranchStage[]>([]);
  const [publishBtnDisabled, setPublishBtnDisabled] = useState<boolean>(false);

  const queryParams = getPageQuery();
  const appId = queryParams.app_id;
  const sceneId = queryParams.scene_id;

  const onRefresh = async () => {
    if (onRefreshDetail) {
      onRefreshDetail();
    }
  };

  const handlePublistBtnDisabledStatus = () => {
    const runType = form.getFieldValue('runType');
    const conditionValue = form.getFieldValue('conditionValue');
    if (runType !== false && conditionValue) {
      setPublishBtnDisabled(false);
    } else {
      setPublishBtnDisabled(true);
    }
  };

  const handleMergeRequestDisabled = (isDisabled: boolean) => {
    if (changeMergeRequestDisabled) {
      changeMergeRequestDisabled(isDisabled);
    }
  };

  const getPublishDetail = async () => {
    const res = await fetchPublishDetail({
      appId,
      sceneId,
      branchId,
    });
    if (res.code !== 1) {
      message.error('获取规则详情失败');
      return;
    }
    form.setFieldsValue({
      runType: res.data?.runType,
      conditionValue: res.data?.libra?.conditionValue,
    });
    setPublishDetail(res.data);
    handlePublistBtnDisabledStatus();
  };

  const getLibraSug = async () => {
    const res = await fetchLibraSug({
      appId,
      sceneId,
      query: '',
    });
    if (res && res.code === 1) {
      setOptions(res.data);
      if (res.data.length > 0) {
        form.setFieldsValue({
          conditionValue: res.data[0].name,
        });
        handlePublistBtnDisabledStatus();
      }
    }
  };

  const getBranchDiff = async () => {
    const res = await branchDiffWith({
      appId,
      sceneId,
      currentBranchId: branchId,
    });
    if (res.code === 1) {
      setBranchDiff(res.data);
    } else {
      message.error('获取diff详情失败');
    }
  };

  useEffect(() => {
    getPublishDetail();
    getLibraSug();
    getBranchDiff();

    if (branchDetail !== null) {
      setRuleObject({ stages: branchDetail?.ruleGroups });
      handleMergeRequestDisabled(branchDetail?.publishState === 0);
    }
  }, [branchDetail]);

  const onGroupsFormChange = (groups: BranchStage[]) => {
    setRuleObject({ ...ruleObject, stages: groups });
  };

  const renderStatus = (status: number) => {
    switch (status) {
      case 0:
        return <span>待发布</span>;
      case 1:
        return <span>已发布</span>;
      default:
        return null;
    }
  };

  const handlePublish = async (value: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在发布...', key: loadingKey, duration: 0 });
    const res = await publishStart({
      appId: Number(appId),
      sceneId: Number(sceneId),
      branchId,
      runType: value.runType,
      libra: {
        conditionValue: value.conditionValue,
      },
      branchType: branchDetail.branchType,
    });
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '发布成功!', key: loadingKey, duration: 2 });
    handleMergeRequestDisabled(false);
    getPublishDetail();
    onRefresh();
    return true;
  };

  const recall = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在撤销...', key: loadingKey, duration: 0 });
    const res = await abortPublishRequest({
      appId,
      sceneId,
      branchId,
    });
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '撤销成功!', key: loadingKey, duration: 2 });
    getPublishDetail();
    return true;
  };

  const pause = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在暂停...', key: loadingKey, duration: 0 });
    const res = await publishStop({
      appId,
      sceneId,
      branchId,
    });
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '暂停成功!', key: loadingKey, duration: 2 });
    handleMergeRequestDisabled(true);
    getPublishDetail();
    onRefresh();
    return true;
  };

  const renderBtn = (status: number, bpmsUrl: string) => {
    const publishBtn = (
      <Button
        key="publish"
        type="primary"
        htmlType="submit"
        disabled={publishBtnDisabled}
        style={{ width: '80px', height: '50px', fontSize: '18px' }}
      >
        发布
      </Button>
    );
    const publishBpmsLink = (
      <Button
        style={{ marginRight: '5px' }}
        key="publishBpms"
        onClick={() => {
          window.open(`${bpmsUrl}`, '_blank');
        }}
      >
        发布的审批单
      </Button>
    );
    const pauseBtn = (
      <Button
        key="pause"
        size="large"
        onClick={() => pause()}
        style={{ width: '80px', height: '50px', fontSize: '18px' }}
      >
        暂停
      </Button>
    );
    const pauseBpmsLink = (
      <Button
        key="pauseBpms"
        onClick={() => {
          window.open(`${bpmsUrl}`, '_blank');
        }}
      >
        暂停的审批单
      </Button>
    );
    const recallBtn = (
      <Button key="recall" onClick={() => recall()}>
        撤销
      </Button>
    );
    switch (status) {
      case 0:
        return [publishBtn];
      case 1:
        return [publishBpmsLink, recallBtn];
      case 2:
        return [pauseBtn];
      case 3:
        return [pauseBpmsLink, recallBtn];
      case 4:
        return [publishBpmsLink, recallBtn];
      default:
        return [];
    }
  };

  const readOnly = (status: number) => {
    switch (status) {
      case 0:
        return false;
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  return (
    <>
      {
        branchDetail.branchType <= 1 && (
          <Card style={{ border: '1px solid #ccc', padding: '0px 20px 20px', marginTop: '20px' }}>
            <Form onFinish={handlePublish} form={form}>
              <Tabs
                defaultActiveKey="1"
                tabBarExtraContent={{
                  right: [renderStatus(PublishDetail?.publishState as number)],
                }}
              >
                <TabPane tab="发布条件" key="1">
                  <div style={{ textAlign: 'right' }}>
                    <FormItem noStyle name="runType" initialValue={branchDetail.branchType === 0 && 0}>
                      <Radio.Group
                        disabled={readOnly(PublishDetail?.publishState as number)}
                        onChange={handlePublistBtnDisabledStatus}
                      >
                        <Radio value={0}>实际生效</Radio>
                        <Radio value={1}>仅陪跑</Radio>
                      </Radio.Group>
                    </FormItem>
                  </div>
                  <div style={{ padding: '20px 50px' }}>
                    A/B实验：
                    <FormItem noStyle name="conditionValue">
                      <Select
                        style={{ width: 300 }}
                        disabled={readOnly(PublishDetail?.publishState as number)}
                        onChange={handlePublistBtnDisabledStatus}
                      >
                        {options.map((option) => {
                          return (
                            <Option key={option.name} value={option.name}>
                              {option.displayName}
                            </Option>
                          );
                        })}
                      </Select>
                    </FormItem>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {renderBtn(PublishDetail?.publishState as number, bpms?.flowUrl as string)}
                  </div>
                </TabPane>
              </Tabs>
            </Form>
          </Card>
        )
      }
      {
        branchDetail.branchType !== 0 ? (
          <Step1
            branchDetail={branchDetail}
            branchId={branchId}
            onRefreshDetail={onRefreshDetail}
          />
        ) : <RuleDetail
          branchDetail={branchDetail}
          ruleObject={ruleObject}
          branchDiff={branchDiff}
          onGroupsFormChange={onGroupsFormChange}
        />
      }
    </>
  );
}

export default Step2;
