// Proxy URL used by this code
const proxyUrl = "https://stalewall.spacefell.workers.dev/?proxy"

// Settings elements
const wTxt = document.getElementById("setWidth");
const hTxt = document.getElementById("setHeight");
const qTxt = document.getElementById("setQuality");
const wallSect = document.getElementById("wallSect");
const provChkbox = document.getElementsByClassName("providers");

// Result elements
const descTxt = document.getElementById("desc");
const authorTxt = document.getElementById("authorTxt");
const provTxt = document.getElementById("provTxt");
const imgTag = document.getElementById("image");
const infoBox = document.getElementById("infoBox");

// Parses the api json and sets all the elements
async function getWall() {
    try {
        const json = await getImgUrl(buildUrl());
        // Cleanup before setting new image
        imgTag.src = "";
        descTxt.innerHTML = "";
        authorTxt.removeAttribute("href");
        provTxt.removeAttribute("href");

        // Set new values
        imgTag.src = json["url"];
        provTxt.innerHTML = json["provider"].charAt(0).toUpperCase() + json["provider"].slice(1);
        authorTxt.innerHTML = json["info"]["credits"]["copyright"];

        // Add href to text at bottom of image
        if ("urls" in json["info"]["credits"]) {
            const urls = json["info"]["credits"]["urls"];
            // Add author url to copyright text
            if ("author" in urls) {
                authorTxt.href = urls["author"];
            }
            // Add image url to provider text
            if ("image" in urls) {
                provTxt.href = urls["image"];
            }
        }

        // Add descriptions to "Info" section
        if ("desc" in json["info"]) {
            const desc = json["info"]["desc"];
            if ("title" in desc) {
                descTxt.innerHTML += `Title: ${desc["title"]}<br>`;
            }
            if ("short" in desc) {
                descTxt.innerHTML += `Short: ${desc["short"]}<br>`;
            }
            if ("long" in desc) {
                descTxt.innerHTML += `Long: ${desc["long"]}<br>`;
            }
        }

        // Hide info section if no description is returned
        if (descTxt.innerHTML === "") {
            infoBox.style.display = "none";
        } else {
            infoBox.style.display = "block";
        }

        // Make the article visible
        wallSect.style.display = "block";
    } catch (e) {
        console.error(e);
        alert("Failed to get wallpaper, check your settings and try again.");
    }
}

// Takes settings from the settings section and builds an api url out of them (keeps proxy enabled because of cors)
function buildUrl() {
    // loads proxyurl
    const apiUrl = new URL(proxyUrl);
    const provArr = [];

    // appends providers
    for (const pr of provChkbox) {
        if (pr.checked) provArr.push(pr.id);
    }
    apiUrl.searchParams.append("prov", provArr.join(","));

    // appends resolution if available
    if (wTxt.value !== "" && hTxt.value !== "") apiUrl.searchParams.append("res", `${wTxt.value}x${hTxt.value}`);

    // appends quality
    apiUrl.searchParams.append("quality", qTxt.value);
    return apiUrl.toString();
}

// Gets the json and returns it
async function getImgUrl(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch json");
    return res.json();
}

// Set resolution to display res
wTxt.value = window.screen.width;
hTxt.value = window.screen.height;