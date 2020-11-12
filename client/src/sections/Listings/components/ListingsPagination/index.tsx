import React from 'react';
import { Pagination } from 'antd';

interface Props {
  total: number;
  page: number;
  limit: number;
  setPage(p: number): void;
}

export const ListingsPagination: React.FC<Props> = ({ total, page, limit, setPage }) => 
{

  return (
    <Pagination
      className="listings-pagination"
      current={page}
      total={total}
      defaultPageSize={limit}
      hideOnSinglePage
      showLessItems
      onChange={(page: number) => setPage(page)}
    />
  );
};
