
let map;
let marker;
function initMap() {

    map = new google.maps.Map(document.getElementById("map"), {
    center: { lat:43.3148 , lng: -91.8052 }, 
    zoom: 12, 
  });
    
}

async function searchForFood() {
    const foodName = document.getElementById('foodName').value;
    const foodResult = document.getElementById('foodResult');

    // Check if the data is available in local storage
    const localStorageData = localStorage.getItem(`foodData_${foodName}`);

    if (localStorageData) {
    // Data found in local storage, parse and use it
        const data = JSON.parse(localStorageData);
        displayFoodData(data);
    } else {
    // Data not found in local storage, make the API request
        await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${foodName}`)
            .then(response => response.json())
            .then(data => {
    // Store the API response in local storage
                localStorage.setItem(`foodData_${foodName}`, JSON.stringify(data));
                displayFoodData(data);
            })
            .catch(error => console.error(error));
    }

    function displayFoodData(data) {
        foodResult.innerHTML = '';

        if (data.meals) {
            const meal = data.meals[0];
            const name = meal.strMeal;
            const category = meal.strCategory;
            const instructions = meal.strInstructions;

        // Display food details
            foodResult.innerHTML = `
                <h2>${name}</h2>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Instructions:</strong> ${instructions}</p>
            `;
        } else {
            foodResult.innerHTML = '<p>Food not found.</p>';
        }
    }
}
async function searchForRestaurants() {
    const city = document.getElementById('cityname').value;
    const minRating = parseFloat(document.getElementById('minrating').value);
    const cusine = document.getElementById('cuisines');

    console.log(JSON.stringify(cusine));

    loadingMessage.style.display = 'block';

    // Check if the data is available in local storage
    const localStorageData = localStorage.getItem('restaurantData');
    if (localStorageData) {
    // Data found in local storage, parse and use it
        const data = JSON.parse(localStorageData);
        displayRestaurantData(data, city, minRating);
    } else {
    // Data not found in local storage, make the API request
        await fetch(`https://api.spoonacular.com/food/restaurants/search?apiKey=5dedd77e620c4886a8b90f3512498ccd`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
    // Save the API response in local storage
                localStorage.setItem('restaurantData', JSON.stringify(data));
                displayRestaurantData(data, city, minRating);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                loadingMessage.style.display = 'none';
            });
    }
}
function displayRestaurantData(data, city, minRating) {
    const foodResult = document.getElementById('foodResult');
    foodResult.innerHTML = '';
   
    // Filter restaurants based on minimum rating and city
        const filteredRestaurants = data.restaurants.filter((restaurant) => {
          return restaurant.weighted_rating_value >= minRating && restaurant.address.city === city;
        });
        if (filteredRestaurants.length === 0) {
    // No restaurants found
          foodResult.innerHTML = 'No restaurants found in the area.';
          document.getElementById('map').style.display = 'none';
        } else {
          if (marker) {
            marker.setMap(null);
          }
          
          const markers = [];
          
    // Extract restaurant information and add it to the page
          filteredRestaurants.forEach(restaurant => {
            const name = restaurant.name;
            const address = restaurant.address;
            const logoUrl = restaurant.logo_photos[0]; 
    // Create a div to hold restaurant information
            const restaurantInfo = document.createElement('div');
            restaurantInfo.className = 'restaurant-info';

    // Create an image element for the logo
            const logoImg = document.createElement('img');
            logoImg.src = logoUrl;
            logoImg.alt = `${name} Logo not available`;
            logoImg.className = 'restaurant-logo';

    // Create a div for text information
            const textInfo = document.createElement('div');
            textInfo.className = 'text';
            textInfo.textContent = `Name: ${name}`;

    // Append the logo and text information to the restaurant info div
            restaurantInfo.appendChild(logoImg);
            restaurantInfo.appendChild(textInfo);

            if (marker) {
                marker.setMap(null);
              }
              
              const markers = [];
              
    // Extract restaurant information and add it to the page
              filteredRestaurants.forEach(restaurant => { 
                const lat = parseFloat(restaurant.address.lat);
                const lng = parseFloat(restaurant.address.lon);

                const restaurantMarker = new google.maps.Marker({
                  position: { lat, lng},
                  map: map,
                  title: "Map"
              });

                markers.push(restaurantMarker);
             
            });

            const bounds = new google.maps.LatLngBounds();
            markers.forEach(marker => bounds.extend(marker.getPosition()));
            map.fitBounds(bounds);

            foodResult.appendChild(restaurantInfo);

        });

    }
        loadingMessage.style.display = 'none';
}

    const homeInputs = document.getElementById('homeInputs');
    const restaurantInputs = document.getElementById('restaurantInputs');
    const searchButton = document.getElementById('searchButton');
                    
    // Event listener for radio buttons
    document.getElementsByName('choice').forEach(function(radio) {
        radio.addEventListener('click', function() {
            if (this.value === 'home') {
                homeInputs.style.display = 'block'
                loadingbutton.style.display = 'block';
                restaurantInputs.style.display = 'none';
                document.getElementById('map').style.display = 'none';
                foodResult.style.display = 'none';

            } else if (this.value === 'restaurant') {
                homeInputs.style.display = 'none';
                loadingbutton.style.display = 'block';
                restaurantInputs.style.display = 'block';
                document.getElementById('map').style.display = 'block';
                foodResult.style.display = 'none';
            }
            });
        });
    // Event listener for the search button
    searchButton.addEventListener('click', function() {
    const choice = document.querySelector('input[name="choice"]:checked').value;
    if (choice === 'home') {
        searchForFood();
        foodResult.style.display = 'block';
    } 
    if (choice === 'restaurant') {
        searchForRestaurants();
        foodResult.style.display = 'block';
    }
});
