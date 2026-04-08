import React from 'react';
import { ErrorWrapper } from './style';
import { Main } from '../styled';
import Heading from '../../components/heading/heading';
import { Button } from '../../components/buttons/buttons';
import { getImageUrl } from '../../utility/getImageUrl';
import { NextNavLink } from '../../components/utilities/NextLink';

function NotFound() {
  return (
    <Main>
      <ErrorWrapper>
        <img src={getImageUrl('static/img/pages/404.svg')} alt="404" />
        <Heading className="error-text" as="h3">
          404
        </Heading>
        <p>Sorry! the page you are looking for does n`t exist.</p>
        <NextNavLink to="/admin">
          <Button size="default" type="primary">
            Return Home
          </Button>
        </NextNavLink>
      </ErrorWrapper>
    </Main>
  );
}

export default NotFound;
