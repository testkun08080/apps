/**
 * インライン `<script>` に埋め込む JSON 文字列を返す。
 * `JSON.stringify` だけだと値に `</script>` や `<!--` が含まれたとき
 * script 要素を抜け出せてしまうため、`<` `>` `&` と行区切り文字をエスケープする。
 */
export function jsonForInlineScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
