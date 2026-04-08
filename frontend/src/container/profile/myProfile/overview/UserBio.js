import React from 'react';
import FeatherIcon from 'feather-icons-react';
import FontAwesome from 'react-fontawesome';
import { UserBioBox } from './style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { Button } from '../../../../components/buttons/buttons';
import { useSelector } from 'react-redux';

function UserBio() {
  const { email, bio, phone, website, skills } = useSelector(state => state.auth.login || {});

  const skillsList = skills ? skills.split(',').map(s => s.trim()) : [];

  return (
    <UserBioBox>
      <Cards headless>
        <article className="user-info">
          <h5 className="user-info__title">Biografia</h5>
          <p>{bio || 'Nenhuma biografia informada.'}</p>
        </article>
        <address className="user-info">
          <h5 className="user-info__title">Informações de Contato</h5>
          <ul className="user-info__contact">
            <li>
              <FeatherIcon icon="mail" size={14} /> <span>{email}</span>
            </li>
            {phone && (
                <li>
                <FeatherIcon icon="phone" size={14} /> <span>{phone}</span>
                </li>
            )}
            {website && (
                <li>
                <FeatherIcon icon="globe" size={14} /> <span>{website}</span>
                </li>
            )}
          </ul>
        </address>
        {skillsList.length > 0 && (
            <div className="user-info">
            <h5 className="user-info__title">Especialidades</h5>
            <div className="user-info__skills">
                {skillsList.map((skill, index) => (
                    <Button key={index} type="light" outlined className="btn-outlined">
                        {skill}
                    </Button>
                ))}
            </div>
            </div>
        )}
      </Cards>
    </UserBioBox>
  );
}

export default UserBio;
