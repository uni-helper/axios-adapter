import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  rules: {
    'pnpm/yaml-enforce-settings': 'off',
  },
})
