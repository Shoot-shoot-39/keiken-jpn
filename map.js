```javascript
// 地図を作成
// [緯度, 経度], ズームレベル
const map = L.map('map').setView([35.68, 139.76], 10);


// 地理院地図（標準地図）を表示
L.tileLayer(
    'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
    {
        maxZoom: 18,
        attribution:
            '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>'
    }
).addTo(map);


// dataフォルダ内のGeoJSONを読み込む
fetch('./data/mydata.geojson')
    .then(response => {

        // ファイルが見つからない場合などをエラーにする
        if (!response.ok) {
            throw new Error(
                `GeoJSONの読み込みに失敗しました: HTTP ${response.status}`
            );
        }

        return response.json();
    })

    .then(data => {

        // GeoJSONを地図上に表示
        const geojsonLayer = L.geoJSON(data, {

            // 線・ポリゴンの表示設定
            style: {
                color: '#ff0000',
                weight: 3,
                fillOpacity: 0.2
            }

        }).addTo(map);

        // GeoJSONが存在する範囲に地図を移動
        if (geojsonLayer.getBounds().isValid()) {
            map.fitBounds(geojsonLayer.getBounds());
        }
    })

    .catch(error => {
        console.error(error);
        alert(error.message);
    });
```
