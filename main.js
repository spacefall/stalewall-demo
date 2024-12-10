const debug = false;
const wTxt = document.getElementById("width");
const hTxt = document.getElementById("height");
const qTxt = document.getElementById("quality");
const wallpaperArticle = document.getElementById("wallpaper");
const providerChecks = document.getElementsByClassName("providers");
const copyTag = document.getElementById("spancopyright");
const descTag = document.getElementById("spandescription");
const imgTag = document.getElementById("imgwallpaper");
const proxyUrl = debug ? "http://localhost:3000" : "https://stalewall.spacefell.workers.dev/?proxy"

async function getWall() {
    wallpaperArticle.style.display = "none";
    try {
        const url = buildUrl();
        const [imgUrl, copyright, desc] = await getImgUrl(url);
        copyTag.innerText = copyright;
        descTag.innerText = desc.join("\n");
        imgTag.src = imgUrl;
    } catch (e) {
        console.error(e);
        alert("Failed to get wallpaper, check your settings and try again.");
    }
    wallpaperArticle.style.display = "block";
}

function buildUrl() {
    // loads proxyurl
    const apiUrl = new URL(proxyUrl);
    const provArr = [];

    // appends providers
    for (const pr of providerChecks) {
        if (pr.checked) provArr.push(pr.id);
    }
    apiUrl.searchParams.append("prov", provArr.join(","));

    // appends resolution if available
    if (wTxt.value !== "" && hTxt.value !== "") apiUrl.searchParams.append("res", `${wTxt.value}x${hTxt.value}`);

    // appends quality
    apiUrl.searchParams.append("quality", qTxt.value);
    return apiUrl.toString();
}

// Unpacks the json in 3 strings: image url, copyright info and descriptions
async function getImgUrl(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch json");
    const jsonRes = await res.json();

    // provider (copyright string)
    const provReturned = jsonRes["provider"];
    const provName = provReturned.charAt(0).toUpperCase() + provReturned.slice(1);

    // copyright + links
    let copyright = `By ${jsonRes["info"]["credits"]["copyright"]} on ${provName}`;
    if ("urls" in jsonRes["info"]["credits"]) {
        if ("author" in jsonRes["info"]["credits"]["urls"]) {
            copyright += ` (authorUrl: ${jsonRes["info"]["credits"]["urls"]["author"]})`;
        }
        if ("image" in jsonRes["info"]["credits"]["urls"]) {
            copyright += ` (imageUrl: ${jsonRes["info"]["credits"]["urls"]["author"]})`;
        }
    }

    // descriptions
    let desc = [];
    if ("title" in jsonRes["info"]["desc"]) {
        desc.push(`Title: ${jsonRes["info"]["desc"]["title"]}`);
    }
    if ("short" in jsonRes["info"]["desc"]) {
        desc.push(`Short description: ${jsonRes["info"]["desc"]["short"]}`);
    }
    if ("long" in jsonRes["info"]["desc"]) {
        desc.push(`Long description: ${jsonRes["info"]["desc"]["long"]}`);
    }

    return [jsonRes["url"], copyright, desc];
}