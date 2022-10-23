export function parseEnvironmentVariables() {
  let config: any

  return {
    name: 'parse-environment-variables',

    configResolved(resolvedConfig: any) {
      config = resolvedConfig
      const env = config.env

      config.env = Object.keys(env).reduce((a, b) => {
        let parsed = config.env[b]

        try {
          parsed = JSON.parse(config.env[b])
          // eslint-disable-next-line no-empty
        } catch {}

        return {
          ...a,
          [b]: parsed,
        }
      }, {})

      return config
    },
  }
}
