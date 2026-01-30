export async function fetcher(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('An error occurred while fetching the data.');
    }
    return res.json();
}

export async function postData(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'An error occurred while posting the data.');
    }

    return res.json();
}
