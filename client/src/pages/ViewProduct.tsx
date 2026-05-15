import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Offering form state
  const [showOfferingForm, setShowOfferingForm] = useState(false);
  const [offeringData, setOfferingData] = useState({ price: '', stock: '' });
  const [offeringLoading, setOfferingLoading] = useState(false);

  const fetchProductAndListings = async () => {
    try {
      const [productRes, listingsRes] = await Promise.all([
        API.get(`/product/${id}`),
        API.get(`/product/${id}/listings`)
      ]);
      setProduct(productRes.data.product);
      setListings(listingsRes.data.listings);
    } catch (err: any) {
      console.error('Failed to fetch details', err);
      setError('Product not found or error loading details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductAndListings();
    }
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
      alert(err.response?.data?.message || 'Error initiating payment.');
    } finally {
      setPaymentLoading(null);
    }
  };

  const handleAddOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfferingLoading(true);
    try {
      await API.post('/product/add-offering', {
        productId: id,
        price: Number(offeringData.price),
        stock: Number(offeringData.stock)
      });
      alert('Your offering has been added!');
      setShowOfferingForm(false);
      fetchProductAndListings(); // Refresh listings
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add offering.');
    } finally {
      setOfferingLoading(false);
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>Loading...</div>;
  if (error || !product) return <div className="container" style={{ textAlign: 'center', padding: '5rem' }}><p>{error || 'Product not found'}</p></div>;

  const isSellerListingThis = listings.some(l => l.seller._id === user?.userId);

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
            
            {user?.role === 'seller' && !isSellerListingThis && !showOfferingForm && (
              <div style={{ backgroundColor: '#f0f4ff', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #c3dafe' }}>
                <h3 style={{ margin: 0, color: '#2c5282' }}>Have this item to sell?</h3>
                <p style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.9rem' }}>List your own stock and price for this product.</p>
                <button className="btn btn-primary" onClick={() => setShowOfferingForm(true)}>Sell Yours</button>
              </div>
            )}

            {showOfferingForm && (
              <form onSubmit={handleAddOffering} style={{ backgroundColor: '#f7fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>Add Your Offering</h3>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Price ($)</label>
                    <input 
                      type="number" 
                      className="input" 
                      value={offeringData.price} 
                      onChange={e => setOfferingData({...offeringData, price: e.target.value})} 
                      required 
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Stock</label>
                    <input 
                      type="number" 
                      className="input" 
                      value={offeringData.stock} 
                      onChange={e => setOfferingData({...offeringData, stock: e.target.value})} 
                      required 
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={offeringLoading}>
                    {offeringLoading ? 'Saving...' : 'Confirm Listing'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowOfferingForm(false)}>Cancel</button>
                </div>
              </form>
            )}

            {isSellerListingThis && (
              <div style={{ backgroundColor: '#f0fff4', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #c6f6d5', color: '#276749', fontWeight: 600 }}>
                ✓ You already have an active listing for this product.
              </div>
            )}

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
                <div key={listing._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: listing.seller._id === user?.userId ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{listing.seller.name} {listing.seller._id === user?.userId && <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>YOU</span>}</h3>
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
                        disabled={!!paymentLoading || listing.seller._id === user?.userId}
                      >
                        {paymentLoading === listing._id ? 'Processing...' : (listing.seller._id === user?.userId ? 'Your Listing' : 'Buy Now')}
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
