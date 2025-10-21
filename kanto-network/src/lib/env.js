export const getEnv = (name, defaultValue = null) => {
  return import.meta.env[name] || defaultValue
}
