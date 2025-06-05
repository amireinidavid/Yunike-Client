"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useAuthStore, { User } from '@/store/useAuthStore';
import useAccountStore from '@/store/useAccountStore';

// Extended User type to include additional profile properties
interface ExtendedUser extends User {
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  dateOfBirth?: string;
}

// Form data interface
interface ProfileFormData {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  preferredLanguage: string;
  preferredCurrency: string;
}

// Sidebar navigation item props
interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
      active 
        ? "bg-primary/10 text-primary font-medium" 
        : "hover:bg-secondary/60"
    }`}
  >
    <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
    <span>{label}</span>
  </div>
);

const ProfilePage = () => {
  const router = useRouter();
  
  // Auth store
  const { user, isAuthenticated, updateProfile, createCustomerProfile, logout } = useAuthStore();
  
  // Account store
  const { 
    uploadProfileImage, 
    getAddresses, 
    addresses,
    getOrders,
    orders 
  } = useAccountStore();
  
  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [authChecked, setAuthChecked] = useState(false); // Add state to track if auth check completed
  
  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    preferredLanguage: 'en',
    preferredCurrency: 'USD'
  });
  
  // Check authentication status
  useEffect(() => {
    // Give the auth store a moment to initialize
    const checkAuth = setTimeout(() => {
      setAuthChecked(true);
    }, 500);
    
    return () => clearTimeout(checkAuth);
  }, []);
  
  // Populate form when user data is available
  useEffect(() => {
    if (user) {
      const extendedUser = user as ExtendedUser;
      setFormData({
        name: user.name || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: extendedUser.gender || '',
        dateOfBirth: extendedUser.dateOfBirth ? new Date(extendedUser.dateOfBirth).toISOString().split('T')[0] : '',
        preferredLanguage: user.preferredLanguage || 'en',
        preferredCurrency: user.preferredCurrency || 'USD'
      });
      
      if (user.profileImageUrl) {
        setImagePreview(user.profileImageUrl);
      }
    }
  }, [user]);
  
  // Load addresses and orders based on active section
  useEffect(() => {
    if (activeSection === 'addresses' && isAuthenticated) {
      getAddresses();
    } else if (activeSection === 'orders' && isAuthenticated) {
      getOrders();
    }
  }, [activeSection, isAuthenticated, getAddresses, getOrders]);
  
  // Redirect if not authenticated - prevent premature redirect
  useEffect(() => {
    if (authChecked && !isAuthenticated && typeof window !== 'undefined') {
      console.log('Not authenticated, redirecting to login page');
      router.push('/login');
    }
  }, [isAuthenticated, router, authChecked]);

  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle image selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setImagePreview(event.target.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle image upload
  const handleImageUpload = async () => {
    if (!imageFile) return;
    
    setLoading(true);
    try {
      const result = await uploadProfileImage(imageFile);
      if (result) {
        // Update the preview with the actual URL from server
        setImagePreview(result.profileImageUrl);
        setImageFile(null);
      }
    } catch (err) {
      console.error('Error uploading profile image:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First upload image if present
      if (imageFile) {
        await handleImageUpload();
      }
      
      // Then update profile
      if (user?.firstName && user?.lastName) {
        // Use standard profile update if basic fields exist
        await updateProfile(formData);
      } else {
        // Use customer profile creation if no firstName/lastName
        // Convert gender to enum type
        await createCustomerProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: formData.name,
          phone: formData.phone,
          gender: formData.gender as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | undefined,
          dateOfBirth: formData.dateOfBirth,
          preferredLanguage: formData.preferredLanguage,
          preferredCurrency: formData.preferredCurrency
        });
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
  return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
  
  // Cast user to extended type for additional properties
  const extendedUser = user as ExtendedUser;
  
  // Section renderers
  const renderOverviewSection = () => (
    <div className="space-y-6">
      {/* Account Details Card */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="bg-muted p-4 border-b">
          <h2 className="text-lg font-medium">ACCOUNT DETAILS</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-muted relative flex-shrink-0">
              {imagePreview ? (
                <Image 
                  src={imagePreview} 
                  alt="Profile" 
                  fill 
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground">
                  {user.firstName?.charAt(0) || user.name?.charAt(0) || user.email.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-medium">{user.firstName} {user.lastName}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              {user.phone && <p className="text-muted-foreground mt-1">{user.phone}</p>}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
          
          {isEditing && (
            <form onSubmit={handleSubmit} className="mt-6 border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full p-2 border rounded bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Profile Image</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      id="profile-image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="profile-image" 
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded cursor-pointer hover:bg-secondary/80"
                    >
                      Choose Image
                    </label>
                    {imageFile && (
                      <span className="text-sm text-muted-foreground">
                        Selected: {imageFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Address Book Card */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="bg-muted p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium">ADDRESS BOOK</h2>
          <button 
            onClick={() => setActiveSection('addresses')}
            className="text-sm text-primary hover:underline"
          >
            View All
          </button>
        </div>
        <div className="p-6">
          {addresses.length > 0 ? (
            <div>
              <h3 className="font-medium mb-2">Your default shipping address:</h3>
              {addresses.find(addr => addr.isDefault) ? (
                <div className="border rounded p-3">
                  <p className="font-medium">{addresses.find(addr => addr.isDefault)?.name || `${user.firstName || ''} ${user.lastName || ''}`}</p>
                  <p>{addresses.find(addr => addr.isDefault)?.street}</p>
                  <p>{addresses.find(addr => addr.isDefault)?.city}, {addresses.find(addr => addr.isDefault)?.state} {addresses.find(addr => addr.isDefault)?.postalCode}</p>
                  <p>{addresses.find(addr => addr.isDefault)?.country}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No default shipping address available.</p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground mb-4">No default shipping address available.</p>
              <button
                onClick={() => router.push('/profile/address/add')}
                className="text-primary hover:underline"
              >
                Add default address
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Store Credit Card */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="bg-muted p-4 border-b">
          <h2 className="text-lg font-medium">STORE CREDIT</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <circle cx="12" cy="12" r="8"/>
              <path d="M14 12h-4v-4"/>
              <path d="M12 12v6"/>
            </svg>
            <div>
              <p className="font-medium">Store credit balance:</p>
              <p className="text-xl font-bold">$0.00</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Newsletter Card */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="bg-muted p-4 border-b">
          <h2 className="text-lg font-medium">NEWSLETTER PREFERENCES</h2>
        </div>
        <div className="p-6">
          <p className="mb-4">Manage your email communications to stay updated with the latest news and offers.</p>
          <button
            className="text-primary hover:underline"
          >
            Edit Newsletter preferences
          </button>
        </div>
      </div>
    </div>
  );

  const renderAddressesSection = () => (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="bg-muted p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium">ADDRESS BOOK</h2>
        <button 
          onClick={() => router.push('/profile/address/add')}
          className="px-4 py-1.5 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
        >
          Add New Address
        </button>
      </div>
      <div className="p-6">
        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div key={address.id} className="border rounded-md p-4 relative">
                {address.isDefault && (
                  <span className="absolute top-2 right-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
                <p className="font-medium">
                  {address.name || `${user.firstName || ''} ${user.lastName || ''}`}
                </p>
                <p className="text-sm mt-1">
                  {address.street}
                  {address.apartment && `, ${address.apartment}`}
                </p>
                <p className="text-sm">
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="text-sm">{address.country}</p>
                {address.phoneNumber && <p className="text-sm mt-1">📞 {address.phoneNumber}</p>}
                
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => router.push(`/profile/address/edit/${address.id}`)}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button 
                    onClick={() => router.push(`/profile/address/delete/${address.id}`)}
                    className="text-sm text-destructive hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You haven't added any addresses yet.</p>
            <button
              onClick={() => router.push('/profile/address/add')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Add Your First Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
  
  const renderOrdersSection = () => (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="bg-muted p-4 border-b">
        <h2 className="text-lg font-medium">ORDER HISTORY</h2>
      </div>
      <div className="p-6">
        {orders.items.length > 0 ? (
          <div className="space-y-6">
            {orders.items.map((order) => (
              <div key={order.id} className="border rounded-lg overflow-hidden">
                <div className="bg-muted p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">Order #{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium
                      ${order.status === 'DELIVERED' ? 'bg-accent/20 text-accent-foreground' :
                        order.status === 'SHIPPED' ? 'bg-primary/20 text-primary-foreground' :
                        order.status === 'PROCESSING' ? 'bg-secondary/40 text-secondary-foreground' :
                        'bg-muted text-muted-foreground'}
                    `}>
                      {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-md overflow-hidden relative">
                          {item.product.images?.[0]?.url ? (
                            <Image 
                              src={item.product.images[0].url} 
                              alt={item.product.name}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              No img
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <div className="text-sm text-muted-foreground">
                            {item.quantity} × ${item.unitPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-muted-foreground">
                        + {order.items.length - 2} more items
                      </p>
                    )}
                  </div>
                  
                  <div className="border-t pt-4 flex justify-between items-center">
                    <div className="text-muted-foreground">
                      Total: <span className="font-medium text-foreground">${order.totalAmount.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => router.push(`/profile/orders/${order.id}`)}
                      className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm rounded hover:bg-secondary/80"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {orders.pagination.pageCount > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: orders.pagination.pageCount }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => getOrders(index + 1)}
                    className={`w-8 h-8 rounded ${
                      orders.pagination.page === index + 1
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
            <button
              onClick={() => router.push('/products')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
  
  const renderWishlistSection = () => (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="bg-muted p-4 border-b">
        <h2 className="text-lg font-medium">WISHLIST</h2>
      </div>
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Your wishlist is currently empty.</p>
          <button
            onClick={() => router.push('/products')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Browse Products
          </button>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-card border rounded-lg shadow-sm p-4 h-fit">
          <SidebarItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>}
            label="My Account"
            active={activeSection === 'overview'}
            onClick={() => setActiveSection('overview')}
          />
          <SidebarItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>}
            label="Orders"
            active={activeSection === 'orders'}
            onClick={() => setActiveSection('orders')}
          />
          <SidebarItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
            label="Inbox"
            active={activeSection === 'inbox'}
            onClick={() => setActiveSection('inbox')}
          />
          <SidebarItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>}
            label="Wishlist"
            active={activeSection === 'wishlist'}
            onClick={() => setActiveSection('wishlist')}
          />
          <SidebarItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16"/><circle cx="12" cy="8" r="2"/></svg>}
            label="Addresses"
            active={activeSection === 'addresses'}
            onClick={() => setActiveSection('addresses')}
          />
          <SidebarItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c0-1.7-1.3-3-3-3H8C6.3 2 5 3.3 5 5"/><path d="M5 5v14c0 1.7 1.3 3 3 3h8c1.7 0 3-1.3 3-3V5"/><path d="M9 14h6"/></svg>}
            label="Vouchers"
            active={activeSection === 'vouchers'}
            onClick={() => setActiveSection('vouchers')}
          />
          
          <div className="my-4 border-t pt-4">
            <h3 className="text-sm font-medium px-3 mb-2 text-muted-foreground">SETTINGS</h3>
            <SidebarItem
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>}
              label="Account Settings"
              active={false}
              onClick={() => setActiveSection('settings')}
            />
            <SidebarItem
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>}
              label="Payment Methods"
              active={false}
              onClick={() => setActiveSection('payments')}
            />
            <SidebarItem
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              label="Followed Sellers"
              active={false}
              onClick={() => setActiveSection('followed')}
            />
          </div>
          
          <button 
            className="w-full mt-4 px-3 py-2 text-center border border-destructive text-destructive rounded-md hover:bg-destructive/5"
            onClick={() => window.confirm('Are you sure you want to log out?') && logout()}
          >
            Sign Out
          </button>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-3">
          <h1 className="text-2xl font-bold mb-6">Account Overview</h1>
          
          {activeSection === 'overview' && renderOverviewSection()}
          {activeSection === 'addresses' && renderAddressesSection()}
          {activeSection === 'orders' && renderOrdersSection()}
          {activeSection === 'wishlist' && renderWishlistSection()}
          {activeSection === 'inbox' && (
            <div className="bg-card rounded-lg border shadow-sm p-6 text-center">
              <p className="text-muted-foreground mb-4">Your inbox is currently empty.</p>
            </div>
          )}
          {activeSection === 'vouchers' && (
            <div className="bg-card rounded-lg border shadow-sm p-6 text-center">
              <p className="text-muted-foreground mb-4">You have no vouchers at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
