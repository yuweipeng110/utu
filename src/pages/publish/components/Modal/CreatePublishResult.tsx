import React, { useEffect, useState } from 'react';
import { Button, Modal, Result } from 'antd';
import { Link, history } from 'umi';
import { getPageQuery } from '@/utils/utils';
import _ from 'lodash';
import '../../index.less';

type CreatePublishResultProps = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  apiResult: any;
};

const CreatePublishResult: React.FC<CreatePublishResultProps> = (props) => {
  const { visible, onVisibleChange, apiResult } = props;
  const queryParams = getPageQuery();
  const appId = queryParams.app_id;
  const sceneId = queryParams.scene_id;

  const [timerID, setTimerID] = useState(null);
  const [counter, setCounter] = useState(2);
  const [publishUrl, setPublishUrl] = useState<string>('');
  const [createUser, setCreateUser] = useState<string>('');
  const [publishName, setPublishName] = useState<string>('');
  const [code, setCode] = useState<number>(0);

  useEffect(() => {
    if (visible) {
      if (!_.isEmpty(apiResult.data)) {
        const publishOrderId = apiResult.data.publishOrderId;
        const source = apiResult.data.source;
        let url;
        if (source === 1 || source === 3) {
          url = `/scene/publish/detail?app_id=${appId}&scene_id=${sceneId}&publish_order_id=${publishOrderId}&source=${source}`;
        } else {
          const experimentId = apiResult.data.id;
          url = `/scene/publish/detail?app_id=${appId}&scene_id=${sceneId}&publish_order_id=${publishOrderId}&source=${source}&experiment_id=${experimentId}`;
        }
        setPublishName(apiResult.data.name);
        setCreateUser(apiResult.data.createUser);
        setPublishUrl(url);
      }
      setCode(apiResult.code);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && code === 1) {
      if (counter > 0) {
        let timer: any = setTimeout(() => {
          setCounter(counter - 1)
        }, 1000);
        setTimerID(timer);
      } else {
        history.push(publishUrl);
      }

      return () => {
        setTimerID(null);
      }
    }
  }, [code, visible, counter]);

  return (
    <Modal
      visible={visible}
      centered={true}
      onCancel={() => {
        setTimerID(null);
        onVisibleChange(false);
      }}
      cancelText="关闭"
      okButtonProps={{
        style: {
          display: 'none',
        },
      }}
    >
      <Result
        status={apiResult.code === 1 ? 'success' : 'warning'}
        title={apiResult.code === 1 ? '提交成功' : '提交失败'}
        subTitle={apiResult.code === 1 ? (
          <>{`${counter}秒后将自动跳转至发布单页面`}</>
        ) : (
          <>
            <p>{apiResult.message}</p>
            {publishName && <p>发布单名称：<Link to={publishUrl}>{publishName}</Link></p>}
            {/* {createUser && <p>创建人：{createUser}</p>} */}
          </>
        )}
        extra={[
          apiResult.code === 1 && (
            <Button key="publish" type="primary" onClick={() => onVisibleChange(false)}>
              <Link to={publishUrl}>
                跳转至发布单页
              </Link>
            </Button>
          )
        ]}
      />
    </Modal>
  );
};

export default CreatePublishResult;
