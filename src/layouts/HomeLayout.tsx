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
import React, { useMemo, useRef, useState } from 'react';
import type { Dispatch } from 'umi';
import { Link, useIntl, connect } from 'umi';
import { Result, Button, Modal, Radio } from 'antd';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import type { ConnectState } from '@/models/connect';
import { getMatchMenu } from '@umijs/route-utils';
import type { CurrentUser } from '@/models/user';
import logo from '../assets/icon-logo.png';
const { confirm } = Modal;
import './HomeLayout.less';
const Surroundings = sessionStorage.getItem('Surroundings')
  ? sessionStorage.getItem('Surroundings')
  : '日常';
interface CollectionCreateFormProps {
  visible: boolean;
  onCancel: () => void;
}

const ModelForm: React.FC<CollectionCreateFormProps> = ({ visible, onCancel }) => {
  function showConfirm(title: string, url: string) {
    (function () {
      if (url === 'utu.amap.test') {
        sessionStorage.setItem('Surroundings', '日常');
        return;
      }
      if (url === 'pre-utu.amap.com') {
        sessionStorage.setItem('Surroundings', '预发');
        return;
      }
      sessionStorage.setItem('Surroundings', '生产');
      return;
    })();
    confirm({
      title,
      icon: false,
      onOk() {
        window.location.href = `https://${url}`;
      },
      onCancel() {},
    });
  }
  return (
    <div className="riado_center">
      <Modal
        visible={visible}
        title="改变环境"
        onCancel={onCancel}
        width={'600px'}
        footer={null}
        onOk={() => {
          onCancel();
        }}
        className="radio_center"
      >
        <Radio.Group
          value={Surroundings}
          size="large"
          onChange={(e) => {
            if (e.target.value === '日常') {
              showConfirm('是否切换日常环境', 'utu.amap.test');
              return;
            }
            if (e.target.value === '预发') {
              showConfirm('是否切换预发环境', 'pre-utu.amap.com');
              return;
            }
            showConfirm('是否切换生产环境', 'utu.amap.com');
            return;
          }}
        >
          <Radio.Button value="日常">日常环境</Radio.Button>
          <Radio.Button value="预发">预发环境</Radio.Button>
          <Radio.Button value="生产">生产环境</Radio.Button>
        </Radio.Group>
        <div
          style={{
            margin: 24,
          }}
        ></div>
      </Modal>
    </div>
  );
};

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
export type HomeLayoutProps = {
  breadcrumbNameMap: Record<string, MenuDataItem>;
  route: ProLayoutProps['route'] & {
    authority: string[];
  };
  settings: Settings;
  currentUser?: CurrentUser;
  dispatch: Dispatch;
} & ProLayoutProps;
export type HomeLayoutContext = { [K in 'location']: HomeLayoutProps[K] } & {
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

const HomeLayout: React.FC<HomeLayoutProps> = (props) => {
  const { location, dispatch, children, settings, currentUser } = props;
  const [visible, setVisible] = useState(false);
  const menuDataRef = useRef<MenuDataItem[]>([]);
  /**
   * init variables
   */
  function showConfirm(title: string, url: string) {
    (function () {
      if (url === 'utu.amap.test') {
        sessionStorage.setItem('Surroundings', '日常');
        return;
      }
      if (url === 'pre-utu.amap.com') {
        sessionStorage.setItem('Surroundings', '预发');
        return;
      }

      sessionStorage.setItem('Surroundings', '生产');
      return;
    })();
    confirm({
      title,
      icon: false,
      onOk() {
        window.location.href = `https://${url}`;
      },
      onCancel() {},
    });
  }

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

  const environmentTitle = () => {
    let title = '';
    switch (document.domain) {
      case 'utu.amap.test':
        title = '日常';
        break;
      case 'pre-utu.amap.com':
        title = '预发';
        break;
      case 'utu.amap.com':
        title = '生产';
        break;
      default:
        title = '本地';
        break;
    }
    return title;
  };

  return (
    <ProLayout
      logo={logo}
      formatMessage={formatMessage}
      {...props}
      {...settings}
      // menuHeaderRender={() => {
      //   return (
      //     <div style={{ color: 'white', display: 'flex' }}>
      //       <div>
      //         <img src={logo} alt="" />
      //       </div>
      //       <div
      //         style={{
      //           marginLeft: '10px',
      //           paddingTop: '2px',
      //           fontSize: '18px',
      //           fontWeight: 'bold',
      //         }}
      //       >
      //         乌图平台
      //       </div>
      //       {/* <div style={{ position: 'absolute', right: '10px', top: '12px' }}>
      //         <div
      //           style={{ fontSize: '14px', textAlign: 'center', fontWeight: 'bold' }}
      //           onClick={() => {
      //             setVisible(true);
      //           }}
      //         >
      //           {environmentTitle()}
      //         </div>
      //         <div
      //           style={{ fontSize: '12px', marginTop: '5px', marginLeft: '3px' }}
      //           onClick={() => {
      //             setVisible(true);
      //           }}
      //         >
      //           切换环境
      //         </div>
      //       </div> */}
      //     </div>
      //   );
      // }}
      onCollapse={handleMenuCollapse}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl || !menuItemProps.path) {
          return defaultDom;
        }
        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
      }}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: formatMessage({ id: 'menu.home' }),
        },
        ...routers,
      ]}
      itemRender={(route, params, routes, paths) => {
        const first = routes.indexOf(route) === 0;
        return first ? (
          <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
        ) : (
          <span>{route.breadcrumbName}</span>
        );
      }}
      footerRender={() => defaultFooterDom}
      menuDataRender={menuDataRender}
      rightContentRender={() => <RightContent />}
      postMenuData={(menuData) => {
        menuDataRef.current = menuData || [];
        return menuData || [];
      }}
      waterMarkProps={{
        content: currentUser?.userInfo,
      }}
    >
      <Authorized authority={authorized!.authority} noMatch={noMatch}>
        {children}
        <div className="radio_center">
          <ModelForm
            onCancel={() => {
              setVisible(false);
            }}
            visible={visible}
          />
        </div>
      </Authorized>
      <Modal
        visible={visible}
        title="改变环境"
        onCancel={() => {
          setVisible(false);
        }}
        width={'600px'}
        footer={null}
        onOk={() => {
          setVisible(false);
        }}
        className="radio_center"
      >
        <Radio.Group
          value={environmentTitle()}
          size="large"
          onChange={(e) => {
            if (e.target.value === '日常') {
              showConfirm('是否切换日常环境', 'utu.amap.test');
              return;
            }
            if (e.target.value === '预发') {
              showConfirm('是否切换预发环境', 'pre-utu.amap.com');
              return;
            }
            showConfirm('是否切换生产环境', 'utu.amap.com');
            return;
          }}
        >
          <Radio.Button value="日常">日常环境</Radio.Button>
          <Radio.Button value="预发">预发环境</Radio.Button>
          {/* <Radio.Button value="生产">生产环境</Radio.Button> */}
        </Radio.Group>
        <div
          style={{
            margin: 24,
          }}
        ></div>
      </Modal>
    </ProLayout>
  );
};

export default connect(({ global, settings, user }: ConnectState) => ({
  collapsed: global.collapsed,
  settings,
  currentUser: user.currentUser,
}))(HomeLayout);
