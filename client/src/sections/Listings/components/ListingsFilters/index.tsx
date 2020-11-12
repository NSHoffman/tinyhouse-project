import React from 'react';
import { Select } from 'antd';
import { ListingsFilter } from '../../../../lib/graphql/globalTypes';

interface Props {
  filter: ListingsFilter;
  setFilter(f: ListingsFilter): void;
}

const { Option } = Select;

export const ListingsFilters: React.FC<Props> = ({ filter, setFilter }) => 
{ 
  return (
    <div className="listings-filters">
      <span>Filter By</span>
      <Select value={filter} onChange={(f: ListingsFilter) => setFilter(f)}>
        <Option value={ ListingsFilter.PRICE_LOW_TO_HIGH }>
          Price: Low to High
        </Option>
        <Option value={ ListingsFilter.PRICE_HIGH_TO_LOW }>
          Price: High to Low
        </Option>
      </Select>
    </div>
  );
};