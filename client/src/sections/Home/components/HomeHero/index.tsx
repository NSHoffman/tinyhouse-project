import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Col, Row, Typography, Input } from 'antd';

import imgToronto from '../../assets/toronto.jpg';
import imgDubai from '../../assets/dubai.jpg';
import imgLosAngeles from '../../assets/los-angeles.jpg';
import imgLondon from '../../assets/london.jpg';

const { Title } = Typography;
const { Search } = Input;


interface Props {
  onSearch(value: string): void;
}

export const HomeHero: React.FC<Props> = ({ onSearch }) => {
  return (
    <div className='home-hero'>
      <div className='home-hero__search'>
        <Title>Find a place you would love to stay at</Title>
        <Search className="home-hero__search-input" 
          placeholder="Search 'San Francisco'" 
          size="large"
          onSearch={onSearch} 
          enterButton
        />
      </div>
      
      <Row gutter={12} className='home-hero__cards'>
        <Col xs={12} md={6}>
          <Link to='/listings/toronto'>
            <Card cover={ <img src={imgToronto} alt="Toronto"/> }>
              Toronto
            </Card>
          </Link>                  
        </Col>

        <Col xs={12} md={6}>
          <Link to='/listings/dubai'>
            <Card cover={ <img src={imgDubai} alt="Dubai"/> }>
              Dubai
            </Card>
          </Link>           
        </Col>

        <Col xs={0} md={6}>
          <Link to='/listings/los%20angeles'>
            <Card cover={ <img src={imgLosAngeles} alt="Los Angeles"/> }>
              Los Angeles
            </Card>
          </Link>            
        </Col>

        <Col xs={0} md={6}>
          <Link to='/listings/london'>
            <Card cover={ <img src={imgLondon} alt="London"/> }>
              London
            </Card>
          </Link>            
        </Col>
      </Row>
    </div>
  );
};
