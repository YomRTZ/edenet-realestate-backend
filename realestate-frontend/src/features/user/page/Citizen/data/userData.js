export const userData = {
  name: "Alex Morgan",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
  email: "alex.morgan@example.com",
  location: "Brooklyn, NY",
  memberSince: "2022",
  totalProperties: 4,
  totalValue: "$1.2M"
};

export const propertiesData = {
  owned: [
    {
      id: 1,
      title: "Sunset Heights Villa",
      location: "Austin, Texas",
      price: "$450,000",
      beds: 4,
      baths: 3,
      sqft: 2450,
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",
      purchaseDate: "Mar 2023",
      type: "Single Family Home"
    },
    {
      id: 2,
      title: "Downtown Loft",
      location: "Portland, Oregon",
      price: "$325,000",
      beds: 2,
      baths: 2,
      sqft: 1450,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
      purchaseDate: "Nov 2023",
      type: "Apartment"
    }
  ],
  rented: [
    {
      id: 3,
      title: "Harbor View Apartments",
      location: "Seattle, Washington",
      rent: "$2,200/month",
      beds: 2,
      baths: 2,
      sqft: 1100,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
      leaseStart: "Jan 2024",
      leaseEnd: "Dec 2024",
      landlord: "Pacific Properties"
    },
    {
      id: 4,
      title: "Greenwich Village Studio",
      location: "New York, NY",
      rent: "$2,800/month",
      beds: 1,
      baths: 1,
      sqft: 650,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
      leaseStart: "Sep 2023",
      leaseEnd: "Aug 2024",
      landlord: "Metro Realty Group"
    }
  ],
  listed: [
    {
      id: 5,
      title: "Modern Oasis Condo",
      location: "Miami, Florida",
      price: "$589,000",
      beds: 3,
      baths: 2,
      sqft: 1950,
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
      listedDate: "2 days ago",
      views: 342,
      likes: 28,
      status: "Active"
    },
    {
      id: 6,
      title: "Mountain Retreat Cabin",
      location: "Aspen, Colorado",
      price: "$725,000",
      beds: 3,
      baths: 3,
      sqft: 2100,
      image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=400&fit=crop",
      listedDate: "1 week ago",
      views: 512,
      likes: 45,
      status: "Hot Listing"
    }
  ]
};

export const tabs = [
  { id: 'owned', label: 'Properties Owned', icon: 'Home', color: 'from-blue-500 to-blue-600' },
  { id: 'rented', label: 'Properties Rented', icon: 'Key', color: 'from-emerald-500 to-emerald-600' },
  { id: 'listed', label: 'For Sale / Rent', icon: 'DollarSign', color: 'from-purple-500 to-purple-600' }
];