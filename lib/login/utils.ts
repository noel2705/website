export const generateCode = () => {
    const c = Math.random().toString(36).substring(2, 8).toUpperCase()
    return c
}