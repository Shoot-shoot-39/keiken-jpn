// ==========================================================
// 地図の初期設定
// ==========================================================

const map = L.map("map", {
    center: [35.5, 137.0],
    zoom: 5
});


// ==========================================================
// 背景地図
// ==========================================================

// 標準地図
const gsiStd = L.tileLayer(
    "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
    {
        attribution:
            '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>'
    }
);

// 淡色地図
const gsiPale = L.tileLayer(
    "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
    {
        attribution:
            '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>'
    }
);

// 初期状態は標準地図
gsiStd.addTo(map);


// 背景地図の切り替え
const baseMaps = {
    "標準地図": gsiStd,
    "淡色地図": gsiPale
};


// ==========================================================
// 経県値 → 色
// ==========================================================

const keikenColors = {

    // 0は塗りつぶしなし
    0: null,

    // 1～5
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

    const keiken = Number(
        feature.properties.keiken
    );

    const color = keikenColors[keiken];

    return {

        // 経県値0は塗りつぶしなし
        // それ以外は指定色
        fillColor: color || "#FFFFFF",

        // 0は透明、それ以外は50%
        fillOpacity: color ? 0.5 : 0,

        // すべての市町村で枠線を表示
        color: "#555555",
        weight: 1,
        opacity: 0.7
    };
}


// ==========================================================
// 地方GeoJSON
// ==========================================================

const regionFiles = {

    "北海道": "01_hokkaido.geojson",
    "東北":   "02_tohoku.geojson",
    "関東":   "03_kanto.geojson",
    "北陸":   "04_hokuriku.geojson",
    "中部":   "05_chubu.geojson",
    "近畿":   "06_kinki.geojson",
    "中国":   "07_chugoku.geojson",
    "四国":   "08_shikoku.geojson",
    "九州":   "09_kyushu.geojson",
    "沖縄":   "10_okinawa.geojson"
};


// ==========================================================
// 地方レイヤーを管理
// ==========================================================

// 読み込み済みのLeafletレイヤーを保存する。
// 一度読み込んだGeoJSONは再度fetchしない。
const regionLayers = {};


// 読み込み中かどうかを管理
const loadingRegions = {};


// ==========================================================
// GeoJSON読み込み
// ==========================================================

async function loadRegion(regionName) {

    // すでに読み込み済みなら、それをそのまま表示
    if (regionLayers[regionName]) {

        regionLayers[regionName].addTo(map);

        return;
    }


    // すでに読み込み処理中なら何もしない
    if (loadingRegions[regionName]) {
        return;
    }


    loadingRegions[regionName] = true;


    const filename = regionFiles[regionName];

    console.log(
        `${regionName} のGeoJSONを読み込みます: ${filename}`
    );


    try {

        const response = await fetch(
            `data/${filename}`
        );


        if (!response.ok) {

            throw new Error(
                `${filename} の読み込みに失敗しました`
            );
        }


        const data = await response.json();


        // LeafletのGeoJSONレイヤーを作成
        const layer = L.geoJSON(
            data,
            {

                style: getKeikenStyle,


                onEachFeature:
                    function(feature, layer) {

                        const name =
                            feature.properties.name;

                        const keiken =
                            feature.properties.keiken;


                        layer.bindPopup(
                            `<b>${name}</b><br>` +
                            `経県値: ${keiken}`
                        );
                    }
            }
        );


        // 保存
        regionLayers[regionName] = layer;


        // 地図に追加
        layer.addTo(map);


        console.log(
            `${regionName} の読み込み完了`
        );

    }
    catch (error) {

        console.error(
            `${regionName} の読み込みに失敗しました`,
            error
        );

        alert(
            `${regionName} のGeoJSON読み込みに失敗しました。`
        );
    }
    finally {

        loadingRegions[regionName] = false;
    }
}


// ==========================================================
// 地方レイヤーのON/OFF
// ==========================================================

function setRegionVisible(
    regionName,
    visible
) {

    if (visible) {

        // 必要なら読み込み
        loadRegion(regionName);

    }
    else {

        // すでに読み込まれている場合だけ削除
        if (regionLayers[regionName]) {

            map.removeLayer(
                regionLayers[regionName]
            );
        }
    }
}


// ==========================================================
// 地方ON/OFF用のチェックボックスを作成
// ==========================================================

const regionControl =
    L.control({
        position: "topright"
    });


regionControl.onAdd = function(map) {

    const container =
        L.DomUtil.create(
            "div",
            "leaflet-control-layers leaflet-control"
        );


    // 地方タイトル
    const title =
        L.DomUtil.create(
            "div",
            "",
            container
        );

    title.innerHTML =
        "<b>経県値</b>";


    // ------------------------------------------------------
    // 全ON
    // ------------------------------------------------------

    const allOnButton =
        L.DomUtil.create(
            "button",
            "",
            container
        );

    allOnButton.innerHTML =
        "全ON";


    allOnButton.style.margin =
        "4px 4px 4px 0";


    allOnButton.onclick =
        function(e) {

            e.stopPropagation();

            Object.keys(regionFiles)
                .forEach(function(regionName) {

                    const checkbox =
                        document.querySelector(
                            `input[data-region="${regionName}"]`
                        );

                    if (checkbox) {
                        checkbox.checked = true;
                    }

                    setRegionVisible(
                        regionName,
                        true
                    );
                });
        };


    // ------------------------------------------------------
    // 全OFF
    // ------------------------------------------------------

    const allOffButton =
        L.DomUtil.create(
            "button",
            "",
            container
        );

    allOffButton.innerHTML =
        "全OFF";


    allOffButton.onclick =
        function(e) {

            e.stopPropagation();

            Object.keys(regionFiles)
                .forEach(function(regionName) {

                    const checkbox =
                        document.querySelector(
                            `input[data-region="${regionName}"]`
                        );

                    if (checkbox) {
                        checkbox.checked = false;
                    }

                    setRegionVisible(
                        regionName,
                        false
                    );
                });
        };


    // ------------------------------------------------------
    // 地方チェックボックス
    // ------------------------------------------------------

    Object.keys(regionFiles)
        .forEach(function(regionName) {

            const label =
                L.DomUtil.create(
                    "label",
                    "",
                    container
                );

            label.style.display =
                "block";


            const checkbox =
                document.createElement(
                    "input"
                );

            checkbox.type =
                "checkbox";

            checkbox.dataset.region =
                regionName;


            // 初期状態
            // 関東だけON
            checkbox.checked =
                (regionName === "関東");


            checkbox.onchange =
                function() {

                    setRegionVisible(
                        regionName,
                        checkbox.checked
                    );
                };


            label.appendChild(
                checkbox
            );


            label.appendChild(
                document.createTextNode(
                    " " + regionName
                 )
            );

            container.appendChild(
                label
            );
        });


    // 地図操作がチェックボックスに
    // 伝播しないようにする
    L.DomEvent.disableClickPropagation(
        container
    );

    L.DomEvent.disableScrollPropagation(
        container
    );


    return container;
};


regionControl.addTo(map);


// ==========================================================
// 背景地図切り替えコントロール
// ==========================================================

L.control.layers(
    baseMaps,
    null,
    {
        position: "topleft"
    }
).addTo(map);


// ==========================================================
// 初期状態：関東だけ読み込む
// ==========================================================

loadRegion("関東");
