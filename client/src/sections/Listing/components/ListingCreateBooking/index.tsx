import React from 'react';
import { Button, Card, Divider, Typography, DatePicker } from 'antd';
import { formatListingPrice } from '../../../../lib/utils';
import { Maybe, Viewer } from '../../../../lib/types';
import { BookingsIndex } from './types';
import { Listing as ListingData } from '../../../../lib/graphql/queries/Listing/__generated__/Listing';
import moment, { Moment } from 'moment';

interface Props {
  price: number;
  viewer: Viewer;
  host: ListingData["listing"]["host"];
  bookingsIndex: ListingData["listing"]["bookingsIndex"];
  checkInDate: Maybe<Moment>;
  checkOutDate: Maybe<Moment>;
  setCheckInDate(d: Maybe<Moment>): void;
  setCheckOutDate(d: Maybe<Moment>): void;
  setModalVisible(value: boolean): void;
}

const { Paragraph, Title, Text } = Typography;

export const ListingCreateBooking: React.FC<Props> = (
  { price, viewer, host, bookingsIndex, checkInDate, checkOutDate, setCheckInDate, setCheckOutDate, setModalVisible }
) => 
{
  // Constants and variables
  const IS_VIEWER_SIGNEDIN = !!viewer.id;
  const IS_CHECKIN_DISABLED = !IS_VIEWER_SIGNEDIN;
  const IS_CHECKOUT_DISABLED = IS_CHECKIN_DISABLED || !checkInDate;
  const IS_CTA_DISABLED = IS_CHECKIN_DISABLED || !checkInDate || !checkOutDate;
  const IS_VIEWER_HOST = viewer.id === host.id;
  const IS_HOST_CONNECTED_TO_STRIPE = !!host.hasWallet;

  const bookingsIndexParsed: BookingsIndex = JSON.parse(bookingsIndex);
  
  let buttonMessage = "You won't be charged yet";
  if (!IS_VIEWER_SIGNEDIN) {
    buttonMessage = "You have to be signed in to book a listing!";
  }
  else if (IS_VIEWER_HOST) {
    buttonMessage = "You cannot book your own listing!";
  }
  else if (!IS_HOST_CONNECTED_TO_STRIPE) {
    buttonMessage = "The host has to be connected with Stripe to receive payments!";
  }

  // Utils for date verification
  const dateIsBooked = (date: Moment) => {
    const y = date.year();
    const m = date.month();
    const d = date.date();
  
    return !!bookingsIndexParsed[y] && !!bookingsIndexParsed[y][m] && !!bookingsIndexParsed[y][m][d];
  }

  const disableDatesForCheckIn = (d: Moment): boolean =>
  {
    return d.isBefore(moment().endOf('day')) || dateIsBooked(d);
  }

  const disableDatesForCheckOut = (d: Moment): boolean =>
  {
    let checkOutDisabled = false;
    if (dateIsBooked(d)) {
      checkOutDisabled = true;
    }
    else {
     checkOutDisabled = checkInDate
        ? d.isBefore(checkInDate)
        : d.isBefore(moment().endOf('day'));
    }

    return checkOutDisabled;
  }

  const verifyAndSetCheckInDate = (d: Maybe<Moment>) =>
  {
    if (checkOutDate?.isBefore(d)) setCheckOutDate(null);
    setCheckInDate(d);
  }

  // Render

  return (
    <div className='listing-booking'>
      <Card className='listing-booking__card'>
        <div>
          <Paragraph>
            <Title level={2} className='listing-booking__card-title'>
              { formatListingPrice(price) }
              <span>/day</span>
            </Title>
          </Paragraph>

          <Divider />

          <div className="listing-booking__card-date-picker">
            <Paragraph strong>Check In</Paragraph>
            <DatePicker value={ checkInDate } 
              onChange={verifyAndSetCheckInDate}
              format='DD/MM/YYYY'
              showToday={false}
              disabled={ IS_CHECKIN_DISABLED }
              disabledDate={disableDatesForCheckIn}
            />
          </div>

          <div className="listing-booking__card-date-picker">
            <Paragraph strong>Check Out</Paragraph>
            <DatePicker value={ checkOutDate }
              onChange={d => setCheckOutDate(d)}
              format='DD/MM/YYYY'
              showToday={false}
              disabled={ IS_CHECKOUT_DISABLED }
              disabledDate={disableDatesForCheckOut}
            />
          </div>  
        </div>

        <Divider />

        <Button disabled={IS_CTA_DISABLED} size='large' 
          type='primary' 
          className='listing-booking__card-cta'
          onClick={() => setModalVisible(true)}
        >
          Request to book!
        </Button>
        <Text mark type="secondary">{ buttonMessage }</Text>
      </Card>
    </div>
  );
};
