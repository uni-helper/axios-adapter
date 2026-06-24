# @uni-helper/axios-adapter

Axios adapter for uni-app — wraps `uni.request`, `uni.downloadFile`, `uni.uploadFile` so axios works across all uni-app platforms (H5, Mini Programs, App).

## Project

- **Language/runtime:** TypeScript (`target: esnext`, `strict`). Dev pins Node 24 via `.node-version`; no `engines` field is published, so consumers face no enforced Node floor (CONTRIBUTING names >= 18 as the stated minimum).
- **Toolchain:** tsdown (build), vitest (test), MSW (mock), @antfu/eslint-config (lint), pnpm 10.34.4 (pinned via `packageManager`).
- **Package:** `@uni-helper/axios-adapter` — three entry points (`.` / `./vite` / `./webpack`), each shipped dual ESM + CJS with bundled `.d.ts`.
- **Peer deps:** `axios ^1.18.0`, `vite ^5.0.0`.
- **Workspace:** pnpm workspace with `playground/` as the only member; versions centralized via `catalog:` in `pnpm-workspace.yaml`.

## Commands

```bash
pnpm build          # tsdown → dist/ (ESM + CJS + dts)
pnpm dev            # tsdown --watch
pnpm test           # vitest
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint .
pnpm lint:fix       # eslint . --fix
pnpm play           # cd playground && npm run dev:h5
```

## Architecture

| Module | Role |
|---|---|
| `src/index.ts` | Entry — exports `createUniAppAxiosAdapter()`, mounts `upload`/`download` on `Axios.prototype` (global side effect; repeat calls re-mount identical methods, harmless) |
| `src/methods/index.ts` | `getMethod()` routes by `getMethodType()` → `request` / `download` / `upload` |
| `src/methods/request.ts` | `uni.request` handler |
| `src/methods/download.ts` | `uni.downloadFile` handler |
| `src/methods/upload.ts` | `uni.uploadFile` handler |
| `src/methods/onCanceled.ts` | CancelToken + AbortController wiring |
| `src/utils.ts` | `getMethodType`, `resolveOptions`, `resolveUniAppRequestOptions` (config → uni params), `serializeObject`, `progressEventReducer`, `forEach` (ported from axios internals) |
| `src/types.ts` | Public types: `UserOptions`, `ResolvedOptions`, `MethodType`, `Method`, `SerializeOptions`, `UniNetworkRequestWithoutCallback` |
| `src/globalExtensions.ts` | Module augmentation on `axios` — extends `AxiosRequestConfig` with uni-app options, adds `upload`/`download` to `Axios` |
| `src/unplugin.ts` | Build plugin (unplugin) — see below |
| `src/vite.ts` / `src/webpack.ts` | Thin re-exports of `unplugin.vite` / `unplugin.webpack` |

### unplugin transform

Active only when `process.env.UNI_PLATFORM` includes `mp` (mini-program builds). Performs three build-time replacements:

1. `form-data/lib/browser.js`: `window` → `globalThis` (mini-programs have no `window`).
2. `axios/.../FormData.js`: import `miniprogram-formdata` if installed, else stub an empty `class FormData`.
3. `axios/.../Blob.js`: import `miniprogram-blob` if installed, else stub an empty `class Blob`.

`miniprogram-formdata` / `miniprogram-blob` are optional — detected via `local-pkg`'s `isPackageExists`; absence degrades gracefully to the empty stubs.

## Conventions

- **Linting:** @antfu/eslint-config (`type: 'lib'`), no Prettier. Committed `.vscode/settings.json` disables format-on-save and runs `source.fixAll.eslint` on save; stylistic rules are silenced in-editor but still auto-fixed.
- **Comments:** Chinese, concise, explain the "why" — match existing style.
- **Testing:** vitest + MSW for HTTP; `vi.stubGlobal('uni', mock)` in `test/setup.ts` simulates `uni.request` / `uni.downloadFile` / `uni.uploadFile` so tests run in pure Node. Prefer inline snapshots (`toMatchInlineSnapshot`).
- **Imports:** `// @ts-expect-error ignore` guards axios's undocumented internal modules (`axios/unsafe/...`).
- **Branches:** `feat/xxx`, `fix/xxx`, `docs/xxx`; Conventional Commits format.
- **Versioning:** Keep major.minor in sync with axios (adapter 1.18.x ↔ axios ^1.18.0).
