import React from 'react';
import { Alert } from 'antd';

interface Props {
  message?: string;
  description?: string;
}

export const ErrorBanner: React.FC<Props> = ({ 
  message = 'Uh oh! Something went wrong :(', 
  description = 'Please check your connection or/and try again later.',
}) => 
{
  return (
    <Alert 
      banner
      closable
      message={message}
      description={description}
      type='error'
      className='error-banner'
    />
  );
}