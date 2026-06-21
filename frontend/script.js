const API_BASE = 'http://localhost:5000/api';

const getStoredCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
const saveCart = (cart) => localStorage.setItem('cart', JSON.stringify(cart));
const getToken = () => localStorage.getItem('token');

const showMessage = (id, message, isError = false) => {
  const element = document.getElementById(id);
  if (!element) return;

  element.textContent = message;
  element.style.color = isError ? '#b91c1c' : '#15803d';
};

const fetchProducts = async () => {
  const response = await fetch(`${API_BASE}/products`);
  if (!response.ok) {
    throw new Error('Failed to load products');
  }

  return response.json();
};

const addToCart = (product) => {
  const cart = getStoredCart();
  const existingItem = cart.find((item) => item._id === product._id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  alert(`${product.name} added to cart`);
};

const renderProducts = async () => {
  const productList = document.getElementById('product-list');
  if (!productList) return;

  try {
    const products = await fetchProducts();

    if (!products.length) {
      productList.innerHTML = '<p>No products available yet.</p>';
      return;
    }

    productList.innerHTML = products
      .map(
        (product) => `
          <article class="card">
            <img src="${product.image}" alt="${product.name}" />
            <h3>${product.name}</h3>
            <p>$${Number(product.price).toFixed(2)}</p>
            <button data-id="${product._id}">Add to Cart</button>
          </article>
        `
      )
      .join('');

    productList.addEventListener('click', (event) => {
      if (event.target.tagName !== 'BUTTON') return;
      const productId = event.target.getAttribute('data-id');
      const selectedProduct = products.find((product) => product._id === productId);
      if (selectedProduct) addToCart(selectedProduct);
    });
  } catch (error) {
    productList.innerHTML = '<p>Could not load products.</p>';
  }
};

const renderCart = () => {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  if (!cartItems || !cartTotal) return;

  const cart = getStoredCart();
  if (!cart.length) {
    cartItems.innerHTML = '<li>Your cart is empty.</li>';
    cartTotal.textContent = 'Total: $0.00';
    return;
  }

  let total = 0;
  cartItems.innerHTML = cart
    .map((item) => {
      const lineTotal = Number(item.price) * item.quantity;
      total += lineTotal;
      return `<li><span>${item.name} x ${item.quantity}</span><strong>$${lineTotal.toFixed(2)}</strong></li>`;
    })
    .join('');

  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
};

const setupAuthForms = () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(registerForm);
      const payload = Object.fromEntries(formData.entries());

      try {
        const response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registration failed');

        localStorage.setItem('token', data.token);
        showMessage('auth-message', 'Registration successful. You are logged in.');
        registerForm.reset();
      } catch (error) {
        showMessage('auth-message', error.message, true);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const payload = Object.fromEntries(formData.entries());

      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');

        localStorage.setItem('token', data.token);
        showMessage('auth-message', 'Login successful.');
        loginForm.reset();
      } catch (error) {
        showMessage('auth-message', error.message, true);
      }
    });
  }
};

const renderAdminProducts = async () => {
  const list = document.getElementById('admin-product-list');
  if (!list) return;

  try {
    const products = await fetchProducts();
    list.innerHTML = products
      .map(
        (product) => `
          <li>
            <span>${product.name} - $${Number(product.price).toFixed(2)}</span>
            <button data-id="${product._id}">Delete</button>
          </li>
        `
      )
      .join('');
  } catch (error) {
    showMessage('admin-message', error.message || 'Unable to load admin products.', true);
  }
};

const setupAdminForm = () => {
  const productForm = document.getElementById('product-form');
  if (!productForm) return;

  productForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(productForm);
    const payload = Object.fromEntries(formData.entries());
    payload.price = Number(payload.price);

    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + getToken(),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Add product failed');
      }

      showMessage('admin-message', 'Product added successfully.');
      productForm.reset();
      renderAdminProducts();
    } catch (error) {
      showMessage('admin-message', error.message, true);
    }
  });

  const adminList = document.getElementById('admin-product-list');
  if (!adminList) return;

  adminList.addEventListener('click', async (event) => {
    if (event.target.tagName !== 'BUTTON') return;

    try {
      const productId = event.target.getAttribute('data-id');
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + getToken(),
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Delete failed');
      }

      showMessage('admin-message', 'Product deleted.');
      renderAdminProducts();
    } catch (error) {
      showMessage('admin-message', error.message, true);
    }
  });
};

renderProducts();
renderCart();
setupAuthForms();
setupAdminForm();
renderAdminProducts();
