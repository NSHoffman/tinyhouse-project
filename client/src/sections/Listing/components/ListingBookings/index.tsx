import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Divider, List, Typography } from 'antd';
import { Listing } from '../../../../lib/graphql/queries/Listing/__generated__/Listing';

interface Props {
  listingBookings: Listing['listing']['bookings'];
  bookingsPage: number;
  limit: number;
  setBookingsPage(page: number): void;
}

const { Title, Text } = Typography;

export const ListingBookings: React.FC<Props> = ({ listingBookings, bookingsPage, limit, setBookingsPage }) => 
{
  const total = listingBookings?.total;
  const result = listingBookings?.result;
  
  const listingBookingsList = total && result ? (
    <List dataSource={ result } locale={{ emptyText: 'There are no any bookings yet!' }}
      grid={{
        gutter: 8, xs: 1, sm: 2, lg: 3,
      }}
      pagination={{
        position: 'top',
        current: bookingsPage,
        total,
        defaultPageSize: limit,
        hideOnSinglePage: true,
        showLessItems: true,
        onChange: (page: number) => setBookingsPage(page),
      }}
      renderItem={listingBooking => {
        const bookingHistory = (
          <div className='user-bookings__booking-history'>
            <div>
              Check In: <Text strong>{ listingBooking.checkIn }</Text>
            </div>

            <div>
              Check Out: <Text strong>{ listingBooking.checkOut }</Text>
            </div>
          </div>
        )
        
        return (
          <List.Item className='listing-bookings__item'>
            { bookingHistory }
            <Link to={`/user/${listingBooking.tenant.id}`}>
              <Avatar size={64} shape='square' src={ listingBooking.tenant.avatar } />
            </Link>
          </List.Item>
        )
      }}
    />
  ) : null; 

  const listingBookingsElement = listingBookingsList ? (
    <div className='user-bookings'>

      <Divider />

      <div className="listing-bookings__section">
        <Title level={4} className='user-bookings__title'>
          Listings  
        </Title>
      </div>

      { listingBookingsList } 
    </div>
  ) : null;

  return listingBookingsElement;
};
