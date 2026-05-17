import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      /**
       * Off: standard `useEffect(() => { void load() }, [])` data-fetch triggers false positives.
       * 关闭：_mount 拉取列表是常见模式；该规则将异步里的 setState 也判为违规。
       */
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
