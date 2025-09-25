// Supabase Configuration
// IMPORTANT: Replace these with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase anon key

// Initialize Supabase client
let supabase = null;

// Initialize Supabase connection
function initializeSupabase() {
    try {
        if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
            console.warn('Supabase credentials not configured. Using local data only.');
            return false;
        }
        
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Supabase:', error);
        return false;
    }
}

// Database Operations
class DatabaseService {
    constructor() {
        this.isConnected = initializeSupabase();
    }

    // Fetch products from database
    async fetchProducts() {
        if (!this.isConnected || !supabase) {
            console.log('Using local product data');
            return { data: products, error: null };
        }

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                console.error('Error fetching products:', error);
                return { data: products, error }; // Fallback to local data
            }

            return { data: data || products, error: null };
        } catch (error) {
            console.error('Error in fetchProducts:', error);
            return { data: products, error }; // Fallback to local data
        }
    }

    // Insert new order to database
    async insertOrder(orderData) {
        if (!this.isConnected || !supabase) {
            console.log('Supabase not connected. Order saved locally:', orderData);
            // In a real app, you might want to store in localStorage for offline support
            localStorage.setItem(`order_${Date.now()}`, JSON.stringify(orderData));
            return { data: orderData, error: null };
        }

        try {
            const { data, error } = await supabase
                .from('orders')
                .insert([{
                    customer_name: orderData.customerName,
                    customer_phone: orderData.customerPhone,
                    customer_address: orderData.customerAddress,
                    order_notes: orderData.orderNotes,
                    items: JSON.stringify(orderData.items),
                    total_amount: orderData.total,
                    order_date: orderData.orderDate,
                    status: orderData.status,
                    payment_method: orderData.paymentMethod
                }])
                .select();

            if (error) {
                console.error('Error inserting order:', error);
                throw error;
            }

            console.log('Order inserted successfully:', data);
            return { data: data[0], error: null };
        } catch (error) {
            console.error('Error in insertOrder:', error);
            return { data: null, error };
        }
    }

    // Fetch orders (for admin purposes)
    async fetchOrders() {
        if (!this.isConnected || !supabase) {
            console.log('Supabase not connected. Cannot fetch orders.');
            return { data: [], error: 'Not connected to database' };
        }

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching orders:', error);
                return { data: [], error };
            }

            return { data: data || [], error: null };
        } catch (error) {
            console.error('Error in fetchOrders:', error);
            return { data: [], error };
        }
    }

    // Update order status
    async updateOrderStatus(orderId, status) {
        if (!this.isConnected || !supabase) {
            console.log('Supabase not connected. Cannot update order status.');
            return { data: null, error: 'Not connected to database' };
        }

        try {
            const { data, error } = await supabase
                .from('orders')
                .update({ status: status })
                .eq('id', orderId)
                .select();

            if (error) {
                console.error('Error updating order status:', error);
                return { data: null, error };
            }

            console.log('Order status updated successfully:', data);
            return { data: data[0], error: null };
        } catch (error) {
            console.error('Error in updateOrderStatus:', error);
            return { data: null, error };
        }
    }

    // Initialize database tables (run once)
    async initializeTables() {
        if (!this.isConnected || !supabase) {
            console.log('Supabase not connected. Cannot initialize tables.');
            return false;
        }

        try {
            // Insert sample products if products table is empty
            const { data: existingProducts } = await supabase
                .from('products')
                .select('id')
                .limit(1);

            if (!existingProducts || existingProducts.length === 0) {
                console.log('Inserting sample products...');
                const { error } = await supabase
                    .from('products')
                    .insert(products.map(product => ({
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        description: product.description,
                        category: product.category,
                        rating: product.rating,
                        cooking_time: product.cookingTime
                    })));

                if (error) {
                    console.error('Error inserting sample products:', error);
                } else {
                    console.log('Sample products inserted successfully');
                }
            }

            return true;
        } catch (error) {
            console.error('Error initializing tables:', error);
            return false;
        }
    }
}

// Create global database service instance
const dbService = new DatabaseService();

// SQL Scripts for Supabase Setup (copy these to your Supabase SQL editor)
const SQL_SCRIPTS = `
-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    image TEXT,
    description TEXT,
    category VARCHAR(100),
    rating DECIMAL(2,1),
    cooking_time VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    order_notes TEXT,
    items JSONB NOT NULL,
    total_amount INTEGER NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'COD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for products (allow read for everyone)
CREATE POLICY "Allow read access to products" ON products
    FOR SELECT USING (true);

-- Create policies for orders (allow insert for everyone, but restrict read/update)
CREATE POLICY "Allow insert access to orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Optional: Allow users to read their own orders (if you implement user authentication)
-- CREATE POLICY "Allow users to read own orders" ON orders
--     FOR SELECT USING (auth.uid() = user_id);
`;

console.log('Supabase SQL Scripts:', SQL_SCRIPTS);

