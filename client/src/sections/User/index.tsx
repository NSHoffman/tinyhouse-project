import React, { useState } from 'react';
import { UserProfile, UserListings, UserBookings } from './components';
import { RouteComponentProps } from 'react-router-dom';
import { useQuery } from 'react-apollo';
import { Layout, Row, Col } from 'antd';
import { USER } from '../../lib/graphql/queries/User';
import { User as UserData, UserVariables } from '../../lib/graphql/queries/User/__generated__/User';
import { Viewer } from '../../lib/types';
import { PageSkeleton, ErrorBanner } from '../../lib/components';

interface MatchParams {
  id: string;
}

interface Props extends RouteComponentProps<MatchParams> {
  viewer: Viewer;
  setViewer(viewer: Viewer): void;
}

const { Content } = Layout;
const PAGE_LIMIT = 4;

export const User: React.FC<Props> = ({ match, viewer, setViewer }) =>
{
  const [ listingsPage, setListingsPage ] = useState(1);
  const [ bookingsPage, setBookingsPage ] = useState(1);

  const { data, loading, error, refetch } = useQuery<UserData, UserVariables>(USER, {
    variables: {
      id: match.params.id,
      bookingsPage,
      listingsPage,
      limit: PAGE_LIMIT,
    },
  });

  const user = data?.user || null;
  const viewerIsUser = viewer.id === match.params.id;
  const stripeError = new URL(window.location.href).searchParams.get("stripe_error");

  const handleUserRefetch = async () => {
    await refetch();
  }

  // Augmentary data for render

  const userProfileElement = user && 
    <UserProfile user={user} 
      viewerIsUser={viewerIsUser} 
      viewer={viewer} 
      setViewer={setViewer}
      handleUserRefetch={handleUserRefetch}
    />;

  const userListingsElement = user?.listings &&
    <UserListings 
      userListings={ user.listings }
      listingsPage={ listingsPage }
      limit={ PAGE_LIMIT }
      setListingsPage={ setListingsPage }
    />

  const userBookingsElement = user?.bookings &&
    <UserBookings 
      userBookings={ user.bookings }
      bookingsPage={ bookingsPage }
      limit={ PAGE_LIMIT }
      setBookingsPage={ setBookingsPage }
    />

  const stripeErrorBanner = stripeError &&
    <ErrorBanner description="We had an issue connecting with Stripe. Please try again soon."/>

  // Conditional Render

  if (loading) return (
    <Content className='user'>
      <PageSkeleton />
    </Content>
  );

  if (error) return (
    <Content className='user'>
      <ErrorBanner description='This user may not exist or we have encountered an error. Please make sure the user ID is correct or try again later!'/>
      <PageSkeleton />
    </Content>
  );

  return (
    <Content className='user'>
      { stripeErrorBanner }
      <Row gutter={12} justify='space-between'>
        <Col xs={24}>
          { userProfileElement }
        </Col>

        <Col xs={24}>
          { userListingsElement }
          { userBookingsElement }
        </Col>
      </Row>
    </Content>
  );
};