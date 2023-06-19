/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import type {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  Settings,
} from '@ant-design/pro-layout';
import ProLayout, { DefaultFooter } from '@ant-design/pro-layout';
import React, { useEffect, useMemo, useRef } from 'react';
import type { Dispatch } from 'umi';
import { Link, useIntl, connect, history } from 'umi';
import { Result, Button, Tooltip } from 'antd';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import type { ConnectState } from '@/models/connect';
import { getMatchMenu } from '@umijs/route-utils';
import { getPageQuery } from '@/utils/utils';
import SelectApp from '@/components/GlobalHeader/SelectApp';
import { HomeOutlined, RightOutlined } from '@ant-design/icons';
import _ from 'lodash';

const noMatch = (
  <Result
    status={403}
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/user/login">Go Login</Link>
      </Button>
    }
  />
);
export type SceneLayoutProps = {
  breadcrumbNameMap: Record<string, MenuDataItem>;
  route: ProLayoutProps['route'] & {
    authority: string[];
  };
  settings: Settings;
  currentScene: any;
  dispatch: Dispatch;
} & ProLayoutProps;
export type SceneLayoutContext = { [K in 'location']: SceneLayoutProps[K] } & {
  breadcrumbNameMap: Record<string, MenuDataItem>;
};
/**
 * use Authorized check all menu item
 */
const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>
  menuList.map((item) => {
    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children) : undefined,
    };
    return Authorized.check(item.authority, localItem, null) as MenuDataItem;
  });

const defaultFooterDom = (
  <DefaultFooter
    copyright={`${new Date().getFullYear()} 高德技术服务平台部`}
    links={[
      {
        key: '',
        title: 'Ant Design Pro',
        href: 'https://pro.ant.design',
        blankTarget: true,
      },
    ]}
  />
);

const SceneLayout: React.FC<SceneLayoutProps> = (props) => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
    currentScene,
  } = props;

  const menuDataRef = useRef<MenuDataItem[]>([]);

  useEffect(() => {
    const params = getPageQuery();

    // URL中缺少场景ID
    if (!params.scene_id) {
      history.push('/404');
    }

    if (parseInt(params.scene_id as string, 10) !== currentScene?.sceneId) {
      dispatch({
        type: 'app/fetchAndSelectScene',
        payload: { sceneId: parseInt(params.scene_id as string, 10) },
      });
    }

    dispatch({
      type: 'app/fetchList',
      payload: { appId: parseInt(params.app_id as string, 10), pageSize: 100 },
    });
  }, [location]);

  const handleMenuCollapse = (payload: boolean): void => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  };

  // get children authority
  const authorized = useMemo(
    () =>
      getMatchMenu(location.pathname || '/', menuDataRef.current).pop() || {
        authority: undefined,
      },
    [location.pathname],
  );

  const { formatMessage } = useIntl();

  return (
    <ProLayout
      logo={
        <>
          <Tooltip title={'返回首页'}>
            <HomeOutlined
              style={{ fontSize: '20px', color: '#FFFFFF' }}
              onClick={() => history.push('/app/scene')}
            />
          </Tooltip>
          <RightOutlined style={{ marginLeft: '10px', fontSize: '12px', color: '#FFFFFF' }} />
          <a onClick={() => { history.push('/app/scene') }} style={{ marginLeft: '10px', fontSize: '16px', color: '#FFFFFF' }}>{currentScene?.appCode}</a>
          <RightOutlined style={{ marginLeft: '10px', fontSize: '12px', color: '#FFFFFF' }} />
          { !_.isEmpty(currentScene) &&
            <SelectApp style={{ marginLeft: '5px', fontSize: '16px', color: '#FFFFFF' }}></SelectApp>
          }
        </>
      }
      formatMessage={formatMessage}
      {...props}
      {...settings}
      title={''}
      onCollapse={handleMenuCollapse}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl || !menuItemProps.path) {
          return defaultDom;
        }
        return (
          <Link
            to={`${menuItemProps.path}?app_id=${currentScene?.appId}&scene_id=${currentScene?.sceneId}`}
          >
            {defaultDom}
          </Link>
        );
      }}
      breadcrumbRender={(routers = []) => [
        {
          breadcrumbName: currentScene?.appCode,
        },
        {
          breadcrumbName: currentScene?.sceneName,
        },
        ...routers,
      ]}
      itemRender={(route, params, routes, paths) => {
        const indexRoute = routes.indexOf(route);
        let routeContent;
        switch (indexRoute) {
          case 0:
            routeContent = <Link to={`/system/app`}>{route.breadcrumbName}</Link>;
            break;
          case 1:
            routeContent = <Link to={`/app/scene`}>{route.breadcrumbName}</Link>;
            break;
          default:
            routeContent = <span>{route.breadcrumbName}</span>;
            break;
        }
        return routeContent;
        // const first = routes.indexOf(route) === 0;
        // return first ? (
        //   <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
        // ) : (
        //   <span>{route.breadcrumbName}</span>
        // );
      }}
      footerRender={() => defaultFooterDom}
      menuDataRender={menuDataRender}
      rightContentRender={() => <RightContent />}
      postMenuData={(menuData) => {
        menuDataRef.current = menuData || [];
        return menuData || [];
      }}
      layout={'top'}
    >
      <Authorized authority={authorized!.authority} noMatch={noMatch}>
        {children}
      </Authorized>
    </ProLayout>
  );
};

export default connect(({ app, global, settings }: ConnectState) => ({
  collapsed: global.collapsed,
  settings,
  currentScene: app.currentScene,
}))(SceneLayout);
