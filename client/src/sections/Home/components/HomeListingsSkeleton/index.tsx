import React from 'react';
import { Card, List, Typography } from 'antd';
import listingCardLoadingCover from '../../assets/listing-loading-card-cover.jpg';

interface Props {
  title: string;
}

const { Title } = Typography;

export const HomeListingsSkeleton: React.FC<Props> = ({ title }) => 
{
  const emptyData = new Array(4).fill({});

  return (
    <div className="home-listings-skeleton">
      <Title level={4} className="home-listings__title">
        {title}
      </Title>

      <List grid={{
          gutter: 8,
          xs: 1, sm: 2, lg: 4,
        }}
        dataSource={emptyData}
        renderItem={listing => (
          <List.Item>
            <Card 
              cover={
                <div
                  className="home-listings-skeleton__card-cover-img" 
                  style={{ backgroundImage: `url(${listingCardLoadingCover})` }} 
                />
              }
              loading
            />
          </List.Item>
        )}
      />
    </div>
  );
};
