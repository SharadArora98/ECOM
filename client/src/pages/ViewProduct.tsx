import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';

interface Product {
  _id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  images: { url: string; publicId: string }[];
}

const ViewProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        const response = await API.get(`/product/${id}`, { signal: controller.signal });
        setProduct(response.data.product);
      } catch (err: any) {
        if (err.name !== 'CanceledError') {
          console.error('Failed to fetch product details', err);
          setError('Product not found or error loading details.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }

    return () => controller.abort();
  }, [id]);

  if (loading) return (
    <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
      <div className="loading-spinner"></div>
      <p>Loading product details...</p>
    </div>
  );

  if (error || !product) return (
    <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
      <p style={{ color: 'red' }}>{error || 'Product not found'}</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Products</button>
    </div>
  );

  return (
    <div className="container">
      <div className="card" style={{ display: 'flex', flexDirection: 'row', gap: '2rem', padding: '2rem', marginTop: '2rem' }}>
        <div style={{ flex: 1 }}>
          <img 
            src={product.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'} 
            alt={product.name} 
            style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }} 
          />
        </div>
        <div style={{ flex: 1 }}>
          <span className="product-badge">{product.category}</span>
          <h1 style={{ marginTop: '1rem', fontSize: '2.5rem' }}>{product.name}</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', margin: '1.5rem 0' }}>{product.description}</p>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '2rem' }}>
            ${product.base_price}
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Buy Now</button>
          <button className="btn btn-outline" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }} onClick={() => navigate('/')}>Back to Catalog</button>
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;
