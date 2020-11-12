import React from 'react';
import { HomeHero, HomeListings, HomeListingsSkeleton } from './components';
import { Col, Row, Layout, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-apollo';
import { useHistory } from 'react-router-dom';
import { displayErrorMessage } from '../../lib/utils';
import { Listings as ListingsData, ListingsVariables } from '../../lib/graphql/queries/Listings/__generated__/Listings';
import { LISTINGS } from '../../lib/graphql/queries/Listings';
import { ListingsFilter } from '../../lib/graphql/globalTypes';

import mapBackground from './assets/map-background.jpg';
import imgSanFrancisco from './assets/san-fransisco.jpg';
import imgCancun from './assets/cancun.jpg';


interface Props {
}

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const PAGE_LIMIT = 4;

export const Home: React.FC<Props> = () =>
{
  const history = useHistory();
  const { data, loading } = useQuery<ListingsData, ListingsVariables>(LISTINGS, {
    variables: {
      filter: ListingsFilter.PRICE_HIGH_TO_LOW,
      limit: PAGE_LIMIT,
      page: 1,
    },
  });

  const onSearch = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) displayErrorMessage("Please enter a valid location to search for!");
    else history.push(`/listings/${trimmed}`);
  }

  // Conditional Rendering

  const renderListingsSection = () => {
    if (loading) return <HomeListingsSkeleton title="Premium Listings - Loading"/>;

    if (data) {
      return <HomeListings title="Premium Listings" listings={data.listings.result} />
    }

    return null;
  }

  // Main Render
  
  return (
    <Content className='home' style={{ backgroundImage: `url(${mapBackground})` }}>
      <HomeHero onSearch={ onSearch }/>

      <div className="home__cta-section">
        <Title level={2} className="home__cta-section-title">Your guide for all things rental</Title>
        <Paragraph>
          Helping you make the best decisions in renting your last minute locations.
        </Paragraph>

        <Link to="/listings/united%20states" className="ant-btn and-btn-primary ant-btn-lg home__cta-section-button">
          Popular listings in the United States
        </Link>
      </div>

      { renderListingsSection() }

      <div className="home__listings">
        <Title level={4} className="home__listings-title">Listings of any kind</Title>

        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Link to="/listings/san%20francisco">
              <div className="home__listings-img-cover">
                <img src={imgSanFrancisco} alt="San Francisco" className="home__listings-img"/>
              </div>
            </Link>
          </Col>
          <Col xs={24} sm={12}>
            <Link to="/listings/cancun">
              <div className="home__listings-img-cover">
                <img src={imgCancun} alt="Cancun" className="home__listings-img"/>
              </div>
            </Link>
          </Col>
        </Row>
      </div>
    </Content>
  );
};