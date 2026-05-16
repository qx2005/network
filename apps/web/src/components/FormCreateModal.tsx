import { Modal } from 'antd'
import type { ModalProps } from 'antd'

/**
 * Standard create/edit dialog for list pages (Ant Design 6 API).
 * 列表页通用新建弹窗（Ant Design 6：destroyOnHidden、mask.closable）。
 */
export function FormCreateModal({
  width = 720,
  styles,
  children,
  ...rest
}: ModalProps) {
  return (
    <Modal
      footer={null}
      width={width}
      centered
      destroyOnHidden
      mask={{ closable: false }}
      zIndex={1100}
      /* Avoid focus-trap crash (node.nodeName.toLowerCase) when Form mounts inside Card */
      focusable={{ trap: false }}
      styles={{
        body: { maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingTop: 8 },
        ...styles,
      }}
      {...rest}
    >
      {children}
    </Modal>
  )
}
