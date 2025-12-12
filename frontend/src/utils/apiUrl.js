
export function getAPIURL() {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    if (host === "localhost" || host === "127.0.0.1") {
        return `${protocol}//${host}:8000/api`;
    }
    return `${protocol}//${host}/api`;
}

