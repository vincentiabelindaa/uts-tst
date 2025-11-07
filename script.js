function showSection(sectionId) {
    const sections = document.querySelectorAll('.api-section');
    sections.forEach(section => {
    section.classList.remove('active');
    });

    const buttons = document.querySelectorAll('.nav-button');
    buttons.forEach(button => {
    button.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');

    document.querySelector(`.nav-button[onclick="showSection('${sectionId}')"]`).classList.add('active');
}

const MAPS_API_KEY = "AIzaSyBS5F9iWtFYJKjPeg3unvqKPplpZFpshX0";
const WEATHER_API_KEY = "663f64abc70437629621884cf6b6c61a";
const EXCHANGE_API_KEY = "865c5273b01cdfc723c5338f";
const FLIGHT_API_KEY = "b9c125aa65c240050b05b40f186cde29";


// google maps 
function cariLokasi() {
    const lokasi = document.getElementById("lokasiInput").value;
    const urlBaru = `https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${lokasi}`;
    document.getElementById("petaGoogle").src = urlBaru;
}

// weather
function cariCuaca() {
    const kota = document.getElementById("weatherInput").value;
    const weatherDiv = document.getElementById("weather");
    if (!kota) {
        weatherDiv.textContent = "Tolong masukkan nama kota.";
    return;
  }
    weatherDiv.innerHTML = `Mencari data cuaca untuk ${kota}...`;
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${kota}&units=metric&appid=${WEATHER_API_KEY}`)
    .then(response => {
        if (!response.ok) throw new Error('Kota tidak ditemukan!');
        return response.json();
    })
    .then(data => {
        const temp = data.main.temp;
        const desc = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const cityName = data.name;
        const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
        weatherDiv.innerHTML = `
            <div class="weather-result">
            <img src="${iconUrl}" alt="Ikon cuaca ${desc}">
            <div class="weather-info">
                <span class="weather-city">${cityName}</span>
                <span class="weather-temp">${Math.round(temp)}°C</span>
                <span class="weather-desc">${desc}</span>
            </div>
            </div>
        `;
    })
    .catch((error) => {
        console.error("Weather fetch error:", error);
        weatherDiv.innerHTML = "Gagal memuat data cuaca. (Cek API Key atau nama kota)";
    });
}

// currency
function convertCurrency() {
    const amount = document.getElementById("amountInput").value;
    const baseCurrency = document.getElementById("currencySelect").value;
    const rateInfoDiv = document.getElementById("rateInfo");
    const resultDiv = document.getElementById("conversionResult");
    if (!amount || amount <= 0) {
        resultDiv.textContent = "Tolong masukkan jumlah yang valid.";
        rateInfoDiv.textContent = "";
        return;
    }
    if (!baseCurrency) {
        resultDiv.textContent = "Tolong pilih mata uang.";
        rateInfoDiv.textContent = "";
        return;
    }
    rateInfoDiv.textContent = "Mengambil data kurs...";
    resultDiv.textContent = "";
    fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/${baseCurrency}`)
        .then(response => {
            if (!response.ok) throw new Error('Cek API Key');
            return response.json();
        })
        .then(data => {
            const rate = data.conversion_rates.IDR;
            const converted = amount * rate;
            rateInfoDiv.textContent = `Info Kurs: 1 ${baseCurrency} = Rp ${rate.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            resultDiv.textContent = `${amount} ${baseCurrency} ≈ Rp ${Math.round(converted).toLocaleString('id-ID')}`;
        })
        .catch((error) => {
            console.error("Currency fetch error:", error);
            rateInfoDiv.textContent = "";
            resultDiv.textContent = "Gagal memuat data konversi. (Cak API Key)";
        });
    }   

// jadwal penerbangan
function cariPenerbangan() {
    const origin = document.getElementById("flightOriginInput").value;
    const destination = document.getElementById("flightDestInput").value;
    const resultsDiv = document.getElementById("flightResults");

    if (!origin || !destination) {
        resultsDiv.innerHTML = "Tolong masukkan kode bandara Asal dan Tujuan.";
        return;
    }

    resultsDiv.innerHTML = `Mencari penerbangan dari ${origin} ke ${destination}...`;

    fetch(`http://api.aviationstack.com/v1/flights?access_key=${FLIGHT_API_KEY}&dep_iata=${origin.toUpperCase()}&arr_iata=${destination.toUpperCase()}&limit=5`)
        .then(response => {
            if (!response.ok) throw new Error('Cek API Key atau kode bandara');
            return response.json();
        })
        .then(data => {
            if (!data.data || data.data.length === 0) {
                resultsDiv.innerHTML = `Tidak ada jadwal penerbangan ditemukan untuk ${origin} ke ${destination}. (API gratis mungkin terbatas pada rute tertentu)`;
            return; 
            }

        resultsDiv.innerHTML = ""; 
      
        data.data.forEach(flight => {
            const flightHtml = `
                <div class="flight-item">
                    <div class="flight-details">
                    <span class="flight-airline">${flight.airline.name} (${flight.flight.iata})</span><br>
                    Berangkat: <strong>${flight.departure.iata}</strong> @ ${new Date(flight.departure.scheduled).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}<br>
                    Tiba: <strong>${flight.arrival.iata}</strong> @ ${new Date(flight.arrival.scheduled).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div class="flight-time">
                    ${flight.flight_status === 'scheduled' ? 'Terjadwal' : 'Berlangsung'}
                    </div>
                </div>
                `;
        resultsDiv.innerHTML += flightHtml;
      });
    })
    .catch((error) => {
        console.error("Flight fetch error:", error);
        resultsDiv.innerHTML = "Gagal memuat data penerbangan. (Cek API Key / pastikan pakai http)";
    });
}

// drop down currency
function populateCurrencyDropdown() {
    const select = document.getElementById("currencySelect");
    fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/USD`)
        .then(response => {
            if (!response.ok) throw new Error('Gagal memuat daftar mata uang');
            return response.json();
        })
        .then(data => {
            select.innerHTML = "";
            const rates = data.conversion_rates;
            const commonCurrencies = ["USD", "EUR", "JPY", "GBP", "AUD", "CAD", "CHF", "CNY", "IDR", "SGD", "KRW"];
      
        for (const currencyCode of commonCurrencies) {
            if (rates[currencyCode]) {
                const option = document.createElement("option");
                option.value = currencyCode;
                option.text = currencyCode;
                if (currencyCode === "EUR") option.selected = true;
                select.appendChild(option);
            }
        }
        for (const currencyCode in rates) {
            if (!commonCurrencies.includes(currencyCode)) {
                const option = document.createElement("option");
                option.value = currencyCode;
                option.text = currencyCode;
                select.appendChild(option);
                }
            }
        })
    .catch(error => {
      console.error("Gagal memuat daftar mata uang:", error);
      select.innerHTML = "<option value=''>Gagal memuat daftar</option>";
    });
}

document.addEventListener("DOMContentLoaded", populateCurrencyDropdown);