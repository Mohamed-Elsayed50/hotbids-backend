"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function capitalizeString(str) {
    if (!str)
        return '';
    const words = str.toLowerCase().split(' ');
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    return words.join(' ');
}
exports.default = capitalizeString;
//# sourceMappingURL=capitalizeString.js.map