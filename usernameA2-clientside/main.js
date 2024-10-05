async function fetchAPI(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

// Load active fundraisers on the homepage
document.addEventListener('DOMContentLoaded', async () => {
    await loadFundraisers(); 
});

async function loadFundraisers() {
    try {
        const response = await fetch('http://localhost:3000/api/fundraisers');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const fundraisers = await response.json();

        const detailsElement = document.getElementById('fundraiser-details');
        if (fundraisers.length > 0) {
            detailsElement.innerHTML = fundraisers.map(fundraiser => `
                <div class="fundraiser">
                    <h2>${fundraiser.CAPTION}</h2>
                    <p>Organizer: ${fundraiser.ORGANIZER}</p>
                    <p>Goal: $${parseFloat(fundraiser.TARGET_FUNDING).toFixed(2)}</p>
                    <p>Raised: $${parseFloat(fundraiser.CURRENT_FUNDING).toFixed(2)}</p>
                    <p>City: ${fundraiser.CITY}</p>
                    <p>Category: ${fundraiser.CATEGORY_NAME}</p>
                    <p>Status: ${fundraiser.ACTIVE ? "Active" : "Inactive"}</p>
                </div>
            `).join('');
        } else {
            detailsElement.innerHTML = '<p>No fundraisers found.</p>';
        }
    } catch (error) {
        console.error('Error loading fundraisers:', error);
        const detailsElement = document.getElementById('fundraiser-details');
        detailsElement.innerHTML = '<p>Error loading fundraisers. Please try again later.</p>';
    }
}


// Function to fetch and display categories in the dropdown
async function fetchCategories() {
    try {
        const categories = await fetchAPI('http://localhost:3000/api/categories');
        const categorySelect = document.getElementById('category');

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.CATEGORY_ID;
            option.textContent = category.NAME;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

// Event listeners - Consolidated
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.endsWith('index.html') || path === '/') {
        loadFundraisers();
    } else if (path.endsWith('fundraiser.html')) {
        loadFundraiserDetails();
        loadDonations();
    }

    if (document.getElementById('category')) {
        fetchCategories();
    }

    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
});








