# RedCap 工业省电模板 — 选型原则与预置参数

**代码位置**：`apps/api/src/redcap/redcap.service.ts` → `profiles`（演示种子 **三条**：`pp-env-sensor`、`pp-asset-tracker`、`pp-remote-smart-meter`）。域模型中 `PowerProfile.edrxEnabled === false` 表示 **不使用 eDRX**（控制台列表显示「禁用」），用于 **PSM + 超长周期上报** 类终端。

---

## 1. 工业场景原则（为何删掉机械臂/PLC/相机的“模板行”）

| 设备类别 | 供电与业务 | eDRX / 省电模板 |
|----------|------------|-----------------|
| 机械臂、PLC、远程 IO | 常电（220V/380V）、uRLLC / 二层工控 | **不适用** eDRX 周期模板；平台侧 **`edrxState: disabled`**，终端列表绑定 **「禁用省电模板」**。在「省电与寻呼策略」**不应**为这类设备生成一行可点选的 eDRX 预案。 |
| 工业相机、eMBB 大上行 | 常电、视频/视觉上行 | **同上**：不睡眠；禁用 eDRX 模板行。 |
| 边缘计算网关 | 常电 | **同上**。 |
| 液位计、温湿度等传感 | 电池或电池+太阳能、mMTC 小报文 | **适用** 长周期 eDRX + PSM + 稀疏心跳；与 **`slice-iot-miot`** 切片匹配。 |
| 资产定位标签、远端表计 | 电池、mMTC / 极稀疏上报 | **适用** 下表预置模板；按业务在「响应时延」与「续航」之间取舍（定位偏均衡，表计偏极致）。 |

> 列表里若出现「机械臂—40.96s eDRX」类行，会与 uRLLC 毫秒级控制语义**自相矛盾**，属于产品设计错误。

---

## 2. 预置模板（电池 / 低速物联）

### 2.1 环境传感 — 电池长周期

| 字段 | 值 |
|------|-----|
| `id` | `pp-env-sensor` |
| `templateName` | 环境传感 — 电池长周期 |
| `deviceTypeTag` | `env_sensor` |
| `edrxEnabled` | **true**（省略时视为 true） |
| `edrxCycleSeconds` | 163.84 |
| `ptwSeconds` | 10.24 |
| `drxMs` | 640 |
| `psmEnabled` | **true** |
| `heartbeatRecommendedSeconds` | 3600 |

**前提（与 PSM + eDRX 重叠期对齐）**  
若同时开启 **PSM** 且 eDRX 为 **163.84 s**，网络侧下发的 **激活期（Active Time，如 T3324）** 必须 **长于** 该 eDRX 周期（工程上常配置为至少数分钟级），否则终端在短激活期结束后即进入 PSM，长周期 eDRX 在激活窗外**无法**再起作用。典型折中是：设备按 **约 1 h** 心跳上报后，在激活期内用 eDRX **监听数分钟** 网络寻呼，再进入 **约 1 h** 量级的 PSM 深睡——即「短激活窗内 eDRX、长空闲 PSM 托底」的工业监测策略。本模板参数可保持不变。

### 2.2 资产定位标签 — 均衡省电

| 字段 | 值 |
|------|-----|
| `id` | `pp-asset-tracker` |
| `templateName` | 资产定位标签 — 均衡省电 |
| `deviceTypeTag` | `asset_tracker_tag` |
| `edrxEnabled` | **true** |
| `edrxCycleSeconds` | **262.14**（3GPP 阶梯值，约 **4.3 min**；若调度可容忍更慢响应，可选用 **524.28 s**≈8.7 min） |
| `ptwSeconds` | **2.56** |
| `drxMs` | 320 |
| `psmEnabled` | **false**（资产可能移动，不宜 PSM「睡死」） |
| `heartbeatRecommendedSeconds` | **300**（5 min 位置上报） |

**业务对齐**  
过短的 eDRX（如 20 s）对「5 min 才上报一次」的标签是 **电量浪费**；将寻呼周期拉到与心跳 **同量级**（数分钟），才称得上「均衡省电」。厂区若接受「下发找寻指令后 **至多等约 4～9 min** 才有响应」，应采用 **262.14 / 524.28 s** 档。

### 2.3 厂务远端水电气表 — 深度休眠

| 字段 | 值 |
|------|-----|
| `id` | `pp-remote-smart-meter` |
| `templateName` | 厂务远端水电气表 — 深度休眠 |
| `deviceTypeTag` | `remote_smart_meter` |
| `edrxEnabled` | **false**（**eDRX 关闭**；列表展示为「禁用」） |
| `edrxCycleSeconds` | 0（未使用） |
| `ptwSeconds` | 0（未使用） |
| `drxMs` | 0（未使用） |
| `psmEnabled` | **true** |
| `heartbeatRecommendedSeconds` | **86400**（24 h 日报一次） |

**为何必须关 eDRX**  
在 3GPP 语义下，发数后终端处于 **激活期（Active Time / T3324，常为十余秒～数十秒）** 内，eDRX 才具备有效寻呼窗口；激活期结束后进入 **PSM**，网络侧难以再按长 eDRX 周期唤醒。若仍配置 **数百秒级 eDRX**，而激活期远短于该周期，则 **eDRX 几乎永远没有可触发窗口**，与 **PSM + 日级上报** 并用时属于**逻辑冗余**。日上报表计应以 **PSM + 周期/TAU 唤醒** 为主，模板侧 **显式关闭 eDRX**。

---

## 3. 演示终端与切片绑定（与当前 API 种子一致）

| 终端 | 切片 | RRC（典型） | 省电模板 |
|------|------|-------------|----------|
| 机械臂 `dev-arm-01` | `slice-robot-urllc` | `RRC_CONNECTED` | 无（eDRX 关） |

> 当前演示环境 **仅预置上述一条终端**；若扩展 mMTC（液位、资产标签、表计等），需先创建对应切片并再接入终端——功耗模板仍见 §2。

---

## 4. 5G LAN（二层专网）

- **灌装线 1 二层专网**（`vn-line1`）关联 **`slice-robot-urllc`**；当前种子成员仅为 **`dev-arm-01`**。工控扩展时可再并入其它终端 ID。

---

## 5. 新建切片草稿缺省 QoS（大上行）

- 控制台「新建切片」缺省体现 **工业视觉大上行**：上行 GBR 高于下行 GBR（例如上 100 / 下 20 Mbps），见 `SlicesService.create` 与 `SliceEditorPage` 新建表单初值。

---

**修订记录**

| 版本 | 日期 | 说明 |
|------|------|------|
| 0.1 | 2026-05-17 | 初稿：五类工业模板参数 |
| 0.2 | 2026-05-17 | 删除常电类模板；仅保留电池传感；补工业语义与 VN/切片绑定 |
| 0.3 | 2026-05-16 | 增加资产定位标签、远端水电气表两条预置模板及参数说明 |
| 0.5 | 2026-05-16 | 演示种子改为仅机械臂终端 + 单 uRLLC 切片；VN 成员同步 |
