import React, { useState } from 'react';
import { useQuery } from 'react-apollo';
import { LISTING } from '../../lib/graphql/queries';
import { Listing as ListingData, ListingVariables } from '../../lib/graphql/queries/Listing/__generated__/Listing';
import { RouteComponentProps } from 'react-router-dom';
import { PageSkeleton, ErrorBanner } from '../../lib/components';
import { Layout, Col, Row } from 'antd';
import { 
  ListingDetails, 
  ListingBookings, 
  ListingCreateBooking, 
  WrappedListingCreateBookingModal as ListingCreateBookingModal
} from './components';
import { Moment } from 'moment';
import { Maybe, Viewer } from '../../lib/types';

interface MatchParams {
  id: string;
}

interface Props extends RouteComponentProps<MatchParams> {
  viewer: Viewer;
}

const { Content } = Layout;
const PAGE_LIMIT = 3;
export const Listing: React.FC<Props> = ({ match, viewer }) =>
{
  const [ checkInDate, setCheckInDate ] = useState<Maybe<Moment>>(null);
  const [ checkOutDate, setCheckOutDate ] = useState<Maybe<Moment>>(null);
  const [ bookingsPage, setBookingsPage ] = useState(1);
  const [ modalVisible, setModalVisible ] = useState(false);

  const { data, loading, error, refetch } = useQuery<ListingData, ListingVariables>(LISTING, {
    variables: {
      id: match.params.id,
      bookingsPage,
      limit: PAGE_LIMIT,
    },
  });

  const clearBookingDates = () => {
    setModalVisible(false);
    setCheckInDate(null);
    setCheckOutDate(null);
  }
  const handleListingRefetch = async () => {
    await refetch();
  }

  // Data shaping

  const listing = data?.listing || null;
  const listingBookings = listing?.bookings || null;
  const listingDetailsElement = listing && <ListingDetails listing={ listing } />;
  const listingBookingsElement = listingBookings && (
    <ListingBookings 
      listingBookings={ listingBookings } 
      bookingsPage={ bookingsPage }
      setBookingsPage={ setBookingsPage } 
      limit={ PAGE_LIMIT }
    />
  );
  const listingCreateBookingElement = listing && (
    <ListingCreateBooking 
      price={ listing.price }
      viewer={ viewer } 
      host={ listing.host }
      bookingsIndex={ listing.bookingsIndex }
      checkInDate={ checkInDate } 
      checkOutDate={ checkOutDate }
      setCheckInDate={ setCheckInDate } 
      setCheckOutDate={ setCheckOutDate }
      setModalVisible={ setModalVisible }
    />
  );

  const listingCreateBookingModalElement = listing && checkInDate && checkOutDate && (
    <ListingCreateBookingModal
      id={listing.id}
      cleanup={clearBookingDates}
      price={listing.price} 
      checkInDate={checkInDate} 
      checkOutDate={checkOutDate} 
      modalVisible={modalVisible} 
      setModalVisible={setModalVisible}
      handleListingRefetch={handleListingRefetch}
    />
  );

  // Conditional Rendering

  if (loading) return (
    <Content className='listings'>
      <PageSkeleton />
    </Content>
  );

  if (error) return (
    <Content className='listings'>
      <ErrorBanner description="This listing may not exist or we've encountered an error. Please try again soon!" />
      <PageSkeleton />
    </Content>
  );

  return (
    <Content className='listings'>
      <Row gutter={24} justify='space-between'>
        <Col xs={24} lg={14}>
          { listingDetailsElement }
          { listingBookingsElement }
        </Col>

        <Col xs={24} lg={10}>
          { listingCreateBookingElement }
        </Col>
      </Row>
      { listingCreateBookingModalElement }
    </Content>
  );
}