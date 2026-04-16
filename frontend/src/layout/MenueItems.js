import React, { useMemo, useEffect, useState } from 'react';
import { Menu } from 'antd';
import { usePathname } from 'next/navigation';
import FeatherIcon from 'feather-icons-react';
import propTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getBasePath } from '../utility/getBasePath';
import { NextNavLink } from '../components/utilities/NextLink';
import { hasPageAccess } from '../utility/accessControl';

const { SubMenu } = Menu;

function MenuItems({ darkMode, toggleCollapsed, topMenu, events }) {
  const nextPathname = usePathname();
  const basePath = getBasePath();
  const authState = useSelector((state) => state.auth.login);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const authUser =
    isClient && typeof authState === 'object' && authState ? authState : null;
  const userRole = authUser?.role || null;
  const baseMenuPath = userRole === 'health' ? '/cuidados' : '/admin';

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1920
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Normalização do PathName
  let pathName = '';
  if (nextPathname) {
    let nextPath = nextPathname;
    if (typeof window !== 'undefined' && basePath && nextPathname.startsWith(basePath)) {
      nextPath = nextPathname.replace(basePath, '');
    }
    pathName = nextPath || '';
  }

  // LÓGICA DE SELEÇÃO DINÂMICA
  const getSelectedKey = () => {
    if (pathName.includes('users/dataTable') || pathName.includes('users/add-user') || pathName.includes('dataTable') || pathName.includes('/collaborators')) return ['users'];
    if (pathName.includes('resource-sources')) return ['resource-sources'];
    if (pathName.includes('wallets')) return ['wallets'];
    if (pathName.includes('incomes')) return ['incomes'];
    if (pathName.includes('queue')) return ['queue'];
    if (pathName.includes('my-patients')) return ['my-patients'];
    if (pathName.includes('my-profile')) return ['my-profile'];
    if (pathName.includes('children')) return ['children'];
    if (pathName.includes('families')) return ['families'];
    if (pathName.includes('project')) return ['projects'];
    if (pathName.includes('reports')) return ['reports'];
    if (pathName === baseMenuPath || pathName === `${baseMenuPath}/`) return ['playground'];
    return [];
  };

  // LÓGICA DE PASTA ABERTA (SUBMENU)
  const initialOpenKey = useMemo(() => {
    if (pathName.includes('users') || pathName.includes('reports')) {
      return 'admin';
    }
    return 'dashboard';
  }, [pathName]);

  const [openKeys, setOpenKeys] = useState(!topMenu ? [initialOpenKey] : []);

  // Sincroniza abertura de pastas quando a rota muda
  useEffect(() => {
    if (!topMenu) {
      setOpenKeys([initialOpenKey]);
    }
  }, [pathName, initialOpenKey, topMenu]);

  const onOpenChange = (keys) => {
    setOpenKeys(keys.length ? [keys[keys.length - 1]] : []);
  };

  const onClick = (item) => {
    if (item.keyPath.length === 1) setOpenKeys([]);
  };

  const selectedKeysValue = useMemo(() => {
    if (topMenu) return [];
    return getSelectedKey();
  }, [pathName, topMenu]);

  return (
    <Menu
      onOpenChange={onOpenChange}
      onClick={onClick}
      mode={!topMenu || windowWidth <= 991 ? 'inline' : 'horizontal'}
      theme={darkMode ? 'dark' : 'light'}
      selectedKeys={selectedKeysValue}
      defaultOpenKeys={!topMenu ? [initialOpenKey] : []}
      overflowedIndicator={<FeatherIcon icon="more-vertical" />}
      openKeys={openKeys}
    >
      <Menu.Item key="playground" icon={!topMenu && <FeatherIcon icon="home" />}>
        <NextNavLink onClick={toggleCollapsed} to={`${baseMenuPath}`} activeClassName="">
          Início
        </NextNavLink>
      </Menu.Item>

      {/* Fila de Espera - visível para Admin e Operacional */}
      {(userRole === 'admin' || userRole === 'operational' || hasPageAccess(authUser, 'queue_admin')) && hasPageAccess(authUser, 'queue_admin') && (
        <Menu.Item key="queue" icon={!topMenu && <FeatherIcon icon="list" />}>
          <NextNavLink onClick={toggleCollapsed} to={`${baseMenuPath}/queue`} activeClassName="">
            Fila de Espera
          </NextNavLink>
        </Menu.Item>
      )}

      {/* Visível apenas para Saúde */}
      {hasPageAccess(authUser, 'my_patients') && (
        <>
          <Menu.Item key="my-patients" icon={!topMenu && <FeatherIcon icon="users" />}>
            <NextNavLink onClick={toggleCollapsed} to={`${baseMenuPath}/my-patients`} activeClassName="">
              Meus Pacientes
            </NextNavLink>
          </Menu.Item>
          {hasPageAccess(authUser, 'my_profile') && (
          <Menu.Item key="my-profile" icon={!topMenu && <FeatherIcon icon="user" />}>
            <NextNavLink onClick={toggleCollapsed} to={`${baseMenuPath}/my-profile`} activeClassName="">
              Meu Perfil / Produção
            </NextNavLink>
          </Menu.Item>
          )}
        </>
      )}

      {/* Visível para Admin e Operacional 
          A rota de projetos usa sempre /admin para garantir acesso unificado. */}
      {(hasPageAccess(authUser, 'families') ||
        hasPageAccess(authUser, 'children_admin') ||
        hasPageAccess(authUser, 'projects') ||
        hasPageAccess(authUser, 'warehouse')) && (
        <>
          {hasPageAccess(authUser, 'families') && (
          <Menu.Item key="families" icon={!topMenu && <FeatherIcon icon="home" />}>
            <NextNavLink onClick={toggleCollapsed} to={`${baseMenuPath}/families`} activeClassName="">
              Cadastro de Famílias
            </NextNavLink>
          </Menu.Item>
          )}
          {hasPageAccess(authUser, 'children_admin') && (
          <Menu.Item key="children" icon={!topMenu && <FeatherIcon icon="users" />}>
            <NextNavLink onClick={toggleCollapsed} to={`${baseMenuPath}/children`} activeClassName="">
              Crianças / Atendidos
            </NextNavLink>
          </Menu.Item>
          )}
          {hasPageAccess(authUser, 'projects') && (
          <Menu.Item key="projects" icon={!topMenu && <FeatherIcon icon="folder" />}>
            <NextNavLink onClick={toggleCollapsed} to={`${baseMenuPath}/projects`} activeClassName="">
              Projetos
            </NextNavLink>
          </Menu.Item>
          )}
          {hasPageAccess(authUser, 'warehouse') && (
          <Menu.Item key="warehouse" icon={!topMenu && <FeatherIcon icon="package" />}>
            <NextNavLink onClick={toggleCollapsed} to={`${baseMenuPath}/warehouse`} activeClassName="">
              Almoxarifado
            </NextNavLink>
          </Menu.Item>
          )}
        </>
      )}

      {/* Visível apenas para Admin */}
      {(hasPageAccess(authUser, 'collaborators') ||
        hasPageAccess(authUser, 'reports') ||
        hasPageAccess(authUser, 'resource_sources') ||
        hasPageAccess(authUser, 'wallets') ||
        hasPageAccess(authUser, 'incomes') ||
        hasPageAccess(authUser, 'notifications')) && (
        <>
          {hasPageAccess(authUser, 'collaborators') && (
          <Menu.Item key="users" icon={!topMenu && <FeatherIcon icon="users" />}>
            <NextNavLink onClick={toggleCollapsed} to="/admin/collaborators" activeClassName="">
              Colaboradores
            </NextNavLink>
          </Menu.Item>
          )}
          {hasPageAccess(authUser, 'reports') && (
          <Menu.Item key="reports" icon={!topMenu && <FeatherIcon icon="bar-chart-2" />}>
            <NextNavLink onClick={toggleCollapsed} to={`${baseMenuPath}/reports`} activeClassName="">
              Relatórios
            </NextNavLink>
          </Menu.Item>
          )}
          {hasPageAccess(authUser, 'resource_sources') && (
          <Menu.Item key="resource-sources" icon={!topMenu && <FeatherIcon icon="layers" />}>
            <NextNavLink onClick={toggleCollapsed} to={`${baseMenuPath}/resource-sources`} activeClassName="">
              Fontes de Recursos
            </NextNavLink>
          </Menu.Item>
          )}
          {hasPageAccess(authUser, 'wallets') && (
          <Menu.Item key="wallets" icon={!topMenu && <FeatherIcon icon="briefcase" />}>
            <NextNavLink onClick={toggleCollapsed} to={`${baseMenuPath}/wallets`} activeClassName="">
              Carteiras / Fundos
            </NextNavLink>
          </Menu.Item>
          )}
          {hasPageAccess(authUser, 'incomes') && (
          <Menu.Item key="incomes" icon={!topMenu && <FeatherIcon icon="trending-up" />}>
            <NextNavLink onClick={toggleCollapsed} to={`${baseMenuPath}/incomes`} activeClassName="">
              Entradas de Receita
            </NextNavLink>
          </Menu.Item>
          )}
          {hasPageAccess(authUser, 'notifications') && (
          <Menu.Item key="notifications" icon={!topMenu && <FeatherIcon icon="bell" />}>
            <NextNavLink onClick={toggleCollapsed} to={`${baseMenuPath}/notifications`} activeClassName="">
              Notificações
            </NextNavLink>
          </Menu.Item>
          )}
        </>
      )}
    </Menu>
  );
}

MenuItems.propTypes = {
  darkMode: propTypes.bool,
  topMenu: propTypes.bool,
  toggleCollapsed: propTypes.func,
  events: propTypes.object,
};

export default MenuItems;
