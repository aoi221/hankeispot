let map;
let circle;
let placesService;


function initMap() {
    var center = { lat: 35, lng: 136 };
    var mapOptions = {
        center: center,
        zoom: 10
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    placesService = new google.maps.places.PlacesService(map);

    map.addListener('click', function (event) {
        addCircle(event.latLng);
    });
}


function addCircle(location) {
    var radius = parseFloat(document.getElementById('radius').value);

    if (circle) circle.setMap(null);

    circle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: location,
        radius: radius
    });

    map.setCenter(location);
    searchPlaces(location, radius);
}


function locateUser() {
    var radius = parseFloat(document.getElementById('radius').value);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(userLocation);
            map.setZoom(10);
            // 現在地に新しいマーカーを設置
            if (circle) circle.setMap(null);
            circle = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                map: map,
                center: userLocation,
                radius: radius
            });

            searchPlaces(userLocation, radius);
        }, function () {
            alert('現在地の取得に失敗しました。');
        });
    } else {
        alert('お使いのブラウザは位置情報サービスをサポートしていません。');
    }
}


function selectType(type) {
    var touristButton = document.getElementById("touristButton");
    var restaurantButton = document.getElementById("restaurantButton");
    if (type === 'tourist_attraction') {
        touristButton.classList.add("active");
        restaurantButton.classList.remove("active");
    } else {
        restaurantButton.classList.add("active");
        touristButton.classList.remove("active");
    }
    selectedType = type;
}


function searchPlaces(location, radius) {
    var keyword = document.getElementById("keywordInput").value;
    var request = {
        location: location,
        radius: radius,
        type: [selectedType],
        language: 'ja'
    };

    // 飲食店の場合のみキーワードをリクエストに追加
    if (selectedType === "restaurant" && keyword.trim()) {
        request.keyword = keyword;
    }

    placesService.nearbySearch(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            displayPlaces(results);
        } else {
            alert("検索結果が見つかりませんでした。");
        }
    });
}

let markers = []; // マーカーを保持する配列

function displayPlaces(places) {
    const placesList = document.getElementById('places');
    const placesContainer = document.getElementById('places-container');
    placesList.innerHTML = '';
    clearMarkers();

    places.forEach(place => {
        let item = document.createElement('li');
        let content = place.name;
        if (place.rating) {
            content += ` ☆ ${place.rating}`;
        }
        item.textContent = content;
        item.onclick = function () {
            google.maps.event.trigger(markers[places.indexOf(place)], 'click');
        };
        placesList.appendChild(item);
        addMarker(place);
    });

    if (places.length > 0) {
        placesContainer.classList.remove('hidden');
    } else {
        placesContainer.classList.add('hidden');
    }
}

function addMarker(place) {
    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        title: place.name
    });
    markers.push(marker); // マーカーを配列に追加

    // マーカーをクリックしたときのイベント
    google.maps.event.addListener(marker, 'click', () => {
        const placeUrl = encodeURI(`https://www.google.com/maps/search/${place.name}/@${place.geometry.location.lat()},${place.geometry.location.lng()},17z?entry=ttu`);
        window.open(placeUrl, '_blank'); // 新しいタブでGoogle Mapsの場所のページを開く
    });
}

function clearMarkers() {
    for (let marker of markers) {
        marker.setMap(null); // マーカーを地図から削除
    }
    markers = []; // マーカーの配列をクリア
}

function closePlaces() {
    const placesContainer = document.getElementById("places-container");
    placesContainer.classList.add('hidden'); 
}

function showInstructions() {
    const instContainer = document.getElementById("instructions-container");
    instContainer.style.opacity = '1';
    instContainer.style.visibility = 'visible';
}

function closeInstructions() {
    const instContainer = document.getElementById("instructions-container");
    instContainer.style.opacity = '0';
    instContainer.style.visibility = 'hidden';
}
