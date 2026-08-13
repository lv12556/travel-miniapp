export const ok = (res, data, message = 'ok') => res.json({ code: 0, message, data })
export const fail = (res, status, message, details) => res.status(status).json({ code: status, message, details })
