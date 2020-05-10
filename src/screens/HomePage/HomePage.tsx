import React from 'react'
import { Row, Col, Icon, Modal, Button, message } from 'antd'
import { RouteComponentProps } from 'react-router-dom'
import styles from './home-page.module.scss'
import SaveOdlModal from '../../components/SaveOdlModal'
import { OdlInstane } from '../../libs/odl.d'
import odlManager from '../../tools/odlManager'

type MyWindow = Window & typeof globalThis & { electron?: any }
const win: MyWindow = window
const { ipcRenderer } = win.electron || { ipcRenderer: null }

interface IProps extends RouteComponentProps {
  updateOdlList: () => void
}

interface IState {
  isShowImportModeModal: boolean,
  odlListFromFile: OdlInstane[]
}

class HomePage extends React.Component<IProps, IState> {
  saveOdlModalRef: React.RefObject<SaveOdlModal>
  importFileInputRef: React.RefObject<HTMLInputElement>

  constructor(props: IProps) {
    super(props)

    this.state = {
      isShowImportModeModal: false,
      odlListFromFile: []
    }

    this.saveOdlModalRef = React.createRef<SaveOdlModal>()
    this.importFileInputRef = React.createRef<HTMLInputElement>()

    this.addOdl = this.addOdl.bind(this)
    this.importFile = this.importFile.bind(this)
    this.outputFile = this.outputFile.bind(this)
    this.onChangeFile = this.onChangeFile.bind(this)
    this.importOdlList = this.importOdlList.bind(this)
    this.closeImportModeModal = this.closeImportModeModal.bind(this)
  }

  addOdl ():void {
    this.saveOdlModalRef.current?.openModal()
  }

  importFile (): void {
    this.importFileInputRef.current?.click()
  }

  onChangeFile (event: React.ChangeEvent): void {
    const files = this.importFileInputRef.current?.files
    if (files) {
      const reader = new FileReader()
      reader.onload = event => {
        const result = event.target?.result
        if (result) {
          try {
            const odlList: OdlInstane[] = JSON.parse(result + '' || '[]')
            // 判断当前列表，如果列表有东西，提示是否覆盖当前
            if (odlManager.getOdlList().length > 0) {
              this.setState({
                isShowImportModeModal: true,
                odlListFromFile: odlList
              })
            } else {
              this.importOdlList('replace', odlList)
            }
          } catch (e) {
            message.error('解析文件内容出错！')
          }
        } else {
          message.error('解析文件内容失败！')
        }
      }
      reader.readAsText(files[0])
    }
  }

  importOdlList (mode: 'replace' | 'push', odlList: OdlInstane[]) {
    if (mode === 'replace') {
      odlManager.updateOdlList(odlList)
      this.props.updateOdlList()
      message.success('导入完毕')
    } else {
      if (odlList.length > 0) {
        odlList.forEach((odl: OdlInstane) => {
          odlManager.addOdl(odl)
        })
        this.props.updateOdlList()
        message.success('导入完毕')
      }
    }
    this.closeImportModeModal()
  }

  outputFile (): void {
    const odlList = odlManager.getOdlList()
    if (ipcRenderer) {
      ipcRenderer.send('save-file', odlList)
      ipcRenderer.once('saved-file', (event: any, res: { status: 'SUCCESS' | 'ERROR', data?: any, error?: any }) => {
        if (res.status === 'SUCCESS') {
          if (!res.data.canceled) {
            message.success('导出成功')
          }
        } else {
          message.error('导出失败！')
          console.log(res.error)
        }
      })
    } else {
      // 浏览器端
    }
  }

  closeImportModeModal () {
    this.setState({
      isShowImportModeModal: false
    })
  }

  render() {
    return (
      <div>
        <Row>
          <span className={styles['title']}>OpenDayLight Manager</span>
        </Row>
        <Row type="flex" 
           justify="center" 
           align="middle" 
           gutter={16}
           className={styles['btns-box']}>
          <Col span={8} className={styles['btn-box']}>
            <div className={styles['btn']} onClick={this.addOdl}>
              <Icon type="plus" className={styles['btn-icon']} />
              <span className={styles['btn-label']}>添 加</span>
            </div>
          </Col>
          <Col span={8} className={styles['btn-box']}>
            <div className={styles['btn']} onClick={this.importFile}>
              <Icon type="import" className={styles['btn-icon']} />
              <span className={styles['btn-label']}>导 入</span>
            </div>
          </Col>
          <Col span={8} className={styles['btn-box']}>
            <div className={styles['btn']} onClick={this.outputFile}>
              <Icon type="download" className={styles['btn-icon']} />
              <span className={styles['btn-label']}>导 出</span>
            </div>
          </Col>
        </Row>

        <SaveOdlModal ref={this.saveOdlModalRef} returnToHomePage={() => {}} updateOdlList={this.props.updateOdlList} />

        <input type="file" 
               style={{display: 'none'}} 
               ref={this.importFileInputRef}
               accept=".json"
               onChange={this.onChangeFile} />

        <Modal
          visible={this.state.isShowImportModeModal}
          title="选择导入模式"
          footer={[
            <Button key="back" onClick={this.closeImportModeModal}>取消</Button>,
            <Button key="replace" type="danger" onClick={() => {this.importOdlList('replace', this.state.odlListFromFile)}}>覆盖</Button>,
            <Button key="push" type="primary" onClick={() => {this.importOdlList('push', this.state.odlListFromFile)}}>追加</Button>,
          ]}>
          <p>检测到当前已存在ODL实例，请选择导入模式</p>
        </Modal>
      </div>
    )
  }
}

export default HomePage