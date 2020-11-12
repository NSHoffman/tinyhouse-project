import React from 'react';
import { Skeleton } from 'antd';

export const PageSkeleton: React.FC = () =>
{
  const skeletonParagraph = (
    <Skeleton className='page-skeleton__paragraph' active paragraph={{ rows: 4 }} />
  );

  return (
    <>
      { skeletonParagraph }
      { skeletonParagraph }
      { skeletonParagraph }
    </>
  );
};
