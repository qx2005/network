import type { ThemeConfig } from 'antd'

/**
 * Ant Design tokens — slate-teal industrial console.
 * 冷静灰蓝 + 青绿强调，适合网络运维类后台。
 */
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#0d9488',
    colorInfo: '#0e7490',
    colorSuccess: '#059669',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorTextBase: '#0f172a',
    colorTextSecondary: '#475569',
    colorTextTertiary: '#64748b',
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',
    borderRadius: 9,
    borderRadiusLG: 14,
    fontFamily:
      '"Plus Jakarta Sans", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif',
    fontFamilyCode:
      '"JetBrains Mono", "Cascadia Code", "Consolas", monospace',
    fontSize: 14,
    lineHeight: 1.6,
    wireframe: false,
    controlHeight: 36,
    motionDurationMid: '0.2s',
  },
  components: {
    Layout: {
      headerBg: 'transparent',
      headerHeight: 58,
      headerPadding: '0 24px',
      triggerBg: 'transparent',
    },
    Menu: {
      iconSize: 17,
      iconMarginInlineEnd: 12,
      itemBorderRadius: 10,
      collapsedIconSize: 17,
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'var(--app-sider-accent-dim)',
      darkItemSelectedColor: '#f8fafc',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.06)',
      darkItemColor: 'rgba(248, 250, 252, 0.78)',
      darkSubMenuItemBg: 'rgba(0, 0, 0, 0.12)',
    },
    Card: {
      borderRadiusLG: 14,
      paddingLG: 24,
      headerFontSize: 15,
    },
    Table: {
      headerBg: '#f1f5f9',
      headerColor: '#334155',
      headerSplitColor: '#e2e8f0',
      rowHoverBg: '#f0fdfa',
      borderRadius: 12,
      cellPaddingBlock: 14,
      cellPaddingInline: 16,
    },
    Button: {
      primaryShadow: '0 2px 6px rgba(13, 148, 136, 0.22)',
      contentFontSize: 14,
    },
    Modal: {
      titleFontSize: 17,
      borderRadiusLG: 14,
    },
    Select: {
      optionSelectedBg: 'rgba(13, 148, 136, 0.1)',
    },
    Typography: {
      titleMarginTop: '0.6em',
      titleMarginBottom: '0.4em',
    },
    Form: {
      labelFontSize: 13,
      verticalLabelPadding: '0 0 6px',
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Breadcrumb: {
      itemColor: '#64748b',
      lastItemColor: '#0f172a',
      linkColor: '#64748b',
      linkHoverColor: '#0d9488',
      separatorColor: '#cbd5e1',
      fontSize: 13,
    },
    Statistic: {
      contentFontSize: 28,
    },
  },
}
