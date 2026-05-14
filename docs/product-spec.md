# 5G-A Private Network Intelligent Configuration Platform — Product Specification

# 5G-A 专网智能配置平台 — 产品设计说明书

**Version / 版本:** 1.0  
**Scenario / 场景:** Industrial baijiu bottling line (vision eMBB, PLC uRLLC, RedCap sensors, local MEC, 5G LAN)  
**UX Metaphor / 体验隐喻:** Enterprise router admin (WAN/LAN mental model), configuring 5G-A–native capabilities instead of only L3 IP.

---

## 1. Information Architecture — Left Navigation

## 1. 信息架构 — 左侧导航树

```
专网概览 (Dashboard)
网络切片 (Network Slicing)
  ├ 切片模板库 (Slice Templates)
  ├ 切片实例 (Slice Instances)
  └ SLA / 保障策略 (SLA Profiles)
RedCap 终端 (RedCap Terminals)
  ├ 在线终端 (Online Inventory)        ← metaphor: DHCP client list
  ├ 省电与寻呼策略 (Power & Paging)
  └ 分组与准入 (Groups & Admission)
MEC 与路由 (MEC & Routing)
  ├ 本地数据面节点 (Local Data Plane)
  ├ 分流 / 卸载规则 (Offload Rules)    ← metaphor: static / policy routing
  └ 边缘应用与服务 (Edge Apps) [可选]
5G LAN / 虚拟网络 (5G LAN / VN)
  ├ VN 组 (Virtual Network Groups)     ← metaphor: VLAN / same switch
  ├ 成员与绑定 (Members & Bindings)
  └ 与切片关联 (Slice Association)
系统与运维 (System & Operations)
  ├ 操作员与角色 (Operators & RBAC)
  ├ 配置版本与下发队列 (Versions & Provisioning Queue)
  ├ 审计日志 (Audit Log)
  └ 北向 API 令牌 (Northbound API Tokens)
```

**Dashboard KPIs / 概览指标:** slice health, RedCap online count, MEC offload hit rate, VN group status, active alarms (summaries only; drill-down to modules).

---

## 2. Module — Network Slicing

## 2. 模块 — 网络切片

### 2.1 Operator Metaphor / 操作隐喻

Each slice is a **logical dedicated line** (like a virtual WAN policy): one S-NSSAI + DNN + QoS bundle bound to a business (vision vs PLC).

### 2.2 List Columns / 列表字段

| Field (EN) | 中文说明 |
|------------|----------|
| Display Name | 切片显示名 |
| S-NSSAI (preview) | SST+SD 组合预览 |
| SST | 切片类型（eMBB/uRLLC/mMTC 等映射） |
| Default DNN | 默认数据网络名称 |
| Bound Terminals | 关联终端数 |
| Status | 草稿 / 已下发 / 异常 |

**Row actions / 行操作:** Edit, Clone, **Provision**, **Rollback** (when versioned), Delete (draft only).

### 2.3 Create / Edit Form — Core Fields / 新建与编辑表单

| Section | Field (EN) | Control | Validation / Notes |
|---------|------------|---------|-------------------|
| Identity | displayName, description | text, textarea | required name, max length |
| 3GPP ID | sst (mapped enum), sd (optional hex) | select, text (advanced) | SD format `^[0-9A-Fa-f]{6}$` when present |
| Preview | snssai (read-only) | label | derived from SST+SD |
| Data Network | dnn, ladnAllowed | text, switch | DNN pattern per operator policy |
| Bandwidth | ulGbr, dlGbr, ulMbr, dlMbr, ambr | number + unit | GBR ≤ MBR; warn if vision profile under-provisioned |
| Latency / Reliability | fiveQiPreset or custom 5QI | select / advanced | uRLLC preset for PLC |
| Priority | arpLevel (or Low/Med/High) | select | maps to ARP semantics in backend |
| Members | redcapGroupIds, supiBulkCsv, cpeIds | multi-select, upload | at least one binding method recommended |
| Actions | Validate, Save Draft, **Provision**, **Rollback** | buttons | Provision opens confirm + dry-run summary |

### 2.4 Industrial Wizard (Optional) / 产线向导（可选）

One-click creates two draft slices: **Vision-eMBB** and **PLC-uRLLC** with recommended defaults; operator only assigns member groups and tunes GBR/MBR.

### 2.5 Copy / 文案提示

- Tooltip on SST: explain impact on RAN/core selection (high-level, non-academic).
- Warning if duplicate S-NSSAI+DNN in same tenant.

---

## 3. Module — RedCap Terminal Group

## 3. 模块 — RedCap 终端群组

### 3.1 List (DHCP-like) / 在线终端列表

| Column (EN) | 中文说明 |
|---------------|----------|
| alias | 终端别名 |
| supi / imeisv | 标识 |
| sliceName, vnName | 接入切片 / VN |
| ipAddress | 终端 IP（若分配） |
| rrcState | RRC / CM 状态摘要 |
| signalQuality | 信号质量（RSRP 等等级） |
| trafficTotal | 流量累计（周期可配） |
| edrxState | eDRX 生效状态 |
| powerProfileName | 省电策略模板 |
| lastSeenAt | 最后活跃时间 |

**Row actions:** Details drawer, Apply profile, Move VN, **Force detach** (RBAC + confirm).

### 3.2 Detail Drawer / 终端详情抽屉

- **Connection:** gNB id (friendly), TAC, slice, DNN.
- **Power:** eDRX cycle, PTW, DRX, optional PSM (feature-flag), **recommended app heartbeat** with help text: align heartbeat with paging cycle to avoid false offline.
- **Ops:** Refresh, Detach (guarded), Apply template, Add/remove VN.

### 3.3 Power Profile Templates / 省电策略模板

| Field | Control | Validation |
|-------|---------|------------|
| templateName | text | unique per tenant |
| deviceTypeTag | select (level meter, thermometer, …) | optional filter |
| edrxCycle, ptw, drx, psm | numeric / enum | cross-check: warn if heartbeat < suggested minimum |

**Batch:** assign template to group; show preview count of affected terminals.

---

## 4. Module — MEC Traffic Offload & Routing

## 4. 模块 — MEC 分流与路由

### 4.1 Local Node Form / 本地节点

| Field (EN) | 说明 |
|------------|------|
| nodeName | MEC 节点显示名 |
| n6LocalEndpoint | 本地 N6 / 分流接口 |
| dnnIds | 关联 DNN 多选 |
| capabilityTags | UPF 能力标签（LCL/N6 breakouts 等，实现依赖北向） |
| healthProbe | HTTP/TCP 探测配置 |

### 4.2 Offload Rules Table / 分流规则表

| Column | 说明 |
|--------|------|
| priority | 规则优先级（升序/降序可配置，冲突提示） |
| name | 规则名 |
| matchSummary | 匹配条件摘要 |
| actionSummary | 动作摘要 |
| hitCount | 命中统计（占位可 Mock） |
| enabled | 开关 |

### 4.3 Rule Editor — Match / 匹配条件（可组合）

- destIpCidrs, srcIpCidrs  
- protocol (TCP/UDP/ANY), portRanges  
- terminalGroupId or supiList  
- optional vlanId / vnId  
- optional dpiCategoryId (hidden unless DPI integration enabled)

### 4.4 Rule Editor — Action / 动作

- actionType: `LOCAL_BREAKOUT` | `NEXT_HOP` | `MIRROR`  
- nextHop: local soft router VIP / service VIP  
- bypassPublicNetwork: boolean  
- mirrorTarget (optional)

**UI copy / 界面文案:** use **「策略路由表」**、**「本地直转表」** in secondary help.

---

## 5. Module — 5G LAN / VN

## 5. 模块 — 5G LAN / 二层虚拟网络

### 5.1 VN List / VN 组列表

| Column | 说明 |
|--------|------|
| displayName | VN 显示名 |
| technicalId | 技术 ID（只读或高级可编辑） |
| linkedSliceName | 关联切片 |
| memberCount | 成员数 |
| status | active / provisioning / error |

### 5.2 VN Form / 表单

- **Identity:** displayName, technicalId (policy: readonly in v1 unless adapter allows).  
- **L2 behavior:** ethernetPduAllowed, broadcastPolicy (`ALLOW` | `LIMITED` | `DENY`), multicastPolicy.  
- **Risk confirm:** enabling broadcast shows **strong confirmation** (PLC requirement vs storm risk).  
- **Members:** pick from onboarded CPE/modules; show role Bridged/Routed if applicable.

**Metaphor copy:** 「同一虚拟交换机」「同一广播域」.

---

## 6. Global UX, Safety, Security

## 6. 全局交互、风险与安全

### 6.1 Configuration Lifecycle / 配置流

`Draft → Validate (duplicate S-NSSAI, overlapping rules) → Provisioning Queue → Result per job → Export error report`

### 6.2 RBAC (v1 scope) / 权限范围

- `viewer`: read all.  
- `operator`: edit drafts, provision non-destructive rules.  
- `admin`: slice/VN changes, force detach, token management.

### 6.3 Audit Log (SIEM-friendly) / 审计日志

Log fields in **English** keys: `actor`, `action`, `resourceType`, `resourceId`, `diff`, `result`, `traceId`, `timestamp`.

### 6.4 Risk Highlights / 风险提示

- L2 broadcast amplification.  
- Policy routing / offload misconfiguration loops or blackholes.  
- Aggressive eDRX/PSM causing apparent disconnects.

### 6.5 Demo validation & truth feedback (5G-A–aligned) / 演示校验与真相反馈

This release is **demonstration-only** (no live NE). The API runs **shared semantic checks** before slice provisioning: GBR/MBR/AMBR consistency, 6-digit hex `SD` when present, SST vs 5QI coherence (uRLLC 5QI ranges 65–69 and 80–83; eMBB must not use URLLC-type 5QI), duplicate S-NSSAI+DNN in tenant, and a demo DNN rejection when the name contains `invalid`.

Successful or failed **asynchronous slice jobs** attach a **`ProvisionReport`** (`correlationId`, English `summary`, `configEcho`, simulated `NSSF/PCF/SMF/UPF/AMF` steps). The UI polls `GET /api/provisioning/jobs/:id` and opens a **truth feedback** modal. MEC rules, 5G LAN VN create/update, and RedCap profile apply return the same report shape synchronously (`data` + `report`).

本版本为**演示**，不接真实网元。切片下发前执行**统一的 5G-A 语义校验**（GBR/MBR/AMBR、`SD` 六位 hex、SST 与 5QI 一致性、租户内 S-NSSAI+DNN 唯一性、DNN 含 `invalid` 演示拒绝）。异步下发任务附带 **`ProvisionReport`**（`correlationId`、英文 `summary`、`configEcho`、模拟网元步骤）。前端轮询任务详情并弹出**真相反馈**弹窗。MEC 规则、5G LAN VN、RedCap 省电套用同步返回 `data` + `report`。

---

## 7. Non-Goals (v1) / 本期不做

Full 3GPP EMS parameter parity; multi-vendor automatic discovery; real-time RAN drive-test integration.

---

## 8. Glossary Mapping (Product ↔ Engineering)

| Product Term | Engineering Note |
|--------------|------------------|
| Slice Instance | `NetworkSlice` + version + provision state |
| DHCP-like list | `RedCapDevice` inventory view |
| Static/Policy route | `MecOffloadRule` match + action |
| VLAN-like VN | `FiveGLanVn` + members |

---

*End of product specification document.*
