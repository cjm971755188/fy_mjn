const devBaseURL = "http://1.15.89.163:3000"
const proBaseURL = "http://1.15.89.163:3000"

export const BASE_URL = process.env.NODE_ENV === 'development'?devBaseURL :proBaseURL

export const TIMEOUT = 5000