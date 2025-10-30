import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface ReviewFiltersProps {
  onSearch?: (query: string) => void;
  onUserSearch?: (userQuery: string) => void;
}

const ReviewFilters = ({ onSearch, onUserSearch }: ReviewFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userQuery, setUserQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleUserSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setUserQuery(query);
    onUserSearch?.(query);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setUserQuery('');
    onSearch?.('');
    onUserSearch?.('');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Tìm kiếm đánh giá
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Order Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm theo đơn hàng
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Nhập mã đơn hàng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
        </div>

        {/* User Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm theo tên người dùng
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={userQuery}
              onChange={handleUserSearchChange}
              placeholder="Nhập tên người dùng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      <div className="flex justify-end mt-4">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
};

export default ReviewFilters;
