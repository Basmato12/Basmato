// Main JavaScript for Davici Furniture Website

// Sample product data (will be replaced with Firebase later)
const sampleProducts = [
    {
        id: 1,
        name: "Modern Sofa Set",
        price: 100.00,
        category: "new",
        description: "Comfortable modern sofa set for your living room",
        image: "image1.png",
        badge: "New"
    },
    {
        id: 2,
        name: "Dining Chair",
        price: 15.00,
        oldPrice: 20.00,
        category: "top",
        description: "Elegant dining chair with premium finish",
        image: "fa-chair",
        badge: "Popular"
    },
    {
        id: 3,
        name: "Queen Size Bed",
        price: 15.00,
        oldPrice: 30.00,
        category: "sale",
        description: "Comfortable queen size bed with storage",
        image: "fa-bed",
        badge: "Sale"
    },
    {
        id: 4,
        name: "Dining Table",
        price: 120.00,
        category: "new",
        description: "Modern dining table with glass top",
        image: "fa-table",
        badge: "New"
    },
    {
        id: 5,
        name: "Office Desk",
        price: 89.99,
        category: "top",
        description: "Ergonomic office desk with storage",
        image: "fa-desktop",
        badge: "Popular"
    },
    {
        id: 6,
        name: "Bookshelf",
        price: 75.00,
        oldPrice: 90.00,
        category: "sale",
        description: "Modern bookshelf with 5 shelves",
        image: "fa-book",
        badge: "Sale"
    }
];

// Global variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    setupEventListeners();
    loadProducts();
    updateCartCount();
    updateWishlistCount();
}

// Setup all event listeners
function setupEventListeners() {
    // Mobile menu toggle
    document.querySelector('.mobile-menu-btn').addEventListener('click', toggleMobileMenu);
    
    // Search functionality
    document.getElementById('search-toggle').addEventListener('click', toggleSearch);
    document.getElementById('search-icon').addEventListener('click', toggleSearch);
    document.getElementById('close-search').addEventListener('click', toggleSearch);
    document.querySelector('.search-btn').addEventListener('click', performSearch);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Newsletter form
    document.getElementById('newsletter-form').addEventListener('submit', handleNewsletterSubmit);
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Mobile menu functionality
function toggleMobileMenu() {
    const nav = document.querySelector('nav');
    nav.classList.toggle('active');
    
    // Update menu icon
    const menuIcon = document.querySelector('.mobile-menu-btn i');
    if (nav.classList.contains('active')) {
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-times');
    } else {
        menuIcon.classList.remove('fa-times');
        menuIcon.classList.add('fa-bars');
    }
}

// Search functionality
function toggleSearch() {
    const searchBar = document.getElementById('search-bar');
    searchBar.classList.toggle('active');
    
    if (searchBar.classList.contains('active')) {
        document.getElementById('search-input').focus();
    }
}

function performSearch() {
    const searchTerm = document.getElementById('search-input').value.trim();
    if (searchTerm) {
        // In a real app, this would search your database
        alert(`Searching for: ${searchTerm}`);
        // For now, we'll just filter the displayed products
        filterProductsBySearch(searchTerm);
        toggleSearch();
    }
}

function filterProductsBySearch(searchTerm) {
    const filteredProducts = sampleProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    displayProducts(filteredProducts);
}

// Product loading and display
function loadProducts() {
    displayProducts(sampleProducts);
}

function displayProducts(products) {
    const productsContainer = document.getElementById('products-container');
    
    if (products.length === 0) {
        productsContainer.innerHTML = '<div class="loading-message">No products found.</div>';
        return;
    }

    productsContainer.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-img">
                <i class="fas ${product.image}"></i>
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            </div>
            <div class="product-content">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <span class="product-price">
                    $${product.price.toFixed(2)}
                    ${product.oldPrice ? `<span class="old-price">$${product.oldPrice.toFixed(2)}</span>` : ''}
                </span>
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                    <button class="wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}" data-id="${product.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners to product buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });

    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', toggleWishlist);
    });

    // Setup product filtering
    setupProductFiltering(products);
}

function setupProductFiltering(allProducts) {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter products
            const filterValue = button.getAttribute('data-filter');
            
            if (filterValue === 'all') {
                displayProducts(allProducts);
            } else {
                const filteredProducts = allProducts.filter(product => product.category === filterValue);
                displayProducts(filteredProducts);
            }
        });
    });
}

// Cart functionality
function addToCart(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const product = sampleProducts.find(p => p.id === productId);
    
    if (product) {
        // Check if product already in cart
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Show notification
        showCartNotification(product.name);
    }
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

function showCartNotification(productName) {
    const notification = document.getElementById('cart-notification');
    notification.textContent = `${productName} added to cart!`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Wishlist functionality
function toggleWishlist(e) {
    const productId = parseInt(e.currentTarget.getAttribute('data-id'));
    const product = sampleProducts.find(p => p.id === productId);
    const wishlistBtn = e.currentTarget;
    
    if (product) {
        if (isInWishlist(productId)) {
            // Remove from wishlist
            wishlist = wishlist.filter(item => item.id !== productId);
            wishlistBtn.classList.remove('active');
        } else {
            // Add to wishlist
            wishlist.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image
            });
            wishlistBtn.classList.add('active');
        }
        
        // Save to localStorage
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        
        // Update wishlist count
        updateWishlistCount();
    }
}

function isInWishlist(productId) {
    return wishlist.some(item => item.id === productId);
}

function updateWishlistCount() {
    // This would update a wishlist counter if we had one in the UI
    console.log('Wishlist items:', wishlist.length);
}

// Newsletter form
function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    // In a real app, you would send this to your server
    alert(`Thank you for subscribing with: ${email}`);
    e.target.reset();
}

// Utility function to get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Initialize any page-specific functionality based on URL
function initializePageFeatures() {
    const category = getUrlParameter('category');
    if (category) {
        // Filter products by category if category parameter exists
        const filteredProducts = sampleProducts.filter(product => 
            product.category === category
        );
        displayProducts(filteredProducts);
    }
}

// Call this when the page loads
initializePageFeatures();
