import React from 'react'
import { Row, PageHeader, Button, Tabs, Modal, message } from 'antd'
import { RouteComponentProps } from 'react-router-dom'
import styles from './odl.module.scss'
import { OdlInstane } from '../../libs/odl.d'
import ApiPanel from './components/ApiPanel/'
import odlManager from '../../tools/odlManager'
import SaveOdlModal from '../../components/SaveOdlModal'
import Overview from './components/Overview/'
import Topo from './components/Topo'


interface IProps extends RouteComponentProps {
  updateOdlList: () => void
}

type tabPaneName = 'api' | 'topo' | 'overview'

interface IState {
  currentOdl: OdlInstane
  defaultTabPane: tabPaneName
}

class Odl extends React.Component<IProps, IState> {
  saveOdlModalRef: React.RefObject<SaveOdlModal>

  constructor(props: IProps) {
    super(props)
    const locationState: any = this.props.location.state
    const routeParams: any = this.props.match.params

    this.saveOdlModalRef = React.createRef<SaveOdlModal>()
    
    this.state = {
      currentOdl: locationState ? locationState.odl || {} : odlManager.getOdlById(routeParams.id),
      defaultTabPane: 'overview'
    }

    this.onDeleteOdl = this.onDeleteOdl.bind(this)
    this.onEditOdl = this.onEditOdl.bind(this)
    this.openNewWindow = this.openNewWindow.bind(this)
    this.returnToHomePage = this.returnToHomePage.bind(this)
  }

  onDeleteOdl (): void {
    const that = this
    const routeParams: any = this.props.match.params
    Modal.confirm({
      title: '删除本odl实例',
      content: '删除后不可恢复，是否继续？',
      onOk () {
        odlManager.deleteOblById(routeParams.id)
        message.success('删除成功')
        that.props.updateOdlList()
        that.returnToHomePage()
      },
      onCancel() {},
    })
  }

  returnToHomePage (): void {
    this.props.history.replace('/')
  }

  onEditOdl (): void {
    this.saveOdlModalRef.current?.openModal()
  }

  openNewWindow (): void {
    window.open(window.location.href)
  }

  render() {
    return (
      <div className={styles['odl-console']}>
        <PageHeader onBack={this.props.history.goBack}
                    title={this.state.currentOdl.name}
                    subTitle={this.state.currentOdl.url}
                    extra={[
                      <Button key="new_window" icon="desktop" onClick={this.openNewWindow}>新窗口中打开</Button>,
                      <Button key="edit" type="primary" icon="edit" onClick={this.onEditOdl}>编辑</Button>,
                      <Button key="delete" type="danger" icon="delete" onClick={this.onDeleteOdl}>删除</Button>,
                    ]}
                    className={styles['page-header']}>
        </PageHeader>
        <Row className={styles['content']}>
          <Tabs defaultActiveKey={this.state.defaultTabPane}>
            <Tabs.TabPane tab="概览" key="overview">
              <Overview currentOdl={this.state.currentOdl} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="API" key="api">
              <ApiPanel currentOdl={this.state.currentOdl} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="拓扑" key="topo">
              <Topo currentOdl={this.state.currentOdl} />
            </Tabs.TabPane>
          </Tabs>
        </Row>

        <SaveOdlModal ref={this.saveOdlModalRef} odlInstane={this.state.currentOdl} returnToHomePage={this.returnToHomePage} updateOdlList={this.props.updateOdlList} />
      </div>
    )
  }
}

export default Odl