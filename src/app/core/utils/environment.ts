// Check development environment

const isDevelopmentMode = () => {
    return (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development');
}

export {
    isDevelopmentMode
}