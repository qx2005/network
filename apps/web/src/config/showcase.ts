/**
 * Showroom console: simulated pipeline + synthetic receipt when API omits data.
 * Set VITE_SHOWCASE_CONSOLE=false for integration / real northbound demos.
 * 展示台默认开启；接入真实北向时在构建环境设为 false。
 */
export function isShowcaseConsole(): boolean {
  return import.meta.env.VITE_SHOWCASE_CONSOLE !== 'false'
}
