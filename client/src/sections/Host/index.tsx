import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { Link } from 'react-router-dom';
import { Button, Form, Input, InputNumber, Layout, Radio, Typography, Upload } from 'antd';
import { UploadChangeParam } from 'antd/lib/upload';
import { HomeOutlined, BankOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { RouteComponentProps } from 'react-router-dom';
import { Viewer } from '../../lib/types';
import { HostListingInput, ListingType } from '../../lib/graphql/globalTypes';
import { displayErrorMessage, displaySuccessNotification, iconColor } from '../../lib/utils';
import { Store } from 'antd/lib/form/interface';
import { HOST_LISTING } from '../../lib/graphql/mutations/HostListing/index';
import { HostListing as HostListingData, HostListingVariables } from '../../lib/graphql/mutations/HostListing/__generated__/HostListing';

const { Content } = Layout;
const { Text, Title } = Typography;
const { Item } = Form;

const beforeImageUpload = (file: File) => 
{
  const isFileValidImage = /image\/(jpe?g|png)/.test(file.type);
  const hasFileValidSize = (file.size / 1024**2) < 1;

  if (!isFileValidImage) {
    displayErrorMessage("You're only able to upload valid JPG or PNG files!");
    return false;
  }
  if (!hasFileValidSize) {
    displayErrorMessage("You're only able to upload image files under 1MB in size!");
    return false;
  }
  return true;
}

const getBase64Value = (img: File | Blob, callback: (imgB64Value: string) => void) => {
  const reader = new FileReader();
  reader.readAsDataURL(img);

  reader.onload = () => {
    callback(reader.result as string);
  };
}

interface Props extends RouteComponentProps {
  viewer: Viewer;
}

interface AddressComponentFields {
  address: string;
  city?: string;
  state?: string;
  postal?: string;
}

type HostListingValidFields = HostListingInput & AddressComponentFields;
type ConcatenatedFields = {
  [K in keyof HostListingValidFields]: HostListingValidFields[K];
}

export const Host: React.FC<Props> = ({ viewer, history }) =>
{
  // State Inititalization
  const [ form ] = Form.useForm();
  const [isImageLoading, setImageLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState("");

  const [hostListing, { loading }] = useMutation<HostListingData, HostListingVariables>(HOST_LISTING, {
    onError: err => {
      displayErrorMessage(
        "Sorry! We weren't able to create your listing. Please try again later!"
      );
    },

    onCompleted: data => {
      displaySuccessNotification("You've successfully created your listing!");
      history.push(`/listing/${data.hostListing.id}`);
    }
  });
  
  // Utilities
  const handleImageUpload = (info: UploadChangeParam) => {
    const { file } = info;

    switch (file.status) {
      case 'uploading':
        setImageLoading(true);
        break;
      
      case 'done':
        if (file.originFileObj) {
          getBase64Value(
            file.originFileObj,
            imgB64Value => {
              setImageBase64(imgB64Value);
              setImageLoading(false);
            }
          );
        }
        // else setImageLoading(false);
        break;
    }
  }

  const handleHostListing = (store: Store) => {
    const values = store as HostListingValidFields;
    const fullAddress = `${values.address}, ${values.city}, ${values.state}, ${values.postal}`;
    const input: ConcatenatedFields = {
      ...values,
      address: fullAddress,
      image: imageBase64,
      price: values.price * 100,
    };

    delete input.city;
    delete input.state;
    delete input.postal;

    hostListing({
      variables: {
        input
      },
    });
  }

  // Condtional Rendering

  if (!viewer.id || !viewer.hasWallet) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title className="host__form-title" level={4}>
            You'll have to be signed in and connected with Stripe to host a listing!
          </Title>
          <Text type="secondary">
            We only allow users who have signed in to our application and have connected with Stripe to host new listings.
            You can sign in at the <Link to="/login"></Link> page and connect with Stripe shortly after.
          </Text>
        </div>
      </Content>
    );
  }

  if (loading) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title className="host__form-title" level={3}>
            Loading. Please wait!
          </Title>
          <Text type="secondary">
            We're creating your listing now.
          </Text>
        </div>
      </Content>
    );
  }

  return (
    <Content className="host-content">
      <Form form={form} layout="vertical" onFinish={handleHostListing}>
        <div className="host__form-header">
          <Title className="host__form-title" level={3}>Hi! Let's get started listing your place.</Title>
          <Text type="secondary">
            In this form, we'll collect some basic and additional information about your listing.
          </Text>
        </div>

        <Item label="Home Type" name="type" rules={[
          { required: true, message: "Please select a home type!" },
        ]}>
          <Radio.Group>
            <Radio.Button value={ListingType.APARTMENT}>
              <BankOutlined style={{ color: iconColor }}/>
              <span> Apartment</span>  
            </Radio.Button>
            <Radio.Button value={ListingType.HOUSE}>
              <HomeOutlined style={{ color: iconColor }}/>
              <span> House</span>
            </Radio.Button>
          </Radio.Group>
        </Item>

        <Item name="numOfGuests" label="Max number of guests" rules={[
          { required: true, message: "Please specify the maximum number of guests!" },
        ]}>
          <InputNumber min={0} placeholder="5"/>
        </Item>
        
        <Item name="title" label="Title" extra="Max character length of 45" rules={[
          { required: true, message: "Please provide a title for your listing!" },
        ]}>
          <Input maxLength={45} placeholder="The iconic and luxurious Bel-Air mansion"/>
        </Item>

        <Item name="description" label="Description" extra="Max character length of 400" rules={[
          { required: true, message: "Please provide informative description for your listing!" },
        ]}>
          <Input.TextArea rows={3} maxLength={400} placeholder="Modern, clean and iconic home of the Fresh Prince. Situated in the heart of Bel-Air, Los Angeles."/>
        </Item>

        <Item name="state" label="State/Province" rules={[
          { required: true, message: "Please specify an appropriate region for your listing!" },
        ]}>
          <Input placeholder="California"/>
        </Item>

        <Item name="city" label="City/Town" rules={[
          { required: true, message: "Please specify an appropriate city or town for your listing!" },
        ]}>
          <Input placeholder="Los Angeles"/>
        </Item>

        <Item name="address" label="Address" rules={[
          { required: true, message: "Please specify a valid address for your listing!" },
        ]}>
          <Input placeholder="251 North Bristol Avenue"/>
        </Item>

        <Item name="postal" label="Zip/Postal Code" rules={[
          { required: true, message: "Please enter a zip/postal code!" },
        ]}>
          <Input placeholder="Please enter a zip code for your listing!"/>
        </Item>

        <Item name="image" label="Image" extra="Images have to be under 1MB in size and of type JPG or PNG" rules={[
          { required: true, message: "Please provide a valid image of your listing!" },
        ]}>
          <div className="host__form-image-upload">
            <Upload name="image" listType="picture-card" showUploadList={false}
              beforeUpload={beforeImageUpload}
              onChange={handleImageUpload}
              customRequest={({file, onSuccess}) => {
                setTimeout(() => {
                  onSuccess({}, file);
                }, 0); 
              }}
            >
              { 
                imageBase64 ? 
                  <img src={imageBase64} alt="listing" /> 
                : 
                  <div>
                    { isImageLoading ? <LoadingOutlined /> : <PlusOutlined /> }
                    <div className="ant-upload-text">Upload</div>
                  </div>
              }
            </Upload>
          </div>
        </Item>

        <Item name="price" label="Price" extra="All prices in $/day" rules={[
          { required: true, message: "Please specify price for your listing!" },
        ]}>
          <InputNumber min={0} placeholder="120"/>
        </Item>

        <Item>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Item>
      </Form>
    </Content>
  );
}