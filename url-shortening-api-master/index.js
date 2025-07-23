// URL Shortener JavaScript using HTML structure and Bitly API

const urlInput = document.querySelector('.url-container input[type="text"]')
const errorMessageEl = document.getElementById('error-message')
const activateBtn = document.querySelector('.second-btn')
const linksHistoryEl = document.getElementById('links-part')

//Bitly API token
const BITLY_TOKEN = 'b2218ef7143d1499949570a10c1ed1b57d5c04a3'

function getUrlInput() {
    return urlInput.value.trim()
}

async function shortenUrl(urlLink) {
    const apiUrl = 'https://api-ssl.bitly.com/v4/shorten'
    
    // Add https:// if not present
    let fullUrl = urlLink
    if (!urlLink.startsWith('http://') && !urlLink.startsWith('https://')) {
        fullUrl = 'https://' + urlLink
    }

    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${BITLY_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                long_url: fullUrl
            })
        })

        if (res.ok) {
            const data = await res.json()
            displayToLinksHistory(fullUrl, data)
            saveToLocalStorage(fullUrl, data.link)
        } else {
            const errorData = await res.json()
            console.error(`Error shortening URL: ${res.statusText}`, errorData)
            errorMessageEl.textContent = 'Failed to shorten URL. Please try again.'
            errorMessageEl.classList.add('error')
        }
    } catch (error) {
        console.error('Network error:', error)
        errorMessageEl.textContent = 'Network error. Please check your connection.'
        errorMessageEl.classList.add('error')
    }
}

function isValidUrl(url) {
    try {
        // Add protocol if missing for validation
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url
        }
        new URL(url)
        return true
    } catch (_) {
        return false
    }
}

function displayToLinksHistory(originalLink, urlData) {
    const linkItem = document.createElement('div')
    linkItem.classList.add('item')
    linkItem.innerHTML = `
        <div class='link'>${originalLink}</div>
        <div class='short-link'>
            <a href="${urlData.link}" target="_blank">${urlData.link}</a>
            <button class='copy-btn'>Copy</button>
        </div>
    `

    // Add to the beginning of the list
    linksHistoryEl.insertBefore(linkItem, linksHistoryEl.firstChild)

    // Add copy functionality
    linkItem.querySelector('.copy-btn').addEventListener('click', (e) => {
        let copyUrl = urlData.link
        navigator.clipboard.writeText(copyUrl).then(() => {
            e.target.style.backgroundColor = 'hsl(257, 27%, 26%)'
            e.target.textContent = 'Copied!'

            setTimeout(() => {
                e.target.style.backgroundColor = 'hsl(180, 66%, 49%)'
                e.target.textContent = 'Copy'
            }, 1500)
        }).catch(err => {
            console.error('Failed to copy: ', err)
            // Fallback for older browsers
            fallbackCopyTextToClipboard(copyUrl, e.target)
        })
    })
}

function fallbackCopyTextToClipboard(text, button) {
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.top = "0"
    textArea.style.left = "0"
    textArea.style.position = "fixed"
    
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
        document.execCommand('copy')
        button.style.backgroundColor = 'hsl(257, 27%, 26%)'
        button.textContent = 'Copied!'
        
        setTimeout(() => {
            button.style.backgroundColor = 'hsl(180, 66%, 49%)'
            button.textContent = 'Copy'
        }, 1500)
    } catch (err) {
        console.error('Fallback: Unable to copy', err)
    }
    
    document.body.removeChild(textArea)
}

function saveToLocalStorage(originalUrl, shortUrl) {
    let links = getLinksFromStorage()
    
    // Add new link to the beginning
    links.unshift({
        original: originalUrl,
        short: shortUrl,
        timestamp: Date.now()
    })
    
    // Keep only last 10 links
    links = links.slice(0, 10)
    
    localStorage.setItem('shortened_links', JSON.stringify(links))
}

function getLinksFromStorage() {
    const stored = localStorage.getItem('shortened_links')
    return stored ? JSON.parse(stored) : []
}

function loadLinksFromStorage() {
    const links = getLinksFromStorage()
    
    if (links.length > 0) {
        linksHistoryEl.classList.add('active')
        
        links.forEach(link => {
            displayToLinksHistory(link.original, { link: link.short })
        })
    }
}

// Main event listener
activateBtn.addEventListener('click', async () => {
    const userURL = getUrlInput()

    if (!userURL || !isValidUrl(userURL)) {
        errorMessageEl.classList.add('error')
        urlInput.classList.add('error')
    } else {
        errorMessageEl.classList.remove('error')
        urlInput.classList.remove('error')
        
        // Show loading state
        activateBtn.textContent = 'Shortening...'
        activateBtn.disabled = true
        
        linksHistoryEl.classList.add('active')
        
        await shortenUrl(userURL)
        
        // Reset button and clear input
        activateBtn.textContent = 'Shorten It!'
        activateBtn.disabled = false
        urlInput.value = ''
    }
})

// Enter key support
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        activateBtn.click()
    }
})

// Clear error when user starts typing
urlInput.addEventListener('input', () => {
    errorMessageEl.classList.remove('error')
    urlInput.classList.remove('error')
})

// Load saved links when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadLinksFromStorage()
})

// Smooth scroll for navigation (bonus feature)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            })
        }
    })
})