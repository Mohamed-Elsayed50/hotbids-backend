export default function capitalizeString(str: string | null): string {
    if (!str) return ''
    const words = str.toLowerCase().split(' ');

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }

    return words.join(' ')
}
