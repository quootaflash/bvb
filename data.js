// Data dummy produk makanan
const products = [
    {
        id: 1,
        name: "Nasi Gudeg Jogja",
        price: 25000,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
        description: "Nasi gudeg khas Jogja dengan ayam kampung, telur, dan sambal krecek yang gurih dan manis",
        category: "Makanan Utama",
        rating: 4.8,
        cookingTime: "15-20 menit"
    },
    {
        id: 2,
        name: "Ayam Bakar Taliwang",
        price: 35000,
        image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop",
        description: "Ayam bakar khas Lombok dengan bumbu pedas dan plecing kangkung segar",
        category: "Makanan Utama",
        rating: 4.7,
        cookingTime: "20-25 menit"
    },
    {
        id: 3,
        name: "Soto Betawi",
        price: 28000,
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop",
        description: "Soto khas Betawi dengan kuah santan, daging sapi, dan jeroan yang lezat",
        category: "Makanan Berkuah",
        rating: 4.6,
        cookingTime: "10-15 menit"
    },
    {
        id: 4,
        name: "Gado-Gado Jakarta",
        price: 20000,
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop",
        description: "Gado-gado dengan sayuran segar, lontong, dan bumbu kacang yang kental",
        category: "Makanan Sehat",
        rating: 4.5,
        cookingTime: "5-10 menit"
    },
    {
        id: 5,
        name: "Rendang Padang",
        price: 40000,
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop",
        description: "Rendang daging sapi khas Padang dengan bumbu rempah yang kaya dan pedas",
        category: "Makanan Utama",
        rating: 4.9,
        cookingTime: "15-20 menit"
    },
    {
        id: 6,
        name: "Mie Ayam Bakso",
        price: 18000,
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
        description: "Mie ayam dengan bakso sapi, pangsit, dan kuah kaldu yang gurih",
        category: "Makanan Berkuah",
        rating: 4.4,
        cookingTime: "10-15 menit"
    },
    {
        id: 7,
        name: "Nasi Liwet Solo",
        price: 22000,
        image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop",
        description: "Nasi liwet khas Solo dengan ayam suwir, telur, dan sambal terasi",
        category: "Makanan Utama",
        rating: 4.6,
        cookingTime: "15-20 menit"
    },
    {
        id: 8,
        name: "Es Cendol Dawet",
        price: 12000,
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
        description: "Minuman segar es cendol dengan santan dan gula merah yang manis",
        category: "Minuman",
        rating: 4.3,
        cookingTime: "5 menit"
    },
    {
        id: 9,
        name: "Teh Tarik Aceh",
        price: 8000,
        image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop",
        description: "Teh tarik khas Aceh yang creamy dan hangat, cocok untuk segala cuaca",
        category: "Minuman",
        rating: 4.2,
        cookingTime: "3-5 menit"
    }
];

// Fungsi untuk format rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}

