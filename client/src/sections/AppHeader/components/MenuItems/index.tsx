import React from 'react';
import { useMutation } from 'react-apollo';
import { Avatar, Button, Menu } from 'antd';
import { HomeOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Viewer } from '../../../../lib/types';
import { LOG_OUT } from '../../../../lib/graphql/mutations';
import { LogOut as LogOutData } from '../../../../lib/graphql/mutations/LogOut/__generated__/LogOut';
import { displaySuccessNotification, displayErrorMessage } from '../../../../lib/utils';

interface Props {
  viewer: Viewer;
  setViewer(viewer: Viewer): void;
}

const { Item, SubMenu } = Menu;
export const MenuItems: React.FC<Props> = ({ viewer, setViewer }) =>
{
  const [ logOut ] = useMutation<LogOutData>(LOG_OUT, {
    onCompleted: data => {
      if (data?.logOut) {
        setViewer(data.logOut);
        sessionStorage.removeItem('token');
        displaySuccessNotification('You have successfully logged out!');
      }
    },

    onError: () => {
      displayErrorMessage('Oops! Log out failed :(');
    }
  });

  const handleLogOut = () => {
    logOut();
  }

  const subMenuLogin = 
    viewer.id && viewer.avatar ? 
    (
      <SubMenu title={ <Avatar src={viewer.avatar} /> }>
        <Item key='/user'>
          <Link to={`/user/${viewer.id}`}>
            <UserOutlined />
            Profile
          </Link>
        </Item>

        <Item key='/logout' onClick={handleLogOut}>
          <LogoutOutlined />
          Log out
        </Item>
      </SubMenu>
    ) : (
      <Item>
        <Link to='/login'>
          <Button type='primary'>Sign In</Button>
        </Link>
      </Item>
    );


  return (
    <Menu mode='horizontal' selectable={false} className='menu'>
      <Item key='/host'>
        <Link to='/host'>
          <HomeOutlined />
          Host
        </Link>
      </Item>

      { subMenuLogin }
    </Menu>
  );
}