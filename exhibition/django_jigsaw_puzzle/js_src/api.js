const fetchOptions = {
    method: 'GET',
    headers: {
	'Accept': 'application/json',
	'X-Requested-With': 'XMLHttpRequest', // Indicating it's an AJAX request
	'cache': 'no-cache',
	'pragma': 'no-cache'
    },
};

export const fetchImagePaths = async (imageUrl) => {
    const resp = await fetch(imageUrl, fetchOptions);
    const images = await resp.json();
    let images2 = [];

    for (let image_id in images) {
	images2.push(images[image_id]);
    }
    
    return images2;
}

export async function fetchGameData(url) {
    const resp = await fetch(url, fetchOptions);
    const respJson = await resp.json();
    return respJson;
}
