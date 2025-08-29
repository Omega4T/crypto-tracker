const cryptoContainer = document.getElementById('crypto-container');
const apiKey = 'CG-yF9b6H4g6Wcn2HcSzFZG68ni';
const currencySelector = document.getElementById('currency-selector');
let currentCurrency = 'idr';

async function fetchCryptoData(currency) {
    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=bitcoin%2Cethereum%2Csolana%2Cdogecoin&order=market_cap_desc&per_page=10&page=1&sparkline=false&x_cg_demo_api_key=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        const coins = await response.json();

        cryptoContainer.innerHTML = '';

        coins.forEach(coin=> {

                const price = coin.current_price;

                const formattedPrice = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency.toUpperCase()
                }).format(price);

                const coinElement = document.createElement('div');
                coinElement.classList.add('coin');

                coinElement.innerHTML = `
                <div class="coin-info">
                    <img src="${coin.image}" alt="${coin.name}">
                    <span class="coin-name">${coin.name}</span>
                </div>
                <span class="coin-price">${formattedPrice}</span>
                `;

                cryptoContainer.appendChild(coinElement);
            });
    } catch (error) {
        console.error("Gagal mengambil data:", error);
        cryptoContainer.innerHTML = `<p style="color: #ff6b6b;">Gagal memuat data. Coba refresh halaman.</p>`;
    }

}

currencySelector.addEventListener('change', (event) => {
    const newCurrency = event.target.value;
    currentCurrency = newCurrency;
    fetchCryptoData(currentCurrency);

});

fetchCryptoData(currentCurrency);