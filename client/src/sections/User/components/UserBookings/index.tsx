import React from 'react';
import { List, Typography } from 'antd';
import { ListingCard } from '../../../../lib/components';
import { User } from '../../../../lib/graphql/queries/User/__generated__/User';

interface Props {
  userBookings: User['user']['bookings'];
  bookingsPage: number;
  limit: number;
  setBookingsPage(page: number): void;
}

const { Paragraph, Title, Text } = Typography;

export const UserBookings: React.FC<Props> = ({ userBookings, bookingsPage, limit, setBookingsPage }) => 
{
  const total = userBookings?.total;
  const result = userBookings?.result;
  
  const userBookingsList = total && result ? (
    <List dataSource={ result } locale={{ emptyText: 'This user has no any bookings yet!' }}
      grid={{
        gutter: 8, xs: 1, sm: 2, lg: 4,
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
      renderItem={userBooking => {
        const bookingHistory = (
          <div className='user-bookings__booking-history'>
            <div>
              Check In: <Text strong>{ userBooking.checkIn }</Text>
            </div>

            <div>
              Check Out: <Text strong>{ userBooking.checkOut }</Text>
            </div>
          </div>
        )
        
        return (
          <List.Item>
            { bookingHistory }
            <ListingCard listing={ userBooking.listing }/>
          </List.Item>
        )
      }}
    />
  ) : null; 

  const userBookingsElement = userBookingsList ? (
    <div className='user-bookings'>
      <Title level={4} className='user-bookings__title'>
        Listings  
      </Title>

      <Paragraph className='user-bookings__description'>
        This section highlights the bookings you have made as well as the check-in/check-out dates associated with said bookings.
      </Paragraph>  

      { userBookingsList } 
    </div>
  ) : null;

  return userBookingsElement;
};
