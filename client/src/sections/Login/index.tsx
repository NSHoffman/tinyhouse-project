import React, { useEffect, useRef } from 'react';
import { Redirect } from 'react-router-dom';
import { useApolloClient, useMutation } from 'react-apollo';
import { Card, Layout, Typography, Spin } from 'antd';
import { ErrorBanner } from '../../lib/components/';
import { displaySuccessNotification, displayErrorMessage } from '../../lib/utils';
import { AUTH_URL } from '../../lib/graphql/queries';
import { LOG_IN } from '../../lib/graphql/mutations';
import { Viewer } from '../../lib/types';
import { AuthUrl as AuthUrlData } from '../../lib/graphql/queries/AuthUrl/__generated__/AuthUrl';
import { LogIn as LogInData, LogInVariables } from '../../lib/graphql/mutations/LogIn/__generated__/LogIn';
// import { LogOut } from '../../lib/graphql/mutations/LogOut/__generated__/LogOut';

// Non-code assets
import googleLogo from './assets/google_logo.jpg';
// ***************

// Interfaces
interface Props {
  setViewer(viewer: Viewer): void;
}
// **********

const { Content } = Layout;
const { Text, Title } = Typography;

export const Login: React.FC<Props> = ({ setViewer }) =>
{
  // Establishing Client
  const client = useApolloClient();

  // Login Mutation Data Retrieval
  const [ 
    logIn, 
    { data: logInData, loading: logInLoading, error: logInError } 
  ] = 
  useMutation<LogInData, LogInVariables>(LOG_IN, {
    onCompleted: data => {
      if (data?.logIn?.token) {
        setViewer(data.logIn);
        sessionStorage.setItem('token', data.logIn.token);
        displaySuccessNotification('You\'ve successfully logged in!');
      }
        
    },
  });

  // Login Mutation function kept as a ref to avoid unnecessary rerender
  const logInRef = useRef(logIn);

  useEffect(() => 
  {
    const code = new URL(window.location.href).searchParams.get('code');

    if (code) logInRef.current({
      variables: {
        input: { code },
      },
    });
  }, []);

  // Handling Authorization
  const handleAuthorization = async () => 
  {
    try {
      const { data } = await client.query<AuthUrlData>({
        query: AUTH_URL,
      });

      window.location.href = data.authUrl;
    }
    catch (err) {
      displayErrorMessage("Sorry! We weren't able to log you in :( Please try again later!");
    }
  }

  
  // Rendering Component

  // Loading case
  if (logInLoading) return <Content className='log-in'>
    <Spin size='large' tip='Logging you in...'/>
  </Content>

  // User has logged in - Redirect
  if (logInData?.logIn) {
    const { id: viewerId } = logInData.logIn;
    return <Redirect to={ `/user/${viewerId}` }/>
  }

  // Default Render
  return (
    <Content className='log-in'>
      { logInError && <ErrorBanner description="Sorry! We weren't able to log you in :( Please try again later!" /> }
      <Card className='log-in-card'>
        <div className='log-in-card__intro'>
          <Title level={3} className='log-in-card__intro-title'>
            <span role='img' aria-label='wave'>
              👋
            </span>
          </Title>

          <Title level={3} className='log-in-card__intro-title'>
            Log in to TinyHouse!
          </Title>

          <Text>
            Sign in with Google to start booking available rentals!
          </Text>
        </div>

        <button className='log-in-card__google-button' onClick={handleAuthorization}>
          <img src={googleLogo} alt="Google Logo" className='log-in-card__google-button-logo'/>
          <span className='log-in-card__google-button-text'>
            Sign in with Google
          </span>
        </button>

        <Text type='secondary'>
          Note: By signing in, you'll be redirected to the Google consent form to sign in with your Google account.
        </Text>
      </Card>
    </Content>
  );
}