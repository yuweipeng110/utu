import { useEffect, useState } from 'react';
import { history, Link } from 'umi';
import { Modal, Result, Button } from 'antd';
import _ from 'lodash';

type AppDeployResultProps = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  apiResult: any;
};
const AppDeployResult: React.FC<AppDeployResultProps> = (props) => {
  const { visible, onVisibleChange, apiResult } = props;

  const [timerID, setTimerID] = useState(null);
  const [counter, setCounter] = useState(2);
  const [appDeployUrl, setAppDeployUrl] = useState<string>('');
  const [appDeployName, setAppDeployName] = useState<string>('');
  const [code, setCode] = useState<number>(0);

  useEffect(() => {
    if (visible) {
      if (!_.isEmpty(apiResult.data)) {
        const orderId = apiResult.data.id;
        const type = apiResult.data.type;
        let url;
        if (type === 0) {
          url = `/app/deploy/update?id=${orderId}`;
        } else {
          url = `/app/deploy/rollback?id=${orderId}`;
        }
        setAppDeployUrl(url);
        setAppDeployName(apiResult.data.name);
      }
      setCode(apiResult.code);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && code === 1) {
      if (counter > 0) {
        let timer: any = setTimeout(() => {
          setCounter(counter - 1);
        }, 1000);
        setTimerID(timer);
      } else {
        history.push(appDeployUrl);
      }

      return () => {
        setTimerID(null);
      };
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
        subTitle={
          apiResult.code === 1 ? (
            <>{`${counter}秒后将自动跳转至发布单页面`}</>
          ) : (
            <>
              <p>{apiResult.message}</p>
              {appDeployName && (
                <p>
                  发布单名称：
                  <a key="publish" type="primary" onClick={() => onVisibleChange(false)}>
                    <Link to={appDeployUrl}>{appDeployName}</Link>
                  </a>
                </p>
              )}
            </>
          )
        }
        extra={[
          apiResult.code === 1 && (
            <Button key="publish" type="primary" onClick={() => onVisibleChange(false)}>
              <Link to={appDeployUrl}>跳转至发布单页</Link>
            </Button>
          ),
        ]}
        style={{ padding: '0px'}}
      />
    </Modal>
  );
};

export default AppDeployResult;
