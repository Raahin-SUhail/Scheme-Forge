import React from 'react';
import CategoriesComponent from '../components/Categories';

const CategoriesPage = ({ onSelectCategory = () => {} }) => {
  return (
    <div className="min-h-screen bg-white pt-10">
      <CategoriesComponent onSelectCategory={onSelectCategory} />
    </div>
  );
};

export default CategoriesPage;
