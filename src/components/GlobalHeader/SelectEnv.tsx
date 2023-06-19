import React, { useState } from 'react';
import { Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const ENV_MAP = {
  daily: '日常环境',
  pre: '预发环境',
  prod: '线上环境',
};

const SelectEnv: React.FC = () => {
  const [env] = useState(localStorage.getItem('rule_env') || 'daily');
  const langMenu = (
    <Menu
      selectedKeys={[env]}
      onClick={(data) => {
        const key = `${data.key}`;
        localStorage.setItem('rule_env', key);
        window.location.reload();
      }}
    >
      {Object.keys(ENV_MAP).map((key) => {
        return <Menu.Item key={key}>{ENV_MAP[key]}</Menu.Item>;
      })}
    </Menu>
  );
  return (
    <Dropdown overlay={langMenu} placement="bottomRight">
      <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
        {ENV_MAP[env]} &nbsp;
        <DownOutlined />
      </a>
    </Dropdown>
  );
};

export default SelectEnv;
