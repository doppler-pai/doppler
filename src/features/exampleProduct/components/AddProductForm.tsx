'use client';

import { useState } from 'react';
import { addProduct } from '../services/addProduct';

export const AddProductForm = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await addProduct({ name, price: Number(price) });
    // Dodajemy dane client componentem

    if (result.success) {
      setName('');
      setPrice('');
      alert(`Product added with ID: ${result.id}`);
      window.location.reload(); // simple refresh to show new product
    } else {
      alert('Failed to add product: ' + result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
      <input
        type="text"
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="border rounded p-2"
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
        className="border rounded p-2"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 rounded">
        Add Product
      </button>
    </form>
  );
};
