const createNewMessageInSupportNotificationContent = (username: string, text: string = '') => {
    const _text = text.length > 8 ? `${text.substr(0, 8)}...` : text

    return {
        content: `A new message from <em><strong>${username}: ${_text}</strong><em>.`,
        url: `/support?user=${username}`
    }
}

export {
    createNewMessageInSupportNotificationContent,
}

