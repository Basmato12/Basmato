// Main application logic
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // Set up auth state listener
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                await loadUserData(user.uid);
                updateUIForLoggedInUser(user);
            } else {
                currentUser = null;
                userCart = JSON.parse(localStorage.getItem('guestCart')) || [];
                updateUIForLoggedOutUser();
            }
            updateCartCount();
        });

        await loadProductsFromFirebase();
        setupEventListeners();
    } catch (error) {
        console.error("Error initializing app:", error);
        showError("Failed to load products. Please refresh the page.");
    }
}

// Load products from Firebase
async function loadProductsFromFirebase() {
    const productsContainer = document.getElementById('products-container');
    
    try {
        const querySnapshot = await db.collection('products').get();
        allProducts = [];
        
        querySnapshot.forEach((doc) => {
            allProducts.push({ 
                id: doc.id, 
                ...doc.data() 
            });
        });

        document.getElementById('products-count').textContent = allProducts.length + '+';

        if (allProducts.length === 0) {
            await addSampleProducts();
            await loadProductsFromFirebase();
            return;
        }

        displayProducts(allProducts);
        
    } catch (error) {
        console.error("Error loading products:", error);
        showError("Error loading products from database.");
    }
}

// Load user data from Firestore
async function loadUserData(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            userCart = userData.cart || [];
            // Merge guest cart with user cart
            const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
            if (guestCart.length > 0) {
                userCart = mergeCarts(userCart, guestCart);
                await saveUserCart(userId, userCart);
                localStorage.removeItem('guestCart');
            }
        } else {
            // Create user document if it doesn't exist
            await db.collection('users').doc(userId).set({
                name: currentUser.displayName || currentUser.email,
                email: currentUser.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                cart: []
            });
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

// Merge guest cart with user cart
function mergeCarts(userCart, guestCart) {
    const mergedCart = [...userCart];
    
    guestCart.forEach(guestItem => {
        const existingItem = mergedCart.find(item => item.id === guestItem.id);
        if (existingItem) {
            existingItem.quantity += guestItem.quantity;
        } else {
            mergedCart.push(guestItem);
        }
    });
    
    return mergedCart;
}

// Save user cart to Firestore
async function saveUserCart(userId, cart) {
    try {
        await db.collection('users').doc(userId).update({
            cart: cart,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving user cart:", error);
    }
}

// Add sample products to Firestore
async function addSampleProducts() {
    const sampleProducts = [
        {
            name: "Modern Sofa Set",
            price: 299.00,
            oldPrice: 399.00,
            category: "new",
            description: "Comfortable modern sofa set for your living room",
            image: "https://via.placeholder.com/500x300/2c3e50/ffffff?text=Modern+Sofa",
            badge: "Popular",
            features: ["Premium fabric", "Solid wood frame", "High-density foam"],
            inStock: true,
            rating: 4.5,
            reviewCount: 24
        },
        {
            name: "Dining Chair",
            price: 89.00,
            oldPrice: 120.00,
            category: "top",
            description: "Elegant dining chair with premium finish",
            image: "https://via.placeholder.com/500x300/2c3e50/ffffff?text=Modern+Sofa",
            badge: "Sale",
            features: ["Ergonomic design", "Easy to clean", "Sturdy construction"],
            inStock: true,
            rating: 4.2,
            reviewCount: 18
        },
        {
            name: "Queen Size Bed",
            price: 499.00,
            category: "sale",
            description: "Comfortable queen size bed with storage",
            image: "https://via.placeholder.com/500x300/2c3e50/ffffff?text=Modern+Sofa",
            badge: "New",
            features: ["Storage drawers", "Premium wood", "Easy assembly"],
            inStock: true,
            rating: 4.7,
            reviewCount: 32
        }
    ];

    try {
        for (const product of sampleProducts) {
            await db.collection('products').add(product);
        }
        console.log("Sample products added to Firebase");
    } catch (error) {
        console.error("Error adding sample products:", error);
    }
}

// Display products
// Display products
function displayProducts(products) {
    const productsContainer = document.getElementById('products-container');
    
    if (products.length === 0) {
        productsContainer.innerHTML = '<div class="loading-message">No products found.</div>';
        return;
    }

    productsContainer.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}" onerror="handleImageError(this)">
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
                    <button class="wishlist-btn">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });

    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', toggleWishlist);
    });

    setupProductFiltering(products);
}

// Handle broken images
function handleImageError(img) {
    console.log('Image failed to load:', img.src);
    img.style.display = 'none';
    
    // Create fallback icon
    const fallback = document.createElement('div');
    fallback.className = 'fallback-icon';
    fallback.innerHTML = '<i class="fas fa-couch"></i>';
    
    img.parentNode.appendChild(fallback);
}

    // Add event listeners
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });

    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', toggleWishlist);
    });

    setupProductFiltering(products);
}

// Handle broken images
function handleImageError(img) {
    console.log('Image failed to load:', img.src);
    img.style.display = 'none';
    
    // Create fallback icon
    const fallback = document.createElement('div');
    fallback.className = 'fallback-icon';
    fallback.innerHTML = '<i class="fas fa-couch"></i>';
    
    img.parentNode.appendChild(fallback);
}
// Add to cart function
async function addToCart(e) {
    const productId = e.target.getAttribute('data-id');
    const product = allProducts.find(p => p.id === productId);
    
    if (product) {
        const existingItem = userCart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            userCart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        if (currentUser) {
            await saveUserCart(currentUser.uid, userCart);
        } else {
            localStorage.setItem('guestCart', JSON.stringify(userCart));
        }
        
        updateCartCount();
        showCartNotification(product.name);
    }
}

// Update cart count
function updateCartCount() {
    const totalItems = userCart.reduce((total, item) => total + item.quantity, 0);
    document.querySelector('.cart-count').textContent = totalItems;
}

// Authentication functions
async function loginUser(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return userCredential;
    } catch (error) {
        throw error;
    }
}

async function registerUser(name, email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({
            displayName: name
        });
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            cart: []
        });
        return userCredential;
    } catch (error) {
        throw error;
    }
}

async function logoutUser() {
    try {
        if (currentUser) {
            localStorage.setItem('guestCart', JSON.stringify(userCart));
        }
        await auth.signOut();
    } catch (error) {
        console.error("Error signing out:", error);
    }
}

// Update UI based on auth state
function updateUIForLoggedInUser(user) {
    document.getElementById('auth-link').style.display = 'none';
    document.getElementById('user-dropdown').style.display = 'inline-block';
    document.getElementById('user-name').textContent = user.displayName || user.email;
}

function updateUIForLoggedOutUser() {
    document.getElementById('auth-link').style.display = 'inline-block';
    document.getElementById('user-dropdown').style.display = 'none';
}

// Event listeners
function setupEventListeners() {
    // Mobile menu
    document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
        const nav = document.querySelector('nav');
        nav.classList.toggle('active');
        
        const menuIcon = document.querySelector('.mobile-menu-btn i');
        if (nav.classList.contains('active')) {
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-times');
        } else {
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars');
        }
    });

    // Auth modal
    document.getElementById('auth-link').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('auth-modal').classList.add('active');
    });

    document.getElementById('close-auth').addEventListener('click', function() {
        document.getElementById('auth-modal').classList.remove('active');
    });

    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.getAttribute('data-tab') + '-form').classList.add('active');
        });
    });

    // Login form
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            await loginUser(email, password);
            document.getElementById('auth-modal').classList.remove('active');
            this.reset();
            document.getElementById('login-error').classList.remove('show');
        } catch (error) {
            document.getElementById('login-error').textContent = error.message;
            document.getElementById('login-error').classList.add('show');
        }
    });

    // Register form
    document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        
        if (password !== confirm) {
            document.getElementById('register-error').textContent = "Passwords don't match";
            document.getElementById('register-error').classList.add('show');
            return;
        }
        
        try {
            await registerUser(name, email, password);
            document.getElementById('auth-modal').classList.remove('active');
            this.reset();
            document.getElementById('register-error').classList.remove('show');
        } catch (error) {
            document.getElementById('register-error').textContent = error.message;
            document.getElementById('register-error').classList.add('show');
        }
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logoutUser();
    });

    // Newsletter
    document.getElementById('newsletter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        alert(`Thank you for subscribing with: ${email}`);
        this.reset();
    });
}

function setupProductFiltering(products) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filterValue = button.getAttribute('data-filter');
            if (filterValue === 'all') {
                displayProducts(products);
            } else {
                const filteredProducts = products.filter(product => product.category === filterValue);
                displayProducts(filteredProducts);
            }
        });
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

function toggleWishlist(e) {
    const wishlistBtn = e.currentTarget;
    wishlistBtn.classList.toggle('active');
    wishlistBtn.querySelector('i').classList.toggle('far');
    wishlistBtn.querySelector('i').classList.toggle('fas');
}

function showError(message) {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
}
