import React from 'react'
import { Modal } from 'antd'
import SaveOdlForm from './SaveOdlForm'
import { OdlInstane } from '../../libs/odl'

interface IProps {
  ref: React.RefObject<SaveOdlModal>
  updateOdlList: () => void
  odlInstane?: OdlInstane
  returnToHomePage: () => void
}

interface IState {
  visible: boolean
}

class SaveOdlModal extends React.Component<IProps, IState> {
  constructor(props: Readonly<IProps>) {
    super(props)

    this.state = {
      visible: false,
    }

    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  openModal (): void {
    this.setState({
      visible: true,
    })
  }

  closeModal (): void {
    this.setState({
      visible: false,
    })
  }

  render() {
    return (
      <Modal
        title={this.props.odlInstane ? '编辑ODL' : '添加ODL'}
        visible={this.state.visible}
        onCancel={this.closeModal}
        footer={null}>
        <SaveOdlForm odlInstane={this.props.odlInstane} returnToHomePage={this.props.returnToHomePage} onCloseModal={this.closeModal} updateOdlList={this.props.updateOdlList} />
      </Modal>
    )
  }
}

export default SaveOdlModal