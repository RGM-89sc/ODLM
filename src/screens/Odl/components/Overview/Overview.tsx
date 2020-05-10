import React from 'react'
import { Row, Descriptions, Badge, List } from 'antd'
import styles from './overview.module.scss'
import { OdlInstane } from '../../../../libs/odl.d'
import restconfModulesProviderCreator from '../../../../apis/src/base/restconf-modules'
import axiosCreator  from '../../../../apis/axios'

let restconfModulesProvider: any = {}

interface IProps {
  currentOdl: OdlInstane
}

interface IState {
  status: { key: 'processing', label: '运行中' } | 
    { key: 'error', label: '连接错误' } | 
    { key: 'default', label: '正在连接' },
  ports: [],
  loadingPorts: boolean
}

class Overview extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    
    const axios = axiosCreator({
      baseURL: this.props.currentOdl.url,
      auth: this.props.currentOdl.auth,
    })
    restconfModulesProvider = restconfModulesProviderCreator(axios)

    this.state = {
      status: { key: 'default', label: '正在连接' },
      ports: [],
      loadingPorts: false
    }

    this.getStatus = this.getStatus.bind(this)
    this.getPorts = this.getPorts.bind(this)
  }

  componentDidMount () {
    this.getStatus(true)
  }

  getStatus (firstTime = false): void {
    restconfModulesProvider.request('restconf/operations/ttodl:hello-world', { 
      data: { 
        input: { name: this.props.currentOdl.auth?.username } 
      }
    }).then((res: any) => {
      if (res.status === 200) {
        this.setState({
          status: { key: 'processing', label: '运行中' }
        })
        if (firstTime) {
          this.getPorts()
        }
      } else {
        this.setState({
          status: { key: 'error', label: '连接错误' }
        })
      }
    }).catch((e: Error) => {
      this.setState({
        status: { key: 'error', label: '连接错误' }
      })
    })
  }

  getPorts (): void {
    this.setState({
      loadingPorts: true
    })

    restconfModulesProvider.request('restconf/operations/ttodl:list-ports-info', { 
      data: {
        input: {}
      }
    }).then((res: any) => {
      if (res.status === 200) {
        const portsInfo = res.data.output['ports-info']
        console.log(portsInfo)
        this.setState({
          ports: portsInfo.sort((port1: any, port2: any) => {
            return port1['port-name'] < port2['port-name'] ? -1 : 1
          })
        })
      }
    }).catch((e: Error) => {
      
    }).finally(() => {
      this.setState({
        loadingPorts: false
      })
    })
  }

  render() {
    return (
      <Row>
        <Row>
          <Descriptions title="ODL基本信息">
            <Descriptions.Item label="Name">{this.props.currentOdl.name}</Descriptions.Item>
            <Descriptions.Item label="Url">{this.props.currentOdl.url}</Descriptions.Item>
            <Descriptions.Item label="Remark">{this.props.currentOdl.remark || '-'}</Descriptions.Item>
            <Descriptions.Item label="Status" span={3}>
              <Badge status={this.state.status.key} text={this.state.status.label} />
            </Descriptions.Item>
          </Descriptions>
        </Row>
        <Row>
          <Descriptions title="端口列表"></Descriptions>
            <List
            loading={this.state.loadingPorts}
            itemLayout="horizontal"
            dataSource={this.state.ports}
            renderItem={item => (
              <List.Item actions={[
                <Badge status={item['link-down'] ? 'error' : 'success'} text={item['link-down'] ? 'down' : 'up'} />
              ]}>
                <span>端口名称：{item['port-name']} | 节点标识符：{item['device-id']} | 物理地址：{item['hardware-address']} | （当前）速度：{item['current-speed']}kbps | （最大）速度：{item['maximum-speed']}kbps</span>
{/* port-number: "1"  
link-down: false  // 状态
hardware-address: "b2:dc:3c:68:db:03"  // 物理地址
maximum-speed: 0  // 最大速度，kbps
port-name: "s1-eth1"  // 端口名称
current-speed: 10000000 // 速度，kbps
device-id: "openflow:1"  // 节点标识符 */}
              </List.Item>
            )} />
        </Row>
      </Row>
    )
  }
}

export default Overview