# react-fib-wasm

WASM で書いた非同期関数を React で使うサンプル。

関数はこれ:  
[heiwa4126/fib-wasm: Rust でフィボナッチ関数を書いて、wasm としてビルドしたものを、npm パッケージにする話](https://github.com/heiwa4126/fib-wasm)

非同期による更新をラップするため、
[Tanstack Query](https://tanstack.com/query/latest)
を使っている。

## 実行

```sh
vp i
vp dev
vp build && vp preview
```

### 表示例

![screenshot](docs/images/screenshot.png)

上は TypeScript だけで書いたボタン

クリックするたび増加した値でフィボナッチ数を計算する。
