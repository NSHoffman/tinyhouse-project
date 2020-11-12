import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { Viewer } from './lib/types';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Affix, Layout, Spin } from 'antd';
import { Home, Host, Listing, Listings, Login, NotFound, User, AppHeader, Stripe } from './sections';
import ApolloClient from 'apollo-boost';
import { ApolloProvider, useMutation } from 'react-apollo';
import './styles/index.css';
import { LOG_IN } from './lib/graphql/mutations';
import { LogIn as LogInData, LogInVariables } from './lib/graphql/mutations/LogIn/__generated__/LogIn';
import { AppHeaderSkeleton, ErrorBanner } from './lib/components';
import { StripeProvider, Elements } from 'react-stripe-elements';


const client = new ApolloClient({
  uri: "/api",
  request: async operation => {
    const token = sessionStorage.getItem('token');

    operation.setContext({
      headers: {
        'X-CSRF-TOKEN': token || '',
      },
    });
  },
});

const initialViewer: Viewer = {
  id: null,
  token: null,
  avatar: null,
  hasWallet: null,
  didRequest: false,
}

const App: React.FC = () => 
{
  const [ viewer, setViewer ] = useState<Viewer>(initialViewer);
  const [ logIn, { error: logInError }] = useMutation<LogInData, LogInVariables>(LOG_IN, {
    onCompleted: data => {
      if (data?.logIn) {
        setViewer(data.logIn);

        if (data.logIn.token) sessionStorage.setItem('token', data.logIn.token);
        else sessionStorage.removeItem('token');
      }
    },
  });
  const logInRef = useRef(logIn);

  useEffect(() => {
    logInRef.current();
  }, []);

  if (!viewer.didRequest && !logInError) {
    return (
      <Layout className='app-skeleton'>
        <AppHeaderSkeleton />
        <div className="app-skeleton__spin-section">
          <Spin size='large' tip='Launching TinyHouse' />
        </div>
      </Layout>
    );
  }

  const logInErrorBanner = logInError ? <ErrorBanner description='We were not able to verify if you were logged in. Please try again later :('/> : null;

  return (
    <StripeProvider apiKey={process.env.REACT_APP_S_PUBLISHABLE_KEY as string}>
      <Router>
        { logInErrorBanner }
        <Layout id='app'>
          <Affix offsetTop={0} className='app_affix-header'>
            <AppHeader viewer={viewer} setViewer={setViewer} />
          </Affix>
          <Switch>
            <Route exact path='/' component={ Home }/>
            <Route exact path='/host' render={ 
              props => <Host {...props} viewer={viewer}/>
            }/>
            <Route exact path='/listing/:id' render={
              props => <Elements>
                <Listing {...props} viewer={viewer}/>
              </Elements>
            }/>
            <Route exact path='/listings/:location?' component={ Listings }/>
            <Route exact path='/stripe' render={
              props => <Stripe {...props} viewer={viewer} setViewer={setViewer}/>
            }/>
            <Route exact path='/user/:id' render={
              props => <User {...props} viewer={viewer} setViewer={setViewer}/>
            }/>
            <Route exact path='/login' render={
              props => <Login {...props} setViewer={setViewer}/>
            }/>
            <Route component={ NotFound }/>
          </Switch>
        </Layout>
      </Router>
    </StripeProvider>
  );
}


ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();