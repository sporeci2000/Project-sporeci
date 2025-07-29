//Select DOM elements
const linkInput = document.getElementById('link-input');
const errorMessage = document.getElementById('error-message');
const buttonElement = document.getElementById('second-btn');
const linksPart = document.getElementById('links-part');
const hamburger = document.querySelector('.nav-hamburger');
const mobileMenu = document.querySelector('.mobile-menu');


//Get the value from the input field, trim it, and convert it to lowercase
function getUrlInput() {
    return linkInput.value.trim().toLowerCase();
}

//This is a URL validation function that checks if the entered string is a valid URL
function isValidUrl(url) {
    try {
        // Ensure URL has http/https prefix
        new URL(url.startsWith('http') ? url : 'https://' + url);
        return true;
    } catch (error) {
        return false;
    }
}

//Send the long URL to the Bitly API and get a shortened link
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
            errorMessage.textContent = 'Error shortening URL. Please try again.';
            errorMessage.classList.add('error');
        }
    } catch (error) {
        // Handle network errors 
        console.error('Network error:', error);
        errorMessage.textContent = 'Network error. Please check your connection.';
        errorMessage.classList.add('error');
    }
}

//Display the original and shortened link in the history section
function displayToLinksHistory(originalLink, urlData) {
    const linkItem = document.createElement('div');
    linkItem.classList.add('item');

    //Inject HTML into the new link item
    linkItem.innerHTML = `
        <p class='link'>${originalLink}</p>
        <hr>
        <div class='short-link'>
            <p>${urlData.result_url}</p>
            <button class='copy-btn'>Copy</button>
        </div>
    `;

    //Make history container visible and add new link at the top
    linksPart.classList.add('active');

    //Inserts element as first child
    linksPart.prepend(linkItem);

    // 🔹 Add copy functionality to the button
    const copyBtn = linkItem.querySelector('.copy-btn');
    copyBtn.addEventListener('click', () => {
        const copyUrl = urlData.result_url;

        // Use clipboard API to copy shortened URL
        //Copies text to clipboard
        navigator.clipboard.writeText(copyUrl).then(() => {
            // Update the button text
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('copied');

            // Reset after 2 seconds
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
                copyBtn.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Clipboard error:', err);
        });
    });
}

//Hamburger toggle
hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('show');
});


//Main Event Handler
//Handle button click: validate input and trigger shortening process
buttonElement.addEventListener('click', () => {
    const userURL = getUrlInput();

    if (!userURL || !isValidUrl(userURL)) {
        //Show error if input is empty or invalid
        errorMessage.classList.add('error');
        linkInput.classList.add('error');
    } else {
        //Clear errors and proceed
        errorMessage.classList.remove('error');
        linkInput.classList.remove('error');
        shortenUrl(userURL);
        linkInput.value = '';
    }
});