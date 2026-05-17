# 5G-A 专网控制台 · 演示用「Agent」一键自动配置（产品说明稿）

> **说明**：本文档仅描述产品与交互方案，**不涉及代码实现**。  
> **重要**：本计划**不接入任何 AI / 大模型 / 外部智能体 API**。所谓「Agent」仅为**演示用的交互包装**：用户点击按钮后，由产品内**预先写死的参数表（Playbook）**按步骤调用现有配置能力，配合动画与日志**假冒**自动化智能体效果。  
> **参数唯一来源**：Playbook 必须与仓库根目录《**5G-A数据.md**》中的配置**逐字、逐字段一致**；实现时不得擅自改写、合并或「优化」文档中的字面量（含切片 ID、SUPI、端口等）。若文档内部两处字面量不同（见 §4），须**同时保留**，由演示数据或编排顺序保证二者在系统中均可出现。

---

## 0. 核心原则（须与验收对齐）

| 原则 | 说明 |
|------|------|
| **无 AI API** | 不调 OpenAI/Claude/自建 LLM、不做 RAG、不解析自然语言。 |
| **假冒 Agent** | 仅通过 UI 文案、步骤条、**延时播放的伪终端日志**营造「智能体在跑」的观感；本质为**确定性脚本**。 |
| **参数严格对齐《5G-A数据.md》** | Playbook 为文档的**镜像**；任何字段以该 Markdown 文件为准，同步变更。 |
| **可预测** | 每次演示在同一环境下结果一致（除内存重置外无随机性）。 |

---

## 1. 背景与目标

### 1.1 背景

方案演示时需在多菜单间重复录入《5G-A数据.md》中的同一套案例。希望在各**配置列表页**工具栏（与「刷新」同行、靠右——示意红圈处）增加一枚 **「Agent 配置」**（或「方案一键演示」）按钮：点击后进入**全屏/大抽屉式的演示流程**，按 Playbook **自动提交**与本页域相关的配置，列表上出现新行，**看起来**像 Agent 已根据方案文档完成配置。

### 1.2 目标

| 目标 | 说明 |
|------|------|
| **一键落参** | 单次流程内写入《5G-A数据.md》中与本页对应章节的全部字段（在演示平台能力范围内）。 |
| **演示观感** | 用户感知为「Agent 按方案执行」，实为**预设步骤 + 假日志**；不在对外文案中声称接入了真实 AI。 |
| **可追溯** | 可区分「人工新建」与「演示 Agent」生成（见 §6）。 |
| **执行顺序** | 多对象仍存在依赖（如 VN 依赖切片、规则依赖 VN）；可在一页内串行多 API 或由运维按顺序点各页按钮（见 §4）。 |

### 1.3 非目标

- 真实 AI、MCP、文档自动爬取或上传解析。  
- 生产级高可用、冲突治理、回滚编排。  
- 对《5G-A数据.md》的字段做「智能纠错」或合并（**禁止**；若文档有误，改 md 本身而非 Playbook 私自改值）。

---

## 2. 入口与页面清单

各页在主内容区工具栏、「刷新」**右侧**增加主按钮 **「Agent 配置」**（副标可选：「《5G-A数据》演示」）。图标可用魔法棒等，**不**使用需授权的真实厂商 Agent 徽标。

| 序号 | 控制台路径 | 对应《5G-A数据.md》章节 | 演示按钮单次覆盖范围 |
|------|------------|-------------------------|----------------------|
| A | 网络切片 → **切片实例** | **新建切片** | 按文档「新建切片」节创建一条切片（字段见 §3.1）。 |
| B | RedCap → **在线终端** | **连接新终端** | 按「连接新终端」节创建一条终端（§3.2）。 |
| C | MEC → **注册节点** | **注册节点** | 按「注册节点」节注册节点（§3.3）。 |
| D | MEC → **分流规则** | **新建规则** | 按「新建规则」节建规则（§3.4）。 |
| E | 5G LAN / VN → **VN 组** | **新建 VN 组** | 按「新建 VN 组」节建 VN（§3.5）。 |

若节点与规则共页不同 Tab，可在该页**一粒按钮**内按文档顺序先节点后规则（仍为固定脚本，非 AI）。

---

## 3. Playbook 字段表（须与《5G-A数据.md》一致）

下列内容为文档**摘录**，实施与验收时以仓库内**最新版《5G-A数据.md》**为准；若 md 与下表冲突，**以 md 为准**并更新本表。

### 3.1 新建切片

| 项 | 值（摘自文档） |
|----|----------------|
| 切片显示名 | 机械臂协同 uRLLC 切片 |
| 描述 | 用于产线末端装箱与码垛机械臂的高精度同步控制，要求极低时延与高可靠性，防止动作脱节打碎酒瓶。 |
| SST | 2 — uRLLC（产品中取 SST 数值 **2**） |
| SD（可选） | **020666** |
| 默认 DNN | **dnn-robot.private** |
| 允许 LADN | 开启 |
| 上行/下行 GBR (Mbps) | **20 / 20** |
| 上行/下行 MBR (Mbps) | **50 / 50** |
| AMBR (Mbps) | **200** |
| 5QI | **82** |
| ARP / 抢占档位 | **高** |
| 成员分组 ID | **grp-robot-arms** |

**Agent · 设备名称「注水机」**：冻结为文档 **「高精度灌装注水机 uRLLC 切片」**整段（`PLAYBOOK_SLICE_BODY_FILLER` 等），切片 ID **`slice-filler-urllc`**，**不得**再与通用模板共用 `slice-robot-urllc`。

**Agent · 其它设备名（如四轴机械臂模块等）**：在复用机械臂 QoS 模板的同时，须生成 **独立的切片技术 ID**（如 `slice-agent-*`）与 **独立 6 位 hex SD**，避免与种子 `slice-robot-urllc` 的 ID 及 S-NSSAI+DNN 组合冲突；RedCap / VN / MEC 规则的关联 ID 与 VN 绑定须与 `demoAgentSliceIdForDeviceName` / `demoAgentVnIdForDeviceName` 一致。

**Agent · 设备名称「环形模块」**（与拓扑库选项一致）：须**不使用**通用设备名推导，而**逐字段冻结**为文档 **§3.1b「高速环形线协同 uRLLC 切片」**及同场景后续段落（实现见 `PLAYBOOK_SLICE_BODY_RINGLINE`、`PLAYBOOK_REDCAP_DEVICE_BODY_RINGLINE`、`PLAYBOOK_MEC_NODE_BODY_RINGLINE`、`PLAYBOOK_MEC_RULE_BODY_RINGLINE`、`PLAYBOOK_VN_BODY_RINGLINE` / `buildSliceBodyFromDeviceName` 等）：切片 **`slice-ringline-urllc`**，SD **`020888`**，DNN **`dnn-ringline.private`**，QoS **30/30、100/100、300**，成员 **`grp-ring-movers`**。文档中的 **「高精度灌装注水机 uRLLC 切片」**由 **「注水机」**设备选项单独选用（见上文）；**不由「环形模块」Agent 预设选用**。

### 3.1b 新建切片（高速环形线协同 uRLLC）

| 项 | 值（摘自《5G-A数据.md》该段） |
|----|----------------|
| 切片技术 ID（演示 Agent） | **slice-ringline-urllc** |
| 切片显示名 | 高速环形线协同 uRLLC 切片 |
| 描述 | 用于车间高速磁悬浮环形传送带的多动子（穿梭车）同步控制与实时位置反馈，要求极低时延与强确定性，确保动子间距精准控制与防撞。 |
| SST / SD | 2 / **020888** |
| 默认 DNN | **dnn-ringline.private** |
| 允许 LADN | 开启 |
| 上行/下行 GBR (Mbps) | **30 / 30** |
| 上行/下行 MBR (Mbps) | **100 / 100** |
| AMBR (Mbps) | **300** |
| 5QI | **82** |
| ARP | **高** |
| 成员分组 ID | **grp-ring-movers** |

> 描述行以仓库内最新 md 为准；若上表与 md 逐字不一致，以 md 为准。

文档未写平台**切片技术 ID**；若创建接口返回自动生成 ID，则默认机械臂场景 VN「关联切片 ID」仍须使用文档 **§3.5 中写死的 `slice-robot-urllc`**（见 §4），演示侧须通过**预置种子**或**支持按文档 ID 创建**使该 ID 与 uRLLC 切片一致——**不得**把 VN 改成别的 ID 以图省事。

### 3.1c 高精度灌装注水机 uRLLC（Agent 设备「注水机」）

| 项 | 值（摘自《5G-A数据.md》该段） |
|----|----------------|
| 切片技术 ID（演示 Agent） | **slice-filler-urllc** |
| 切片显示名 | 高精度灌装注水机 uRLLC 切片 |
| SST / SD | 2 / **020999** |
| 默认 DNN | **dnn-filler.private** |
| GBR / MBR / AMBR (Mbps) | **10/10**、**30/30**、**100** |
| 成员分组 ID | **grp-liquid-fillers** |

同场景终端、MEC、规则、VN 的 SUPI、网段、`vn-filler-lan`、`10.10.4.10` 等字面量均以仓库内最新 md 为准。该场景 VN「关联切片 ID」须为 **slice-filler-urllc**（与切片技术 ID 一致）。

### 3.1d 高速旋转供料协同 uRLLC（Agent 设备「旋转供料模块」）

**Agent · 设备名称「旋转供料模块」**（与拓扑库选项一致）：须**逐字段冻结**为《5G-A数据.md》本段及同场景后续「连接新终端 / 注册节点 / 新建规则 / 新建 VN 组」；实现对应 `PLAYBOOK_SLICE_BODY_ROTARY`、`PLAYBOOK_REDCAP_DEVICE_BODY_ROTARY`、`PLAYBOOK_MEC_NODE_BODY_ROTARY`、`PLAYBOOK_MEC_RULE_BODY_ROTARY`、`PLAYBOOK_VN_BODY_ROTARY` / `isRotaryFeedModuleAgentSelection` / `buildSliceBodyFromDeviceName` 等，**不得**走通用 `slice-agent-*` 推导。

| 项 | 值（摘自《5G-A数据.md》该段） |
|----|----------------|
| 切片技术 ID（演示 Agent） | **slice-rotary-urllc** |
| 切片显示名 | 高速旋转供料协同 uRLLC 切片 |
| SST / SD | 2 / **020777** |
| 默认 DNN | **dnn-rotary-feeder.private** |
| GBR / MBR / AMBR (Mbps) | **15/15**、**40/40**、**150** |
| 成员分组 ID | **grp-rotary-feeders** |
| VN 组 ID | **vn-rotary-lan** |
| RedCap 别名 | **2号线-高速星轮理料盘#01** |
| RedCap SUPI | **imsi-460001234560301** |

同场景 MEC 节点、规则、VN 成员 SUPI、网段、`10.10.5.10` 等字面量均以仓库内最新 md 为准。

### 3.1e 高速物料推送协同 uRLLC（Agent 设备「物料推送模块」）

**Agent · 设备名称「物料推送模块」**（与拓扑库选项一致）：须**逐字段冻结**为《5G-A数据.md》本段及同场景后续段落；实现对应 `PLAYBOOK_SLICE_BODY_PUSHER`、`PLAYBOOK_REDCAP_DEVICE_BODY_PUSHER`、`PLAYBOOK_MEC_NODE_BODY_PUSHER`、`PLAYBOOK_MEC_RULE_BODY_PUSHER`、`PLAYBOOK_VN_BODY_PUSHER` / `isMaterialPushModuleAgentSelection` / `buildSliceBodyFromDeviceName` 等，**不得**走通用 `slice-agent-*` 推导。

| 项 | 值（摘自《5G-A数据.md》该段） |
|----|----------------|
| 切片技术 ID（演示 Agent） | **slice-pusher-urllc** |
| 切片显示名 | 高速物料推送协同 uRLLC 切片 |
| SST / SD | 2 / **020555** |
| 默认 DNN | **dnn-pusher.private** |
| GBR / MBR / AMBR (Mbps) | **10/10**、**25/25**、**100** |
| 成员分组 ID | **grp-material-pushers** |
| VN 组 ID | **vn-pusher-lan** |
| RedCap 别名 | **4号线-高速分拣剔除推杆#A** |
| RedCap SUPI | **imsi-460001234560401** |

同场景 MEC 规则优先级 **12**、目的 **`10.49.2.0/24`**、端口 **`34964` / `502`**、下一跳 **`10.10.6.10`** 等字面量均以仓库内最新 md 为准。

### 3.1f 视觉定位与伺服推送协同 uRLLC（Agent 设备「定位推送模块」）

**Agent · 设备名称「定位推送模块」**（与拓扑库选项一致）：须**逐字段冻结**为《5G-A数据.md》本段及同场景后续「连接新终端 / 注册节点 / 新建规则 / 新建 VN 组」；实现对应 `PLAYBOOK_SLICE_BODY_POS_PUSHER`、`PLAYBOOK_REDCAP_DEVICE_BODY_POS_PUSHER`、`PLAYBOOK_MEC_NODE_BODY_POS_PUSHER`、`PLAYBOOK_MEC_RULE_BODY_POS_PUSHER`、`PLAYBOOK_VN_BODY_POS_PUSHER` / `isPositioningPushModuleAgentSelection` / `buildSliceBodyFromDeviceName` 等，**不得**走通用 `slice-agent-*` 推导。

| 项 | 值（摘自《5G-A数据.md》该段） |
|----|----------------|
| 切片技术 ID（演示 Agent） | **slice-pos-pusher-urllc** |
| 切片显示名 | 视觉定位与伺服推送协同 uRLLC 切片 |
| SST / SD | 2 / **020444** |
| 默认 DNN | **dnn-pos-pusher.private** |
| GBR / MBR / AMBR (Mbps) | **上行 50 / 下行 15**、**150/40**、**300** |
| 5QI | **80** |
| 成员分组 ID | **grp-pos-pushers** |
| VN 组 ID | **vn-pos-pusher-lan** |
| RedCap 别名 | **5号线-高精定位伺服推杆#01** |
| RedCap SUPI | **imsi-460001234560501** |

同场景 MEC 规则优先级 **14**、目的 **`10.50.2.0/24`**、端口 **`3956` / `34964`**、下一跳 **`10.10.7.10`**、节点能力标签 **`N6_BREAKOUT`, `uRLLC_Optimized`, `Edge_Computing_Vision`**（文档未写 `L2_Bridging`）等字面量均以仓库内最新 md 为准。

### 3.1g 工业相机大上行切片（Agent 设备「工业相机模块」）

**Agent · 设备名称「工业相机模块」**（与拓扑库选项一致；兼容旧值「工业相机」）：须**逐字段冻结**为《5G-A数据.md》本段及同场景后续「连接新终端 / 注册节点 / 新建规则 / 新建 VN 组」；实现对应 `PLAYBOOK_SLICE_BODY_VISION_EMBB`、`PLAYBOOK_REDCAP_DEVICE_BODY_VISION_EMBB`、`PLAYBOOK_MEC_NODE_BODY_VISION_EMBB`、`PLAYBOOK_MEC_RULE_BODY_VISION_EMBB`、`PLAYBOOK_VN_BODY_VISION_EMBB` / `isIndustrialCameraAgentSelection` / `buildSliceBodyFromDeviceName` 等，**不得**走通用 `slice-agent-*` 推导。

| 项 | 值（摘自《5G-A数据.md》该段） |
|----|----------------|
| 切片技术 ID（演示 Agent） | **slice-vision-embb** |
| 切片显示名 | 工业相机大上行切片 |
| SST / SD | **1**（eMBB） / **010888** |
| 默认 DNN | **dnn-vision.private** |
| GBR / MBR / AMBR (Mbps) | **上行 150 / 下行 10**、**300/50**、**500** |
| 5QI | **80** |
| ARP | **中** |
| 成员分组 ID | **grp-ai-cameras** |
| VN 组 ID | **vn-vision-lan** |
| RedCap 别名 | **工业相机** |
| RedCap SUPI | **imsi-460001234560601** |

同场景 MEC 规则优先级 **30**、目的 **`10.51.2.0/24`**、端口 **`3956` / `554` / `8081`**、下一跳 **`10.10.8.10`**、节点能力 **`N6_BREAKOUT`, `Massive_Uplink`, `Edge_AI_GPU`** 等字面量均以仓库内最新 md 为准。平台语义层须允许 **SST=1 + 5QI=80**（文档字面量），见 `slice-semantics`。

### 3.1h 气动伸缩夹爪协同 uRLLC（Agent 设备「气动伸缩夹爪模块」）

**Agent · 设备名称「气动伸缩夹爪模块」**（与拓扑库选项一致；兼容旧值「气动伸缩夹爪」）：须**逐字段冻结**为《5G-A数据.md》本段及同场景后续「连接新终端 / 注册节点 / 新建规则 / 新建 VN 组」；实现对应 `PLAYBOOK_SLICE_BODY_GRIPPER`、`PLAYBOOK_REDCAP_DEVICE_BODY_GRIPPER`、`PLAYBOOK_MEC_NODE_BODY_GRIPPER`、`PLAYBOOK_MEC_RULE_BODY_GRIPPER`、`PLAYBOOK_VN_BODY_GRIPPER` / `isPneumaticGripperModuleAgentSelection` / `buildSliceBodyFromDeviceName` 等，**不得**走通用 `slice-agent-*` 推导。

| 项 | 值（摘自《5G-A数据.md》该段） |
|----|----------------|
| 切片技术 ID（演示 Agent） | **slice-gripper-urllc** |
| 切片显示名 | 气动伸缩夹爪协同 uRLLC 切片 |
| SST / SD | 2 / **020333** |
| 默认 DNN | **dnn-gripper.private** |
| GBR / MBR / AMBR (Mbps) | **10/10**、**25/25**、**100** |
| 5QI | **82** |
| ARP | **高** |
| 成员分组 ID | **grp-pneumatic-grippers** |
| VN 组 ID | **vn-gripper-lan** |
| RedCap 别名 | **气动伸缩夹爪** |
| RedCap SUPI | **imsi-460001234560701** |

同场景 MEC 规则优先级 **16**、目的 **`10.52.2.0/24`**、端口 **`34964` / `502`**、下一跳 **`10.10.9.10`**、节点能力 **`N6_BREAKOUT`, `uRLLC_Optimized`, `L2_Bridging`** 等字面量均以仓库内最新 md 为准。

### 3.1i 边缘计算单元协同专属切片（Agent 设备「边缘计算单元模块」）

**Agent · 设备名称「边缘计算单元模块」**（与拓扑库选项一致；兼容旧值「边缘计算单元」）：须**逐字段冻结**为《5G-A数据.md》本段及同场景后续「连接新终端 / 注册节点 / 新建规则 / 新建 VN 组」；实现对应 `PLAYBOOK_SLICE_BODY_EDGE_COMPUTE`、`PLAYBOOK_REDCAP_DEVICE_BODY_EDGE_COMPUTE`、`PLAYBOOK_MEC_NODE_BODY_EDGE_COMPUTE`、`PLAYBOOK_MEC_RULE_BODY_EDGE_COMPUTE`、`PLAYBOOK_VN_BODY_EDGE_COMPUTE` / `isEdgeComputeUnitModuleAgentSelection` / `buildSliceBodyFromDeviceName` 等，**不得**走通用 `slice-agent-*` 推导。

| 项 | 值（摘自《5G-A数据.md》该段） |
|----|----------------|
| 切片技术 ID（演示 Agent） | **slice-edge-compute** |
| 切片显示名 | 边缘计算单元协同专属切片 |
| SST / SD | 2 / **020111** |
| 默认 DNN | **dnn-edge-compute.private** |
| GBR / MBR / AMBR (Mbps) | **200/200**、**1000/1000**、**2000** |
| 5QI | **80** |
| ARP | **高** |
| 成员分组 ID | **grp-edge-compute** |
| VN 组 ID | **vn-edge-compute-lan** |
| RedCap 别名 | **边缘计算单元** |
| RedCap SUPI | **imsi-460001234560901** |

同场景 MEC 规则优先级 **5**、目的 **`10.54.2.0/24`**、端口 **`1883` / `9092` / `4840`**、下一跳 **`10.10.11.10`**、节点能力 **`N6_BREAKOUT`, `Edge_Computing_GPU`, `Data_Aggregation`** 等字面量均以仓库内最新 md 为准。

### 3.2 连接新终端（RedCap）

| 项 | 值（摘自文档） |
|----|----------------|
| 别名 | 1号线-高速机械臂A |
| SUPI | imsi-460001234560001 |
| IMEISV（可选） | 867400012345671 |
| 切片 ID | **slice-robot-urllc**（与演示种子、《5G-A数据.md》机械臂单场景一致） |
| VN ID（可选） | **vn-line1**（灌装线 uRLLC 二层专网） |
| IP（可选） | 10.45.1.55 |
| RRC 状态 | RRC_CONNECTED |
| 信号质量描述 | RSRP -65 dBm |
| 流量累计 (MB) | 12054 |
| 省电模板 | **禁用** |

文档中曾存在「相机」旁注与「机械臂」别名混排；**演示种子已扩展为 uRLLC / eMBB / mMTC 多切片 + 多终端**，以仓库内 `5G-A数据.md` 与 Playbook 为准；常电终端**省电模板一律禁用**。

### 3.3 注册节点（MEC）

| 项 | 值（摘自文档） |
|----|----------------|
| 节点名 | 机械臂控制边缘节点 |
| N6 本地端点 | 10.10.2.10:2152 |
| DNN 列表（逗号分隔） | dnn-robot.private |
| 能力标签（逗号分隔） | N6_BREAKOUT, uRLLC_Optimized（文档中为 `N6_BREAKOUT` 与 `uRLLC_Optimized`，下划线以 md 为准） |
| 健康探测 URL | http://10.10.2.10:8080/health |

### 3.4 新建规则（MEC）

| 项 | 值（摘自文档） |
|----|----------------|
| 规则名 | 机械臂协同指令本地极速卸载 |
| 优先级 | 20 |
| 目的网段 CIDR | 10.45.2.0/24 |
| 源网段 CIDR（可选） | 留空 |
| 协议 | TCP |
| 端口范围（逗号分隔） | 102, 4840 |
| VN ID（可选） | vn-line1 |
| 动作类型 | 本地分流 |
| 下一跳（可选） | 10.10.2.10 |
| 绕过公网 | 开启 |

### 3.5 新建 VN 组

| 项 | 值（摘自文档） |
|----|----------------|
| 显示名 | 灌装线 1 二层专网 |
| 技术 ID | vn-line1 |
| 关联切片 ID | **slice-robot-urllc**（文档原文） |
| 成员终端 ID（逗号分隔） | dev-arm-01 |
| 允许以太网 PDU | 开启 |
| 广播策略 | 允许 |
| 组播策略 | 限制（LIMITED） |

---

## 4. 文档内 ID 与演示种子（单机械臂演示）

《5G-A数据.md》与 API **内存种子**当前对齐为 **极简产线演示**（仅机械臂）：

- **uRLLC**：`slice-robot-urllc` — 预置机械臂终端；`vn-line1` 二层专网同绑此切片。  
- **预置终端**：`dev-arm-01`（`1号线-高速机械臂A`），省电模板 **禁用**。  
- **预置 VN**：`vn-line1`，成员 **`dev-arm-01`**。  
- **省电模板列表**：仍保留 §`docs/redcap-power-profiles-industrial.md` 中电池/物联类模板，供 **后续手动接入** 传感、标签、表计等使用；种子终端不引用这些模板。  
- **MEC**：种子可为空，由 Playbook 创建（§3.3、§3.4）。

若需恢复「视觉 eMBB + mMTC」等多切片混合演示，须在 `SlicesService` / `RedcapService` 中重新加入对应种子对象。

---

## 5. 「自动配置」界面（假冒 Agent 的纯 UI 编排）

点击按钮后打开 **Drawer / 大 Modal**，**全部为前端写死流程**，无后台推理。

1. **页头**  
   - 标题示例：「演示 · 方案自动配置」  
   - 副标：**非 AI 生成**（小字灰字可选：「参数来自《5G-A数据.md》」）  

2. **步骤条**  
   - 固定顺序，例如：`加载方案参数` → `执行下发` → `完成`  
   - 步骤文案不暗示调用大模型。

3. **主区**  
   - **左侧**：只读折叠表，展示本节 Playbook 键值（与 §3 一致）。  
   - **右侧**：**伪终端日志**——按预设字符串列表**定时 append**，模拟打字；可含 `POST /api/...` 等**演出用**行，**不代表**真实网络探针或 LLM chain-of-thought。

4. **页脚**  
   - 「开始执行」→ 执行中禁用重复点击；「取消」关闭。  

结束后：若有现成回执组件可展示；关闭后**刷新列表**，新记录可带 §6 角标。

---

## 6. 演示呈现规范（「像 Agent」但诚实）

| 维度 | 建议 |
|------|------|
| **列表角标** | Tag：`演示` 或 `方案下发`，避免误导为云端 AI。 |
| **成功文案** | 例：「已按《5G-A数据》演示参数写入」；避免「AI 已理解您的需求」。 |
| **审计 / 来源** | 可选字段 `source: demo-playbook`，与人工操作区分。 |
| **禁止** | 随机扰动文档规定的参数；禁止自称「已学习文档」或「推理生成」。 |

---

## 7. 失败与权限

| 场景 | 行为 |
|------|------|
| 依赖缺失（如缺 slice-robot-urllc） | Toast/日志提示文档要求的 ID 不存在；不自动换 ID。 |
| 对象已存在 | 按产品规则跳过或提示「演示项已存在」，**不**改写为未在 md 中出现的字段。 |
| viewer 角色 | 按钮禁用或提示需运维角色。 |

---

## 8. Playbook 与文档同步

- Playbook 与《5G-A数据.md》**同源**：md 变更后须人工更新常量表，并同步本节 §3 摘录。  
- **不**在运行时读取用户磁盘上的 md 文件（避免路径与环境差异）；若需「单一真相」，可将 md 同步进仓库并由构建 bundle 内嵌**同文** JSON。  
- 内存演示环境重启后数据清空，属预期。

---

## 9. 验收要点

1. 全链路参数与《5G-A数据.md》**对表抽查**无误。  
2. 无调用任何 AI API（可通过网络策略/代码评审确认）。  
3. 预置数据含 **一条 uRLLC 切片**、**一条机械臂终端** 与 **vn-line1**；省电模板为册（无种子终端绑定）；MEC 可由 Playbook 创建。  
4. 界面不虚假宣传「大模型」「智能推理」；假冒效果仅限动画与文案风格。  

---

## 10. 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| 0.1 | 2026-05-16 | 初稿。 |
| 0.4 | 2026-05-17 | 多切片种子与终端绑定；VN 改为 `vn-line1`；省电与 5G LAN 语义对齐。 |
| 0.5 | 2026-05-16 | 演示种子改为单机械臂 + 单切片；§4、§9 叙述同步 |
| 0.6 | 2026-05-16 | 新增 §3.1f「定位推送模块」与《5G-A数据.md》视觉定位+伺服推送整段 Playbook 对齐说明 |
| 0.7 | 2026-05-16 | 新增 §3.1g「工业相机模块」大上行 eMBB（slice-vision-embb）及 SST=1+5QI=80 语义放行说明 |
| 0.8 | 2026-05-16 | 新增 §3.1h「气动伸缩夹爪模块」uRLLC（slice-gripper-urllc）Playbook 对齐说明 |
| 0.9 | 2026-05-16 | 新增 §3.1i「边缘计算单元模块」slice-edge-compute Playbook 对齐说明 |

---

**文档路径**：`docs/agent-auto-config-spec.md`
