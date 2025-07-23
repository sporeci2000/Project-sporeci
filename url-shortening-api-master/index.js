// Select DOM elements
const urlInput = document.getElementById('link-input');
const errorMessageEl = document.getElementById('error-message');
const activateBtn = document.querySelector('.second-btn');
const linksHistoryEl = document.getElementById('links-part');

// 🔹 Get the value from the input field, trim it, and convert it to lowercase
function getUrlInput() {
    return urlInput.value.trim().toLowerCase();
}

// 🔹 Check if the entered string is a valid URL
function isValidUrl(url) {
    try {
        // Ensure URL has http/https prefix
        new URL(url.startsWith('http') ? url : 'https://' + url);
        return true;
    } catch (_) {
        return false;
    }
}

// 🔹 Send the long URL to the Bitly API and get a shortened link
async function shortenUrl(urlLink) {
    const apiUrl = 'https://api-ssl.bitly.com/v4/shorten';
    const fullUrl = urlLink.startsWith('http') ? urlLink : 'https://' + urlLink;

    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer b2218ef7143d1499949570a10c1ed1b57d5c04a3' 
            },
            body: JSON.stringify({ long_url: fullUrl }),
        });

        // If response is OK, parse and display the shortened URL
        if (res.ok) {
            const data = await res.json();
            displayToLinksHistory(urlLink, { result_url: data.link });
        } else {
            // Handle Bitly API error
            console.error(`Bitly error: ${res.statusText}`);
            errorMessageEl.textContent = 'Error shortening URL. Try again.';
            errorMessageEl.classList.add('error');
        }
    } catch (error) {
        // Handle network errors 
        console.error('Network error:', error);
        errorMessageEl.textContent = 'Network error. Please check your connection.';
        errorMessageEl.classList.add('error');
    }
}

// 🔹 Display the original and shortened link in the history section
function displayToLinksHistory(originalLink, urlData) {
    const linkItem = document.createElement('div');
    linkItem.classList.add('item');

    // Inject HTML into the new link item
    linkItem.innerHTML = `
        <p class='link'>${originalLink}</p>
        <hr>
        <div class='short-link'>
            <p>${urlData.result_url}</p>
            <button class='copy-link-btn'>Copy</button>
        </div>
    `;

    // Make history container visible and add new link at the top
    linksHistoryEl.classList.add('active');
    linksHistoryEl.prepend(linkItem);

    // 🔹 Add copy functionality to the button
    const copyBtn = linkItem.querySelector('.copy-link-btn');
    copyBtn.addEventListener('click', () => {
        const copyUrl = urlData.result_url;

        // Use clipboard API to copy shortened URL
        navigator.clipboard.writeText(copyUrl).catch(err => {
            console.error('Clipboard error:', err);
        });

        
    });
}

// 🔹 Handle button click: validate input and trigger shortening process
activateBtn.addEventListener('click', () => {
    const userURL = getUrlInput();

    if (!userURL || !isValidUrl(userURL)) {
        // Show error if input is empty or invalid
        errorMessageEl.classList.add('error');
        urlInput.classList.add('error');
    } else {
        // Clear errors and proceed
        errorMessageEl.classList.remove('error');
        urlInput.classList.remove('error');
        shortenUrl(userURL);
        urlInput.value = '';
    }
});
