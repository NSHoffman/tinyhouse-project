import React from 'react';
import { Card, List, Skeleton } from 'antd';
import listingCardLoadingCover from '../../assets/listing-loading-card-cover.jpg';

export const ListingsSkeleton: React.FC = () => 
{
  const emptyData = new Array(8).fill({});

  return (
    <div className="listings-skeleton">
      <Skeleton paragraph={{ rows: 1 }} />

      <List grid={{
          column: 4,
          gutter: 8,
          xs: 1, sm: 2, lg: 4,
        }}
        dataSource={emptyData}
        renderItem={listing => (
          <List.Item>
            <Card
              className="listings-skeleton__card"
              cover={
                <div
                  className="listings-skeleton__card-cover-img" 
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
