import React, { useState, useEffect, useRef } from 'react';
import { LISTINGS } from '../../lib/graphql/queries';
import { Listings as ListingsData, ListingsVariables } from '../../lib/graphql/queries/Listings/__generated__/Listings';
import { useQuery } from 'react-apollo';
import { List, Layout, Typography, Affix } from 'antd';
import { ListingCard, ErrorBanner } from '../../lib/components';
import { ListingsFilter } from '../../lib/graphql/globalTypes';
import { RouteComponentProps, Link } from 'react-router-dom';
import { ListingsFilters, ListingsPagination, ListingsSkeleton } from './components';


interface MatchParams {
  location: string;
}

interface Props extends RouteComponentProps<MatchParams> {
}

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const PAGE_LIMIT = 8;

export const Listings: React.FC<Props> = ({ match }) =>
{
  const locationRef = useRef(match.params.location);
  const [ filter, setFilter ] = useState(ListingsFilter.PRICE_LOW_TO_HIGH);
  const [ page, setPage ] = useState(1);

  useEffect(() => {
    setPage(1);
    locationRef.current = match.params.location;
  }, [match.params.location]);

  const { data, loading, error } = useQuery<ListingsData, ListingsVariables>(LISTINGS, {
    skip: locationRef.current !== match.params.location && page !== 1,
    variables: {
      location: match.params.location,
      filter,
      limit: PAGE_LIMIT,
      page,
    },
  });

  const listings = data?.listings;
  const listingsRegion = listings?.region;


  // Augmentary Sections

  const listingsSectionElement = listings && listings.result.length ? (
    <div>
      <Affix offsetTop={64}>
        <ListingsPagination 
          total={listings.total} 
          page={page} 
          limit={PAGE_LIMIT} 
          setPage={setPage}
        />
        <ListingsFilters filter={filter} setFilter={setFilter}/>
      </Affix>

      <List 
        grid={{
          column: 4,
          gutter: 8,
          xs: 1, sm: 2, lg: 4,
        }}
        dataSource={listings.result}
        renderItem={
          listing => <List.Item>
            <ListingCard listing={listing}/>
          </List.Item>
        }
      />
    </div>
  ) : (
    <div>
      <Paragraph>It appears that no listings have yet been created for{" "}
        <Text mark>"{listingsRegion}"</Text>
      </Paragraph>
      <Paragraph>Be the first person to create a
        <Link to="/host"> listing in this area</Link>
      </Paragraph>
    </div>
  );

  const listingsRegionElement = listingsRegion ? (
    <Title level={3} className="listings__title">
      Results for "{ listingsRegion }"
    </Title>
  ) : null;

  // Conditional Rendering

  if (loading || error) {
    return <Content className="listings">
      {error && 
        <ErrorBanner 
          description="We either couldn't find anything matching your search or have encountered an error. If you're searching for a unique location, try searching again with more common keywords."
        />
      }
      <ListingsSkeleton />
    </Content>
  }

  return (
    <Content className="listings">
      { listingsRegionElement }
      { listingsSectionElement }
    </Content>
  );
}