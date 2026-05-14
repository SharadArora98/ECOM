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

interface SellerListing {
  _id: string;
  seller: { _id: string; name: string; email: string };
  price: number;
  stock: number;
  isAvailable: boolean;
}

const ViewProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null); // Stores listingId of processing payment
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProductAndListings = async () => {
      try {
        const [productRes, listingsRes] = await Promise.all([
          API.get(`/product/${id}`, { signal: controller.signal }),
          API.get(`/product/${id}/listings`, { signal: controller.signal })
        ]);
        setProduct(productRes.data.product);
        setListings(listingsRes.data.listings);
      } catch (err: any) {
        if (err.name !== 'CanceledError') {
          console.error('Failed to fetch details', err);
          setError('Product not found or error loading details.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductAndListings();
    }

    return () => controller.abort();
  }, [id]);

  const handleBuyNow = async (listingId: string) => {
    setPaymentLoading(listingId);
    try {
      const response = await API.post('/payment/create-checkout-session', {
        items: [{ listingId, quantity: 1 }]
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      console.error('Payment Error:', err);
      alert(err.response?.data?.message || 'Error initiating payment. Please try again.');
    } finally {
      setPaymentLoading(null);
    }
  };

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
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem' }}>
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
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1rem' }}>
              Base Price: ${product.base_price}
            </div>
            <button className="btn btn-outline" style={{ width: '100%', padding: '1rem' }} onClick={() => navigate('/')}>Back to Catalog</button>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Available from Sellers</h2>
          {listings.length === 0 ? (
            <p>No seller listings available for this product.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {listings.map((listing) => (
                <div key={listing._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{listing.seller.name}</h3>
                    <p style={{ margin: '0.5rem 0', color: 'var(--text-muted)' }}>Stock: {listing.stock}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                      ${listing.price}
                    </div>
                    {listing.stock > 0 ? (
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleBuyNow(listing._id)}
                        disabled={!!paymentLoading}
                      >
                        {paymentLoading === listing._id ? 'Processing...' : 'Buy Now'}
                      </button>
                    ) : (
                      <button className="btn btn-primary" disabled style={{ opacity: 0.5 }}>Out of Stock</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;
