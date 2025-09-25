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

export async function fetchGameDetail(url) {
    const resp = await fetch(url, fetchOptions);
    const respJson = await resp.json();
    return respJson;
}

export async function startGameSession(gameId) {
    const resp = await fetch(`/games/session/start/${gameId}/`, {
        ...fetchOptions,
        'method': 'POST',
    });
    const respJson = await resp.json();
    return respJson;
}

export async function endGameSession() {
    const resp = await fetch('/games/session/end/', {
        ...fetchOptions,
        'method': 'POST',
    });
    const respJson = await resp.json();
    return respJson;
}

export async function fetchGameSessionStatistics(gameSessionId) {
    const resp = await fetch(`/games/session/${gameSessionId}/statistics/`, {
        ...fetchOptions,
    });
    const respJson = await resp.json();
    return respJson;
}

export async function sendQuestionAnswers(questionId, answerChoices) {
    const resp = await fetch(`/games/quiz_question/${questionId}/answer/`, {
        ...fetchOptions,
        method: 'POST',
        body: JSON.stringify(answerChoices)
    });
    const respJson = await resp.json();
    return respJson;
}

