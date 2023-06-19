import type { Settings as ProSettings } from '@ant-design/pro-layout';
import React, { useEffect, useState } from 'react';
import type { ConnectProps } from 'umi';
import { connect, history /* SelectLang */ } from 'umi';
import type { ConnectState } from '@/models/connect';
import Avatar from './AvatarDropdown';
import styles from './index.less';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import GlobalSelectApp from './GlobalSelectApp';

export type GlobalHeaderRightProps = {
  theme?: ProSettings['navTheme'] | 'realDark';
} & Partial<ConnectProps> &
  Partial<ProSettings>;

const GlobalHeaderRight: React.SFC<GlobalHeaderRightProps> = (props) => {
  const { theme, layout } = props;
  let className = styles.right;
  const [pathnameHead, setPathnameHead] = useState('');

  if (theme === 'dark' && layout === 'top') {
    className = `${styles.right}  ${styles.dark}`;
  }

  useEffect(() => {
    const str = history.location.pathname;
    const strAry = str.split('/');
    if (strAry.length > 1) {
      setPathnameHead(strAry[1]);
    }
  }, []);

  return (
    <>
      <div className={className}>
        {pathnameHead !== 'scene' && <GlobalSelectApp />}
        <Tooltip title="使用文档">
          <a
            style={{
              color: 'inherit',
            }}
            target="_blank"
            href="https://yuque.antfin-inc.com/feisheng.lijun/nig7gt"
            rel="noopener noreferrer"
            className={styles.action}
          >
            <QuestionCircleOutlined />
          </a>
        </Tooltip>
        <Avatar />
      </div>
    </>
  );
};

export default connect(({ settings }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
