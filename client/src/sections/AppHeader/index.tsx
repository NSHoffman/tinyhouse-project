import React, { useState, useEffect } from 'react';
import { Input, Layout } from 'antd';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { MenuItems } from './components';
import logo from './assets/tinyhouse-logo.png';
import { Viewer } from '../../lib/types';
import { displayErrorMessage } from '../../lib/utils';

interface Props extends RouteComponentProps {
  viewer: Viewer;
  setViewer(viewer: Viewer): void;
}

const { Header } = Layout;
const { Search } = Input;

export const AppHeader = withRouter(({ viewer, setViewer, history, location }: Props) =>
{
  const [search, setSearch] = useState("");
  useEffect(() => {
    const { pathname } = location;
    const pathSubstrings = pathname.split('/');

    if (!pathname.includes("/listings")) {
      setSearch("");
      return;
    } 
    if (pathname.includes("/listings") && pathSubstrings.length === 3) {
      setSearch(pathSubstrings[2]);
      return;
    }

  }, [location]);

  // Handlers
  const onSearch = (value: string) =>
  {
    const trimmed = value.trim();

    if (trimmed) history.push(`/listings/${trimmed}`);
    else displayErrorMessage('Please enter the valid search'); 
  }

  return (
    <Header className='app-header'>
      <div className='app-header__logo-search-section'>
        <div className='app-header__logo'>
          <Link to='/'>
            <img src={logo} alt="TinyHouse Logo"/>
          </Link>
        </div>

        <div className="app-header__search-input">
          <Search 
            placeholder="Search 'San Francisco'"
            value={search}
            onChange={(e => setSearch(e.target.value))}
            onSearch={onSearch}
            enterButton
          />
        </div>
      </div>

      <div className="app-header__menu-section">
        <MenuItems viewer={viewer} setViewer={setViewer}/>
      </div>
    </Header>
  );
});