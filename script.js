const cryptoContainer = document.getElementById('crypto-container');
const apiKey = 'CG-yF9b6H4g6Wcn2HcSzFZG68ni';
const currencySelector = document.getElementById('currency-selector');
const loader = document.getElementById('loader');
const searchInput = document.getElementById('search-input');
const modal = document.getElementById('chart-modal');
const modalTitle = document.getElementById('modal-title');
const closeModalBtn = document.getElementById('close-modal');
let currentCurrency = 'idr';
let allCoins = [];
let priceChart = null;

function renderCoins(coinsToRender){
    cryptoContainer.innerHTML = '';

    if(coinsToRender && coinsToRender.length > 0){
        coinsToRender.forEach(coin =>{
            const price = coin.current_price;
            const formattedPrice = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currentCurrency.toUpperCase()
            }).format(price);

            const coinElement = document.createElement('div');
            coinElement.classList.add('coin');
            coinElement.dataset.coinId = coin.id;

            coinElement.innerHTML = `<div class="coin-info">
                    <img src="${coin.image}" alt="${coin.name}">
                    <span class="coin-name">${coin.name}</span>
                </div>
                <span class="coin-price">${formattedPrice}</span>
            `;

            coinElement.addEventListener('click', () => {
                const clickedCoinId = coinElement.dataset.coinId;
                const selectedCoin = allCoins.find(c => c.id === clickedCoinId);
                if (selectedCoin) {
                    showModal(selectedCoin);
                }
            });
            
            cryptoContainer.appendChild(coinElement);
        });
    } else {
        cryptoContainer.innerHTML = `<p style="color: #ffc107; text-align: center;">No coins found</p>`
    }
}

function showModal(coin){
    modalTitle.innerText = `${coin.name} (7 Day Price Chart)`;
    modal.classList.remove('hide');
    fetchChartData(coin.id);
}

function hideModal(){
    modal.classList.add('hide');
    if(priceChart){
        priceChart.destroy();
    }
}

async function fetchChartData(coinId){
    const modalBody = document.querySelector('.modal-body');
    modalBody.innerHTML = `<div id="loader"></div>`;

    const chartApiUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currentCurrency}&days=7&interval=daily&x_cg_demo_api_key=${apiKey}`;
    try {
        const response = await fetch(chartApiUrl);
        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();

        const labels = data.prices.map(priceData =>{
            const date = new Date(priceData[0]);
            return date.toLocaleDateString('en-GB', {day: 'numeric', month: 'short'});
        });
        const prices = data.prices.map(priceData => priceData[1]);

        modalBody.innerHTML = `<canvas id="price-chart"></canvas>`;
        const ctx = document.getElementById('price-chart').getContext('2d');

        if(priceChart){
            priceChart.destroy();
        }

        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Price in ${currentCurrency.toUpperCase()}`,
                    data: prices,
                    borderColor: '#ffc107',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales:{
                    y: {
                        ticks:{
                            callback: function(value, index, values){
                                return new Intl.NumberFormat('en-US', { style: 'currency', currency: currentCurrency.toUpperCase(), notation: 'compact' }).format(value);
                            }
                        }
                    }
                }
            }
        });
    } catch(error){
        console.error("Chart Error:", error);
        modalBody.innerHTML = `<p style="color: #ff6b6b; text-align: center;">Oops! Terjadi kesalahan saat mengambil data.</p>`;
    }   
}
async function fetchCryptoData(currency) {

    loader.classList.remove('hide');
    cryptoContainer.innerHTML = '';
    searchInput.value = '';
    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=false&x_cg_demo_api_key=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP erorr!. Status: ${response.status}`);
            }
        const coins = await response.json();
        allCoins = coins;
        loader.classList.add('hide');
        renderCoins(allCoins);
    }  catch (error) {
        loader.classList.add('hide');
        console.error("Gagal mengambil data:", error);
        cryptoContainer.innerHTML = `<p style="color: #ffc107; text-align: center;">Oops! Terjadi kesalahan saat mengambil data.</p>`;
    }
}

searchInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();

    const filteredCoins = allCoins.filter(coin => coin.name.toLowerCase().includes(searchTerm) || coin.symbol.toLowerCase().includes(searchTerm));
    renderCoins(filteredCoins);
});

currencySelector.addEventListener('change', (event) => {
    const newCurrency = event.target.value;
    currentCurrency = newCurrency;
    fetchCryptoData(currentCurrency);

});

fetchCryptoData(currentCurrency);

closeModalBtn.addEventListener('click', hideModal);

modal.addEventListener('click', (event) => {
    if(event.target === modal){
        hideModal();
    }
});