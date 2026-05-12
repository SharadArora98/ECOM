import React, { useEffect, useState } from 'react';
import API from '../api/axiosConfig';

interface Product {
  _id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  images: { url: string; publicId: string }[];
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        const response = await API.get('/product', { signal: controller.signal });
        setProducts(response.data.products);
      } catch (err: any) {
        if (err.name !== 'CanceledError') {
          console.error('Failed to fetch products', err);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();

    return () => controller.abort();
  }, []);

  if (loading) return (
    <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
      <div className="loading-spinner" style={{ borderTopColor: 'var(--primary)', width: '40px', height: '40px', margin: '0 auto' }}></div>
      <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Discovering products...</p>
    </div>
  );

  return (
    <div className="container">
      <div className="section-header">
        <h2 className="section-title">Latest Products</h2>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Showing {products.length} items</span>
      </div>
      
      {products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>No products found. Be the first to sell!</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-img-wrapper">
                <img 
                  src={product.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'} 
                  alt={product.name} 
                  className="product-img" 
                />
                <span className="product-badge">{product.category}</span>
              </div>
              <div className="product-body">
                <span className="product-cat">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {product.description}
                </p>
                <div className="product-footer">
                  <span className="product-price">${product.base_price}</span>
                  <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8125rem' }}>View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
