export const fetchToken = async (host: string) => {
    const response = await fetch(`${host}/token`);
    const body = await response.json();
    return body.token;
}