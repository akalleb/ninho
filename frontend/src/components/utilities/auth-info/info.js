import React, { useState, useEffect } from 'react';
import { Avatar } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import FeatherIcon from 'feather-icons-react';
import { InfoWraper, UserDropDwon } from './auth-info-style';
import { Popover } from '../../popup/popup';
import { logOut, login } from '../../../redux/authentication/actionCreator';
import Heading from '../../heading/heading';
import NotificationBox from './notification';

function AuthInfo() {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.auth.login);

  const SignOut = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Clear Redux state, localStorage, and cookies (client-side logout)
      await dispatch(logOut());
      
      // Navigate to auth page using Next.js router (no page reload)
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      // Still try to navigate to auth page
      router.push('/auth');
    }
  };

  const authUser = typeof authState === 'object' && authState ? authState : null;
  const [mountedUser, setMountedUser] = useState(false);

  useEffect(() => {
    setMountedUser(true);
  }, []);

  useEffect(() => {
    if (!authUser && typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && typeof parsedUser === 'object') {
            dispatch(login(parsedUser));
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }, [authUser, dispatch]);

  const displayName = mountedUser && authUser?.name ? authUser.name : 'Colaborador';
  let displayRole = 'Colaborador';
  if (mountedUser && authUser?.role === 'admin') displayRole = 'Gestor';
  else if (mountedUser && authUser?.role === 'operational') displayRole = 'Operacional';
  else if (mountedUser && authUser?.role === 'health') displayRole = 'Profissional de Saúde';

  const baseSettingsPath =
    authUser && authUser.role === 'health' ? '/cuidados/settings' : '/admin/settings';

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const avatarSrc =
    mountedUser && authUser?.avatar_url
      ? `${apiBaseUrl}${authUser.avatar_url}`
      : 'https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png';

  const goToProfile = () => {
    router.push(`${baseSettingsPath}/profile`);
  };

  const goToAccount = () => {
    router.push(`${baseSettingsPath}/account`);
  };

  const goToPassword = () => {
    router.push(`${baseSettingsPath}/password`);
  };

  const userContent = (
    <UserDropDwon>
      <div className="user-dropdwon">
        <figure className="user-dropdwon__info">
          <img src={avatarSrc} alt="" />
          <figcaption>
            <Heading as="h5">{displayName}</Heading>
            <p>{displayRole}</p>
          </figcaption>
        </figure>
        <ul className="user-dropdwon__links">
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToProfile();
              }}
            >
              <FeatherIcon icon="user" /> Perfil
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToAccount();
              }}
            >
              <FeatherIcon icon="settings" /> Conta
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToPassword();
              }}
            >
              <FeatherIcon icon="key" /> Senha
            </a>
          </li>
        </ul>
        <button 
          type="button"
          className="user-dropdwon__bottomAction" 
          onClick={SignOut}
        >
          <FeatherIcon icon="log-out" /> Sair
        </button>
      </div>
    </UserDropDwon>
  );

  if (!mountedUser || !authUser) {
    return null;
  }

  return (
    <InfoWraper>
      <NotificationBox />
      <div className="nav-author">
        <Popover placement="bottomRight" content={userContent} action="click">
          <span className="head-example" style={{ cursor: 'pointer', display: 'inline-block' }}>
            <Avatar src={avatarSrc} size={40} />
          </span>
        </Popover>
      </div>
    </InfoWraper>
  );
}

export default AuthInfo;
