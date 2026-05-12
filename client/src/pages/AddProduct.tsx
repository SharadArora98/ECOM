import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';

const AddProduct: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    category: ''
  });
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('base_price', formData.base_price);
    data.append('category', formData.category);
    
    if (images) {
      Array.from(images).forEach((file) => {
        data.append('images', file);
      });
    }

    try {
      const response = await API.post('/product/add', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ type: 'success', message: response.data.message });
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to add product' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="form-title" style={{ textAlign: 'left' }}>List New Product</h2>
        <p className="form-subtitle" style={{ textAlign: 'left', marginBottom: '2.5rem' }}>Fill in the details below to list your item in the marketplace</p>
        
        {status && (
          <div className={`alert alert-${status.type}`}>
            {status.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="form-group">
              <label className="label">Product Name</label>
              <input 
                name="name" 
                className="input"
                placeholder="e.g. Wireless Noise Cancelling Headphones"
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="form-group">
              <label className="label">Description</label>
              <textarea 
                name="description" 
                className="input"
                placeholder="Provide a detailed description of your product..."
                value={formData.description} 
                onChange={handleChange} 
                required 
                rows={5} 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="label">Base Price ($)</label>
            <input 
              name="base_price" 
              type="number" 
              className="input"
              placeholder="0.00"
              value={formData.base_price} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="label">Category</label>
            <input 
              name="category" 
              className="input"
              placeholder="e.g. Electronics, Fashion, Home"
              value={formData.category} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="form-group">
              <label className="label">Product Images</label>
              <div style={{ border: '2px dashed var(--border)', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  id="file-upload"
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>
                  Click to upload images
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {images ? `${images.length} files selected` : 'Max 5 images. PNG, JPG up to 5MB.'}
                </p>
              </div>
            </div>
          </div>
          
          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '200px' }}>
              {loading ? <div className="loading-spinner"></div> : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
