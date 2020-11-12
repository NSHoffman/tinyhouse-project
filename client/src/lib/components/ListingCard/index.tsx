import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Listing } from '../../types';
import { iconColor, formatListingPrice } from '../../utils';

interface Props {
  listing: Listing;
}

const { Text, Title } = Typography;

export const ListingCard: React.FC<Props> = ({ listing }) => 
{
  const { id, title, image, address, price, numOfGuests } = listing;
  
  
  return (
    <Link to={`/listing/${id}`}>    
      <Card hoverable      
        cover={ 
          <div
            className='listing-card__cover-img' 
            style={{ backgroundImage: `url(${image})` }}
          /> 
        }
      >
        <div className="listing-card__details">
          <div className="listing-card__description">
            <Title level={4} className='listing-card__price'>
              { formatListingPrice(price) }
              <span>/day</span>
            </Title>

            <Text strong ellipsis className='listing-card__title'>
              { title }
            </Text>

            <Text ellipsis className='listing-card__address'>
              { address }
            </Text>
          </div>

          <div className="listing-card__dimensions listing-card__dimensions--guests">
            <UserOutlined style={{ color: iconColor }}/>
            <Text>
              {numOfGuests} guests
            </Text>
          </div>
        </div>
      </Card>
    </Link>
  );
};
