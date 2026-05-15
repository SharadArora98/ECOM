import React, { useEffect, useState } from 'react';
import API from '../api/axiosConfig';

interface Listing {
  _id: string;
  product: { name: string; category: string };
  price: number;
  stock: number;
}

interface Order {
  _id: string;
  product: { name: string };
  user: { username: string; email: string };
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const SellerDashboard: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'orders'>('listings');
  
  // Edit state
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ price: 0, stock: 0 });
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [listingsRes, ordersRes] = await Promise.all([
        API.get('/seller/listings'),
        API.get('/seller/orders')
      ]);
      setListings(listingsRes.data.listings);
      setOrders(ordersRes.data.orders);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (listing: Listing) => {
    setEditingListingId(listing._id);
    setEditFormData({ price: listing.price, stock: listing.stock });
  };

  const handleUpdateCancel = () => {
    setEditingListingId(null);
  };

  const handleUpdateSubmit = async (id: string) => {
    setUpdateLoading(true);
    try {
      await API.put(`/seller/listings/${id}`, editFormData);
      setEditingListingId(null);
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Error updating listing", err);
      alert("Failed to update listing");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return <div className="container">Loading Dashboard...</div>;

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <h1>Seller Dashboard</h1>
      
      <div style={{ display: 'flex', gap: '1rem', margin: '2rem 0', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
        <button 
          className={`btn ${activeTab === 'listings' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('listings')}
        >
          My Listings ({listings.length})
        </button>
        <button 
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('orders')}
        >
          Recent Orders ({orders.length})
        </button>
      </div>

      {activeTab === 'listings' ? (
        <div className="card">
          <h2>Product Listings</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '1rem' }}>Product</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Price</th>
                <th style={{ padding: '1rem' }}>Stock</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(listing => (
                <tr key={listing._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>{listing.product.name}</td>
                  <td style={{ padding: '1rem' }}>{listing.product.category}</td>
                  <td style={{ padding: '1rem' }}>
                    {editingListingId === listing._id ? (
                      <input 
                        type="number" 
                        className="input" 
                        style={{ width: '80px', padding: '0.25rem' }}
                        value={editFormData.price}
                        onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                      />
                    ) : (
                      `$${listing.price}`
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {editingListingId === listing._id ? (
                      <input 
                        type="number" 
                        className="input" 
                        style={{ width: '80px', padding: '0.25rem' }}
                        value={editFormData.stock}
                        onChange={(e) => setEditFormData({ ...editFormData, stock: Number(e.target.value) })}
                      />
                    ) : (
                      listing.stock
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {editingListingId === listing._id ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          onClick={() => handleUpdateSubmit(listing._id)}
                          disabled={updateLoading}
                        >
                          Save
                        </button>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          onClick={handleUpdateCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        onClick={() => handleEditClick(listing)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <h2>Order History</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '1rem' }}>Order ID</th>
                <th style={{ padding: '1rem' }}>Product</th>
                <th style={{ padding: '1rem' }}>Customer</th>
                <th style={{ padding: '1rem' }}>Qty</th>
                <th style={{ padding: '1rem' }}>Total</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem', fontSize: '0.8rem' }}>{order._id}</td>
                  <td style={{ padding: '1rem' }}>{order.product.name}</td>
                  <td style={{ padding: '1rem' }}>
                    {order.user.username}<br/>
                    <small style={{ color: '#666' }}>{order.user.email}</small>
                  </td>
                  <td style={{ padding: '1rem' }}>{order.quantity}</td>
                  <td style={{ padding: '1rem' }}>${order.totalAmount}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      backgroundColor: order.status === 'paid' ? '#e6fffa' : '#fff5f5',
                      color: order.status === 'paid' ? '#2c7a7b' : '#c53030',
                      fontSize: '0.8rem'
                    }}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
