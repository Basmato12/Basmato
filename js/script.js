// Main JavaScript for Davici Furniture Website

// Sample product data (will be replaced with Firebase later)
const sampleProducts = [
    {
        id: 1,
        name: "Modern Sofa Set",
        price: 100.00,
        category: "new",
        description: "Comfortable modern sofa set for your living room",
        image: "fa-couch",
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
                <
