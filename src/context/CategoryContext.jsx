import React, { useContext, useState, createContext } from 'react';

const CategoryContext = createContext();

export const useCategory = () => {
  return useContext(CategoryContext);
};

export const CategoryProvider = ({ children }) => {
  const [categoryID, setCategoryID] = useState('');
  const [chatbotVisible, setChatbotVisible] = useState(false);

  return (
    <CategoryContext.Provider value={{ categoryID, setCategoryID, chatbotVisible, setChatbotVisible }}>
      {children}
    </CategoryContext.Provider>
  );
};