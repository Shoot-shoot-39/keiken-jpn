// 地図を作成
const map = L.map('map').setView([35.68, 139.76], 10);


// 地理院地図・標準地図
const gsiLayer = L.tileLayer(
    'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
    {
        maxZoom: 18,
        attribution:
            '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>'
    }
).addTo(map);


// GeoJSONを読み込む
fetch('data/mydata.geojson')
    .then(response => response.json())
    .then(data => {

        L.geoJSON(data, {
            style: {
                color: '#ff0000',
                weight: 3,
                fillOpacity: 0.2
            }
        }).addTo(map);

    })
    .catch(error => {
        console.error('GeoJSONの読み込みに失敗しました:', error);
    });
