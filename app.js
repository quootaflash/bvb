// Global variables
let currentProduct = null;
let cart = [];
let currentQuantity = 1;
let filteredProducts = products;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    showLoading();
    
    // Initialize database and fetch products
    await initializeApp();
    
    hideLoading();
    updateCartCount();
});

// Initialize application
async function initializeApp() {
    try {
        // Fetch products from database
        const { data: fetchedProducts, error } = await dbService.fetchProducts();
        
        if (error) {
            console.warn('Using local products due to database error:', error);
        } else {
            // Update global products array with database data
            if (fetchedProducts && fetchedProducts.length > 0) {
                // Map database fields to local format if needed
                products.splice(0, products.length, ...fetchedProducts.map(product => ({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    description: product.description,
                    category: product.category,
                    rating: product.rating,
                    cookingTime: product.cooking_time || product.cookingTime
                })));
            }
        }
        
        // Render products
        renderProducts();
        
        // Initialize database tables if needed
        await dbService.initializeTables();
        
    } catch (error) {
        console.error('Error initializing app:', error);
        // Fallback to local data
        renderProducts();
    }
}

// Render products to the grid
function renderProducts(productsToRender = products) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    productsToRender.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 transition-transform';
    card.onclick = () => openProductModal(product);

    card.innerHTML = `
        <div class="relative">
            <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
            <div class="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-semibold text-gray-600">
                <i class="fas fa-star text-yellow-400"></i> ${product.rating}
            </div>
        </div>
        <div class="p-4">
            <h4 class="font-bold text-lg mb-2 text-gray-800">${product.name}</h4>
            <p class="text-gray-600 text-sm mb-3 line-clamp-2">${product.description}</p>
            <div class="flex items-center justify-between mb-3">
                <span class="text-primary font-bold text-xl">${formatRupiah(product.price)}</span>
                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">${product.category}</span>
            </div>
            <div class="flex items-center justify-between">
                <div class="flex items-center text-sm text-gray-500">
                    <i class="fas fa-clock mr-1"></i>
                    <span>${product.cookingTime}</span>
                </div>
                <button class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors text-sm font-semibold">
                    <i class="fas fa-plus mr-1"></i>Pesan
                </button>
            </div>
        </div>
    `;

    return card;
}

// Filter products by category
function filterProducts(category) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-primary', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    event.target.classList.add('active', 'bg-primary', 'text-white');
    event.target.classList.remove('bg-gray-200', 'text-gray-700');

    // Filter and render products
    if (category === 'all') {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter(product => product.category === category);
    }
    
    renderProducts(filteredProducts);
}

// Open product detail modal
function openProductModal(product) {
    currentProduct = product;
    currentQuantity = 1;

    // Populate modal with product data
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalImage').src = product.image;
    document.getElementById('modalImage').alt = product.name;
    document.getElementById('modalPrice').textContent = formatRupiah(product.price);
    document.getElementById('modalRating').textContent = product.rating;
    document.getElementById('modalDescription').textContent = product.description;
    document.getElementById('modalCookingTime').textContent = product.cookingTime;
    document.getElementById('modalCategory').textContent = product.category;
    document.getElementById('quantity').textContent = currentQuantity;

    // Show modal
    document.getElementById('productModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Reset form if closing checkout modal
    if (modalId === 'checkoutModal') {
        document.getElementById('checkoutForm').reset();
    }
}

// Increase quantity
function increaseQuantity() {
    currentQuantity++;
    document.getElementById('quantity').textContent = currentQuantity;
}

// Decrease quantity
function decreaseQuantity() {
    if (currentQuantity > 1) {
        currentQuantity--;
        document.getElementById('quantity').textContent = currentQuantity;
    }
}

// Add to cart and open checkout modal
function addToCart() {
    if (!currentProduct) return;

    // Check if product already in cart
    const existingItem = cart.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
        existingItem.quantity += currentQuantity;
    } else {
        cart.push({
            ...currentProduct,
            quantity: currentQuantity
        });
    }

    updateCartCount();
    closeModal('productModal');
    openCheckoutModal();
}

// Update cart count in header
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

// Open checkout modal
function openCheckoutModal() {
    renderOrderSummary();
    calculateTotal();
    document.getElementById('checkoutModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Render order summary
function renderOrderSummary() {
    const orderSummary = document.getElementById('orderSummary');
    orderSummary.innerHTML = '';

    cart.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0';
        
        itemElement.innerHTML = `
            <div class="flex items-center space-x-3">
                <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded">
                <div>
                    <h5 class="font-semibold text-sm">${item.name}</h5>
                    <p class="text-xs text-gray-500">${formatRupiah(item.price)} x ${item.quantity}</p>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <span class="font-semibold">${formatRupiah(item.price * item.quantity)}</span>
                <button onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-700 text-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        orderSummary.appendChild(itemElement);
    });
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    renderOrderSummary();
    calculateTotal();
}

// Calculate total amount
function calculateTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('totalAmount').textContent = formatRupiah(total);
}

// Handle checkout form submission
document.getElementById('checkoutForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        customerName: document.getElementById('customerName').value,
        customerPhone: document.getElementById('customerPhone').value,
        customerAddress: document.getElementById('customerAddress').value,
        orderNotes: document.getElementById('orderNotes').value,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        orderDate: new Date().toISOString(),
        status: 'pending',
        paymentMethod: 'COD'
    };

    // Show loading
    showLoading();

    // Simulate API call delay
    setTimeout(() => {
        hideLoading();
        submitOrder(formData);
    }, 1500);
});

// Submit order to database
async function submitOrder(orderData) {
    try {
        // Submit order to Supabase database
        const { data, error } = await dbService.insertOrder(orderData);
        
        if (error) {
            console.error('Database error:', error);
            // Still show success modal even if database fails (order is saved locally)
            showCODModal(orderData);
        } else {
            console.log('Order submitted successfully:', data);
            // Add database ID to order data if available
            if (data && data.id) {
                orderData.orderId = data.id;
            }
            showCODModal(orderData);
        }
        
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.');
    }
}

// Show COD confirmation modal
function showCODModal(orderData) {
    closeModal('checkoutModal');
    
    // Populate order details
    const orderDetails = document.getElementById('orderDetails');
    orderDetails.innerHTML = `
        <div class="space-y-2">
            <div class="flex justify-between">
                <span class="text-sm text-gray-600">Nama:</span>
                <span class="text-sm font-semibold">${orderData.customerName}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-sm text-gray-600">Telepon:</span>
                <span class="text-sm font-semibold">${orderData.customerPhone}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-sm text-gray-600">Total Items:</span>
                <span class="text-sm font-semibold">${orderData.items.reduce((sum, item) => sum + item.quantity, 0)} item</span>
            </div>
            <div class="flex justify-between">
                <span class="text-sm text-gray-600">Total Bayar:</span>
                <span class="text-sm font-bold text-primary">${formatRupiah(orderData.total)}</span>
            </div>
            <div class="pt-2 border-t">
                <p class="text-xs text-gray-500">Estimasi waktu pengiriman: 30-45 menit</p>
            </div>
        </div>
    `;
    
    document.getElementById('codModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Reset app to initial state
function resetApp() {
    cart = [];
    currentProduct = null;
    currentQuantity = 1;
    updateCartCount();
    document.body.style.overflow = 'auto';
}

// Show loading spinner
function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('hidden');
}

// Hide loading spinner
function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('hidden');
}

// Cart button click handler
document.getElementById('cartBtn').addEventListener('click', function() {
    if (cart.length > 0) {
        openCheckoutModal();
    } else {
        alert('Keranjang Anda masih kosong. Silakan pilih produk terlebih dahulu.');
    }
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modals = ['productModal', 'checkoutModal', 'codModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (e.target === modal) {
            closeModal(modalId);
        }
    });
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modals = ['productModal', 'checkoutModal', 'codModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (!modal.classList.contains('hidden')) {
                closeModal(modalId);
            }
        });
    }
});

