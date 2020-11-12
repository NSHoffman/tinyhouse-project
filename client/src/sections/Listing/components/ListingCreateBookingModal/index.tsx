import React from 'react';
import { useMutation } from 'react-apollo';
import { Button, Divider, Modal, Typography } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { Moment } from 'moment';
import { formatListingPrice, displayErrorMessage, displaySuccessNotification } from '../../../../lib/utils';
import { CardElement, injectStripe, ReactStripeElements } from 'react-stripe-elements';
import { CreateBooking as CreateBookingData, CreateBookingVariables } from '../../../../lib/graphql/mutations/CreateBooking/__generated__/CreateBooking';
import { CREATE_BOOKING } from '../../../../lib/graphql/mutations';


interface Props {
  id: string;
  price: number;
  checkInDate: Moment;
  checkOutDate: Moment;
  modalVisible: boolean;
  setModalVisible(value: boolean): void;
  handleListingRefetch(): Promise<void>;
  cleanup(): void;
}

const { Paragraph, Text, Title } = Typography;

const ListingCreateBookingModal: React.FC<Props & ReactStripeElements.InjectedStripeProps> = (
  { id, price, checkInDate, checkOutDate, modalVisible, setModalVisible, handleListingRefetch, cleanup, stripe }
) => 
{
  const [createBooking] = useMutation<CreateBookingData, CreateBookingVariables>(CREATE_BOOKING, {
    onCompleted: data => {
      cleanup();
      displaySuccessNotification(
        "You've successfully created a booking!",
        "Booking history can always be found in your user page."
      );
      handleListingRefetch();
    },
    onError: err => {
      displayErrorMessage("Sorry! We weren't able to create a booking! Please try again later.");
    },
  });

  const daysBooked = checkOutDate.diff(checkInDate, 'days') + 1;
  const bookingPrice = daysBooked * price;

  // Utility functions

  const handleCreateBooking = async () => {
    if (!stripe) {
      return displayErrorMessage("Sorry! We couldn't establish connection with Stripe");
    }

    let { token: stripeToken, error } = await stripe.createToken();
    if (stripeToken) {
      createBooking({
        variables: {
          input: {
            id,
            source: stripeToken.id,
            checkIn: checkInDate.format("YYYY-MM-DD"),
            checkOut: checkOutDate.format("YYYY-MM-DD"),
          },
        },
      });
    }
    else {
      displayErrorMessage(error?.message ? error.message : "Sorry! We weren't able to book the listing. Please try again later.");
    }
  };

  return (
    <Modal centered footer={null}
      visible={ modalVisible }
      onCancel={() => setModalVisible(false)}
    >
      <div className="listing-booking-modal">
        <div className="listing-booking-modal__intro">
          <Title className="listing-booking-modal__intro-title">
            <KeyOutlined />
          </Title>

          <Title level={3} className="listing-booking-modal__intro-title">
            Book your trip
          </Title>
          <Paragraph>
            Enter your payment information to book the listing from the dates between 
            {" "}<Text strong mark>{checkInDate.format("MMMM Do YYYY")}</Text> and 
            {" "}<Text strong mark>{checkOutDate.format("MMMM Do YYYY")}</Text>, inclusive.
          </Paragraph>
        </div>

        <Divider />

        <div className="listing-booking-modal__charge-summary">
          <Paragraph>
            {formatListingPrice(price, false)} * {daysBooked} days =
            <Text strong> {formatListingPrice(bookingPrice, false)}</Text>
          </Paragraph>

          <Paragraph className="listing-booking-modal__charge-summary-total">
            Total = <Text strong mark>{formatListingPrice(bookingPrice, false)}</Text>
          </Paragraph>
        </div>

        <Divider />

        <div className="listing-booking-modal__stripe-card-section">
          <CardElement hidePostalCode className="listing-booking-modal__stripe-card"/>
          <Button size="large" type="primary" className="listing-booking-modal__cta"
            onClick={ handleCreateBooking }
          >
            Book
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export const WrappedListingCreateBookingModal = injectStripe(ListingCreateBookingModal);