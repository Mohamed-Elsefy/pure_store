// src/features/profile/profile.view.js

export class ProfileView {

    /**
     * Initializes the view:
     * - Receives action handlers from the controller.
     * - Tracks edit mode state.
     * - Stores temporary Base64 image when uploading a new avatar.
     */
    constructor(handlers) {
        this.handlers = handlers;
        this.isEditing = false;
        this.currentBase64Image = null;
    }

    /**
     * Main render method responsible for building the page UI.
     *
     * Flow:
     * - Renders user information in display mode.
     * - Renders user order history.
     * - Pre-fills the edit form with current user data.
     * - Attaches all required event listeners.
     */
    render(user, orders) {
        this._renderUserInfo(user);
        this._renderOrders(orders);
        this._fillEditForm(user);
        this._setupListeners();
    }

    /**
     * Renders user information in read-only display mode.
     *
     * - Updates avatar image (fallback to robohash if none exists).
     * - Updates full name, email, phone, and age.
     * - Formats and displays address safely.
     */
    _renderUserInfo(user) {
        if (!user) return;

        const avatarImg = document.getElementById('user-avatar');
        if (avatarImg) {
            avatarImg.src = user.image || `https://robohash.org/${user.username}`;
        }

        document.getElementById('user-full-name').textContent =
            `${user.firstName} ${user.lastName}`;

        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-phone').textContent =
            user.phone || 'No phone provided';

        document.getElementById('user-age').textContent =
            user.age ? `${user.age} years old` : 'Age not set';

        const addr = user.address;
        const addressText = addr?.address
            ? `${addr.address}${addr.city ? ', ' + addr.city : ''}`
            : 'No address set';

        document.getElementById('user-address').textContent = addressText;
    }

    /**
     * Pre-fills the edit form fields with current user data.
     *
     * - Populates input fields with existing values.
     * - Resets temporary Base64 image storage.
     */
    _fillEditForm(user) {
        const form = document.getElementById('edit-profile-form');
        if (!form || !user) return;

        form.querySelector('[name="firstName"]').value = user.firstName || '';
        form.querySelector('[name="lastName"]').value = user.lastName || '';
        form.querySelector('[name="phone"]').value = user.phone || '';
        form.querySelector('[name="address"]').value = user.address?.address || '';
        form.querySelector('[name="age"]').value = user.age || '';

        this.currentBase64Image = null;
    }

    /**
     * Toggles between display mode and edit mode.
     *
     * - Hides display section when editing.
     * - Shows edit form when editing is enabled.
     */
    _toggleEditMode(showEdit) {
        this.isEditing = showEdit;

        const displayMode = document.getElementById('profile-display-mode');
        const editMode = document.getElementById('edit-profile-form');

        if (showEdit) {
            displayMode.classList.add('hidden');
            editMode.classList.remove('hidden');
        } else {
            displayMode.classList.remove('hidden');
            editMode.classList.add('hidden');
        }
    }

    /**
     * Renders the user's order history.
     *
     * - Shows empty state if no orders exist.
     * - Reverses order list to show newest first.
     * - Clones template for each order.
     * - Formats date and total price.
     * - Applies dynamic status styling.
     * - Displays thumbnails of ordered items.
     */
    _renderOrders(orders) {
        const container = document.getElementById('orders-container');
        if (!container) return;

        if (!orders || orders.length === 0) {
            const emptyTemplate = document.getElementById('empty-orders-template');
            container.innerHTML = emptyTemplate.innerHTML;
            return;
        }

        const cardTemplate = document.getElementById('order-card-template');
        container.innerHTML = '';

        [...orders].reverse().forEach(order => {
            const clone = cardTemplate.content.cloneNode(true);

            clone.querySelector('.order-id').textContent = order.id;

            clone.querySelector('.order-date').textContent =
                new Date(order.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

            clone.querySelector('.order-total').textContent = `$${order.total}`;

            const statusBadge = clone.querySelector('.order-status');
            statusBadge.textContent = order.status;

            const isCompleted =
                order.status.toLowerCase() === 'completed';

            statusBadge.className =
                `order-status px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isCompleted
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-yellow-500/10 text-yellow-500'
                }`;

            const itemsContainer = clone.querySelector('.order-items');

            order.items.forEach(item => {
                const img = document.createElement('img');
                img.src = item.thumbnail;
                img.className =
                    "w-12 h-12 object-contain rounded-lg border border-(--border-glass) bg-white flex-shrink-0";
                img.title = `${item.title} (x${item.quantity})`;
                itemsContainer.appendChild(img);
            });

            container.appendChild(clone);
        });
    }

    /**
     * Sets up all UI event listeners.
     *
     * Includes:
     * - Switching to edit mode.
     * - Canceling edit mode.
     * - Handling avatar file upload and Base64 conversion.
     * - Handling form submission and formatting data.
     * - Logout action.
     * - Delete account action.
     */
    _setupListeners() {

        // Switch to edit mode
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.onclick = () => this._toggleEditMode(true);
        }

        // Cancel editing
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.onclick = () => this._toggleEditMode(false);
        }

        // Avatar upload handling
        const fileInput = document.getElementById('avatar-upload');
        const fileNameDisplay = document.getElementById('file-name-display');

        if (fileInput) {
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                fileNameDisplay.textContent = file.name;

                const reader = new FileReader();
                reader.onload = (event) => {
                    this.currentBase64Image = event.target.result;
                    document.getElementById('user-avatar').src =
                        this.currentBase64Image;
                };

                reader.readAsDataURL(file);
            };
        }

        // Save profile changes
        const editForm = document.getElementById('edit-profile-form');
        if (editForm) {
            editForm.onsubmit = async (e) => {
                e.preventDefault();

                const formData = new FormData(editForm);
                const data = Object.fromEntries(formData.entries());

                const formattedData = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    age: parseInt(data.age),
                    image:
                        this.currentBase64Image ||
                        document.getElementById('user-avatar').src,
                    address: { address: data.address }
                };

                const success =
                    await this.handlers.onUpdate(formattedData);

                if (success) {
                    this._toggleEditMode(false);
                }

                this.currentBase64Image = null;
            };
        }

        // Logout action
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = () => this.handlers.onLogout();
        }

        // Delete account action
        const deleteBtn = document.getElementById('delete-account-btn');
        if (deleteBtn) {
            deleteBtn.onclick = () => this.handlers.onDelete();
        }
    }
}