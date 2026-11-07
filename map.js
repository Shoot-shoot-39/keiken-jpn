// ==========================================================
// 地理院地図
// ==========================================================

const map = L.map("map", {
    center: [35.5, 137.0],
    zoom: 5
});


// ==========================================================
// 地理院地図タイル
// ==========================================================

const gsiLayer = L.tileLayer(
    "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
    {
        attribution:
            '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>'
    }
);

gsiLayer.addTo(map);


// ==========================================================
// 経県値 → 色
// ==========================================================

const keikenColors = {

    0: null,          // 無色

    1: "#87CEFA",     // 水色
    2: "#9ACD32",     // 黄緑
    3: "#FFD700",     // 黄色
    4: "#FF8C00",     // 濃いオレンジ
    5: "#FF69B4"      // ピンク
};


// ==========================================================
// 経県値に応じたスタイル
// ==========================================================

function getKeikenStyle(feature) {

    const keiken = Number(feature.properties.keiken);
    const color = keikenColors[keiken];

    // 経県値0
    if (!color) {

        return {
            fill: false,
            fillOpacity: 0,
            color: "#666666",
            weight: 1,
            opacity: 0.5
        };
    }

    // 経県値1～5
    return {
        fillColor: color,
        fillOpacity: 0.5,

        // 市町村境界
        color: "#555555",
        weight: 1,
        opacity: 0.7
    };
}


// ==========================================================
// GeoJSONの読み込み
// ==========================================================

const regionFiles = [
    "01_hokkaido.geojson",
    "02_tohoku.geojson",
    "03_kanto.geojson",
    "04_hokuriku.geojson",
    "05_chubu.geojson",
    "06_kinki.geojson",
    "07_chugoku.geojson",
    "08_shikoku.geojson",
    "09_kyushu.geojson",
    "10_okinawa.geojson"
];


async function loadGeoJSON(filename) {

    const response = await fetch(
        `data/${filename}`
    );

    if (!response.ok) {
        throw new Error(
            `${filename} の読み込みに失敗しました`
        );
    }

    return await response.json();
}


// ==========================================================
// 全地方を読み込む
// ==========================================================

async function loadAllRegions() {

    const layers = [];

    for (const filename of regionFiles) {

        console.log(`読み込み中: ${filename}`);

        const data = await loadGeoJSON(filename);

        const layer = L.geoJSON(data, {

            style: getKeikenStyle,

            onEachFeature: function(feature, layer) {

                const name =
                    feature.properties.name;

                const keiken =
                    feature.properties.keiken;

                layer.bindPopup(
                    `<b>${name}</b><br>` +
                    `経県値: ${keiken}`
                );
            }
        });

        layer.addTo(map);

        layers.push(layer);
    }

    console.log("全地方の読み込み完了");

    return layers;
}


// ==========================================================
// 実行
// ==========================================================

loadAllRegions().catch(function(error) {

    console.error(error);

    alert(
        "GeoJSONの読み込み中にエラーが発生しました。"
    );
});