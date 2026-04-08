import React, { useEffect, useState } from 'react';
import { Upload, App } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { NextNavLink } from '../../../../components/utilities/NextLink';

import { ProfileAuthorBox } from './style';
import Heading from '../../../../components/heading/heading';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { getImageUrl } from '../../../../utility/getImageUrl';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../../../config/api/axios';
import { login } from '../../../../redux/authentication/actionCreator';

function AuthorBox() {
  const authState = useSelector((state) => state.auth.login);
  const dispatch = useDispatch();
  const { notification } = App.useApp();
  const authUser = typeof authState === 'object' && authState ? authState : null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayName = mounted && authUser?.name ? authUser.name : 'Colaborador';
  let displayRole = 'Colaborador';
  if (mounted && authUser?.role === 'admin') displayRole = 'Gestor';
  else if (mounted && authUser?.role === 'operational') displayRole = 'Operacional';
  else if (mounted && authUser?.role === 'health') displayRole = 'Profissional de Saúde';

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const avatarSrc =
    mounted && authUser?.avatar_url
      ? `${apiBaseUrl}${authUser.avatar_url}`
      : getImageUrl('static/img/users/1.png');

  const baseSettingsPath =
    mounted && authUser && authUser.role === 'health' ? '/cuidados/settings' : '/admin/settings';

  const handleAvatarUpload = async (options) => {
    const { file, onError, onSuccess } = options;

    if (!authUser?.professional_id) {
      notification.error({
        message: 'Usuário não identificado',
        description: 'Faça login novamente para alterar a foto de perfil.',
      });
      onError(new Error('Usuário não identificado'));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post(
        `/professionals/${authUser.professional_id}/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      // Atualiza usuário logado com novo avatar
      const updatedUser = {
        ...authUser,
        avatar_url: data.avatar_url,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status || 'active',
      };
      await dispatch(login(updatedUser));

      notification.success({
        message: 'Foto de perfil atualizada com sucesso',
      });

      onSuccess(data);
    } catch (error) {
      notification.error({
        message: 'Erro ao enviar foto de perfil',
        description: error.response?.data?.detail || error.message,
      });
      onError(error);
    }
  };

  return (
    <ProfileAuthorBox>
      <Cards headless>
        <div className="author-info">
          <figure>
            <img src={avatarSrc} alt="" />

            <Upload
              showUploadList={false}
              customRequest={handleAvatarUpload}
              accept="image/*"
            >
              <span className="cursor-pointer">
                <FeatherIcon icon="camera" size={16} />
              </span>
            </Upload>
          </figure>
          <figcaption>
            <div className="info">
              <Heading as="h4">{displayName}</Heading>
              <p>{displayRole}</p>
            </div>
          </figcaption>
        </div>
        <nav className="settings-menmulist">
          <ul>
            <li>
              <NextNavLink to={`${baseSettingsPath}/profile`} activeClassName="">
                <FeatherIcon icon="user" size={14} />
                Perfil
              </NextNavLink>
            </li>
            <li>
              <NextNavLink to={`${baseSettingsPath}/account`} activeClassName="">
                <FeatherIcon icon="settings" size={14} />
                Conta
              </NextNavLink>
            </li>
            <li>
              <NextNavLink to={`${baseSettingsPath}/password`} activeClassName="">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-key"
                >
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
                Senha
              </NextNavLink>
            </li>
          </ul>
        </nav>
      </Cards>
    </ProfileAuthorBox>
  );
}

AuthorBox.propTypes = {};

export default AuthorBox;
