import React from 'react';
import { Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { AppScene, ConnectProps} from 'umi';
import { connect, history } from 'umi';
import type { ConnectState } from '@/models/connect';

export type SelectAppProps = {
  sceneList?: [];
  currentScene?: AppScene;
  style?: {};
} & Partial<ConnectProps>;

const SelectApp: React.FC<SelectAppProps> = (props) => {
  const { dispatch, sceneList, currentScene, style } = props;

  const getScene = (key: number) => {
    for (let i = 0; i < sceneList?.length; i += 1) {
      if (sceneList[i].sceneId === key) {
        return sceneList[i];
      }
    }
    return null;
  };

  const sceneMenu = (
    currentScene &&
    <Menu
      selectedKeys={[currentScene.sceneId]}
      onClick={(data) => {
        const key = `${data.key}`;
        const selectScene = getScene(parseInt(key, 10));
        if (dispatch) {
          history.push(`/scene/experiment?app_id=${selectScene.appId}&scene_id=${selectScene.sceneId}`);
        }
      }}
      style={{ overflow: 'auto', maxHeight: 300}}
    >
      {Object.keys(sceneList).map((key) => {
        return <Menu.Item key={sceneList[key].sceneId}>{sceneList[key].sceneName}</Menu.Item>;
      })}
    </Menu>
  );

  return (
    <>
      <Dropdown overlay={sceneMenu} placement="bottomRight">
        <a style={style} className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
          {currentScene?.sceneName} &nbsp;
          <DownOutlined />
        </a>
      </Dropdown>
    </>
  );
};

export default connect(({ app }: ConnectState) => ({
  sceneList: app.sceneList,
  currentScene: app.currentScene,
}))(SelectApp);
