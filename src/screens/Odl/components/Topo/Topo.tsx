import React, { MouseEvent } from 'react'
import { Row, Col, Button, Radio, Icon, Select, Switch, message } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import styles from './topo.module.scss'
import { OdlInstane } from '../../../../libs/odl.d'
import restconfModulesProviderCreator from '../../../../apis/src/base/restconf-modules'
import axiosCreator  from '../../../../apis/axios'
import vis from 'vis'
import { Edge, Network } from 'vis/index'
import { ChromePicker, ColorResult } from 'react-color'
import tools from '../../../../tools/tools'
import { mockEdges, mockNodes } from './mock'

const lodash = require('lodash')

let restconfModulesProvider: any = {}

interface IProps {
  currentOdl: OdlInstane
}

type LinksInfo = {
  'dst-device': string
  'dst-port': number
  'link-id': string
  'src-device': string
  'src-port': number
}

type GetTopoModeType = 'static' | 'dynamic'

interface IState {
  getTopoMode: GetTopoModeType
  dynamicGetTopoDelay: number
  dynamicGetTopoDelayList: number[]
  gotTopoDateTime: string,
  topoInfo: {
    nodeNum: string | number,
    hostNum: string | number,
    switchNum: string | number,
    hostList: any
  },
  topoInfoPanelCtrl: {
    isShowInfo: boolean,
    isShowHostList: boolean,
  },
  listLinksInfo: LinksInfo[],
  topoData: any,
  network: Network | undefined,
  color: {
    switch: string,
    host: string,
    isShowSwitchColorPicker: boolean,
    isShowHostColorPicker: boolean,
  },
}

class Topo extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    
    const axios = axiosCreator({
      baseURL: this.props.currentOdl.url,
      auth: this.props.currentOdl.auth,
    })
    restconfModulesProvider = restconfModulesProviderCreator(axios)

    this.state = {
      getTopoMode: 'static',
      dynamicGetTopoDelay: 5 * 1000,
      dynamicGetTopoDelayList: [ 3 * 1000, 5 * 1000, 8 * 1000, 10 * 1000, 
                                 15 * 1000, 20 * 1000, 25 * 1000, 30 * 1000,
                                 45 * 1000, 60 * 1000 ],
      gotTopoDateTime: '',
      topoInfo: {
        nodeNum: '-',
        hostNum: '-',
        switchNum: '-',
        hostList: []
      },
      topoInfoPanelCtrl: {
        isShowInfo: true,
        isShowHostList: true,
      },
      listLinksInfo: [],
      topoData: {},
      network: undefined,
      color: {
        switch: '#97C2FC',
        host: '#b9b9b9',
        isShowSwitchColorPicker: false,
        isShowHostColorPicker: false,
      }
    }

    this.getTopo = this.getTopo.bind(this)
    this.genTopo = this.genTopo.bind(this)
    this.handleGetTopoModeChange = this.handleGetTopoModeChange.bind(this)
    this.formatGotTopoDateTime = this.formatGotTopoDateTime.bind(this)
    this.handleDynamicGetTopoDelayChange = this.handleDynamicGetTopoDelayChange.bind(this)
    this.genTopo2 = this.genTopo2.bind(this)
    this.handleTopoInfoCtrlChange = this.handleTopoInfoCtrlChange.bind(this)
    this.clearTopo = this.clearTopo.bind(this)
    this.bindPanelMoveEvent = this.bindPanelMoveEvent.bind(this)
    this.openColorPicker = this.openColorPicker.bind(this)
    this.handleChangeColor = this.handleChangeColor.bind(this)
  }

  componentDidMount () {
    this.getTopo()
    this.bindPanelMoveEvent()
  }

  bindPanelMoveEvent (): void {
    const topoInfo = document.getElementById('topo-info')
    const hostList = document.getElementById('host-list')
    const topoBox = document.getElementById('topo-box')

    if (topoInfo) {
      topoInfo.onmousedown = function (this: GlobalEventHandlers, e: globalThis.MouseEvent): any {
        onmousedown(e, topoInfo || document.createElement('div'))
      }
    }
    if (hostList) {
      hostList.onmousedown = function (this: GlobalEventHandlers, e: globalThis.MouseEvent): any {
        onmousedown(e, hostList || document.createElement('div'))
      }
    }
    
    function onmousedown (e: globalThis.MouseEvent, container: HTMLElement): void {
      const diffX = e.clientX - container.offsetLeft // 鼠标点击物体那一刻相对于物体左侧边框的距离=点击时的位置相对于浏览器最左边的距离-物体左边框相对于浏览器最左边的距离
      const diffY = e.clientY - container.offsetTop

      if (topoBox) {
        topoBox.onmousemove = function (e) {
          let left = e.clientX - diffX
          let top = e.clientY - diffY
  
          // 控制拖拽物体的范围只能在浏览器视窗内，不允许出现滚动条
          if (left < 0) {
            left = 0
          } else if (left > topoBox.offsetWidth - container.offsetWidth) {
            left = topoBox.offsetWidth - container.offsetWidth
          }
          if (top < 0) {
            top = 0
          } else if (top > topoBox.offsetHeight - container.offsetHeight) {
            top = topoBox.offsetHeight - container.offsetHeight
          }
  
          // 移动时重新得到物体的距离，解决拖动时出现晃动的现象
          container.style.left = left + 'px'
          container.style.top = top + 'px'
        }
        container.onmouseup = function (e) { // 当鼠标弹起来的时候不再移动
          topoBox.onmousemove = null
          topoBox.onmouseup = null // 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
        }
      }
    }
  }

  handleGetTopoModeChange (event: RadioChangeEvent): void {
    this.setState({
      getTopoMode: event.target.value
    }, () => {
      if (this.state.getTopoMode === 'dynamic') {
        this.getTopo()
      }
    })
  }

  getTopo (mandatory = false): void {
    // restconfModulesProvider.request('restconf/operations/ttodl:list-links-info', {
    //   data: {
    //     input: {}
    //   }
    // })
    restconfModulesProvider.request('restconf/operational/network-topology:network-topology/topology/flow%3A1', {
      method: 'GET',
      data: null
    })
      .then((res: any) => {
        if (res.status === 200) {
          // this.setState({
          //   listLinksInfo: res.data.output ? (res.data.output['links-info'] || []) : [] 
          // }, () => {
          //   // this.genTopo()
          // })
          const result = res.data['topology'] ? res.data['topology'][0] : {}
          if (!lodash.isEqual(this.state.topoData, result) || mandatory) {
            this.setState({
              topoData: result
            })
            this.genTopo2(result)
          }

          if (this.state.getTopoMode === 'dynamic') {
            setTimeout(() => {
              this.getTopo.bind(this)()
            }, this.state.dynamicGetTopoDelay || 5000)
          }
        }
      })
      
      this.setState({
      gotTopoDateTime: '更新时间：' + this.formatGotTopoDateTime()
    })
  }

  clearTopo (container: HTMLElement): void {
    this.setState({
      topoInfo: {
        nodeNum: '-',
        hostNum: '-',
        switchNum: '-',
        hostList: []
      },
    })
    new vis.Network(container, {})
  }

  genTopo2 ({ node, link }: { node: any, link: any }): void {
    const container = document.getElementById('topo-box')

    if (!node || !link) {
      if (this.state.getTopoMode === 'static') {
        message.info('没有拓扑信息')
      }

      this.clearTopo(container || document.createElement('div'))
      return
    }

    const hostList: any = []

    let nodes: any = []
    let links: any = []
    let linksMap: any = {}
    let countHost = 0, countSwitch = 0

    node.forEach((nodeData: any) => {
      const nodeId = nodeData['node-id']
      let nodeTitle = `<span style="display: block">${nodeId}</span>`
      const groupType = nodeId && nodeId.indexOf("host") >= 0 ? 'host' : 'switch'
      if (groupType === 'host') {
        const hostTrackerServiceAddr = nodeData['addresses'] || nodeData['host-tracker-service:addresses']    
        if (hostTrackerServiceAddr && hostTrackerServiceAddr.length > 0) {
          let ip, mac
          hostTrackerServiceAddr.forEach((item: any) => {
            ip = item['ip'] || item['host-tracker-service:ip']
            mac = item['mac'] || item['host-tracker-service:mac']
            nodeTitle += (
              `<span style="display: block">IP: ${ip}</span>` +
              `<span style="display: block">MAC: ${mac}</span>`
            )
          })
        }

        countHost++
        hostList.push(nodeTitle)
      } else {
        countSwitch++
      }

      const nodeLabel = nodeData['node-id']
      nodes.push({
        id: nodes.length.toString(),
        label: nodeLabel,
        group: groupType,
        value: 20,
        title: nodeTitle
      })
    })

    const getNodeIdByText = (inNodes: any, text: string) => {
      const nodes = inNodes.filter((item: any, index: number) => item.label === text)
      const nodeId = nodes && nodes[0] ? nodes[0].id : null
      return nodeId
    }

    const isEdgePresent = (inLinks: any, srcId: string, dstId: string) => {
      return !(inLinks[`${srcId}:${dstId}`] === undefined && inLinks[`${dstId}:${srcId}`] === undefined)
    }

    link.forEach((linkData: any) => {
      const srcId = getNodeIdByText(nodes, linkData.source['source-node'])
      const dstId = getNodeIdByText(nodes, linkData.destination['dest-node'])
      const srcPort = linkData.source['source-tp']
      const dstPort = linkData.destination['dest-tp']
      if (srcId && dstId && !isEdgePresent(linksMap, srcId, dstId)) {
        links.push({
          id: links.length.toString(),
          from : srcId,
          to: dstId,
          title: (
            `<span style="display: block">源端口：${srcPort}</span>` +
            `<span style="display: block">目的端口：${dstPort}</span>`
          ),
          arrows: 'from,to'
        })
        linksMap[`${srcId}:${dstId}`] = links.length.toString()
      }
    })

    this.setState({
      topoInfo: {
        nodeNum: nodes.length,
        hostNum: countHost,
        switchNum: countSwitch,
        hostList: hostList
      }
    })


    
    const data = {
      nodes: nodes,
      edges: links
      // nodes: mockNodes,
      // edges: mockEdges
    }
    const options = {
      physics: {
        enabled: false
      },
      nodes: {
        shape: 'dot',
        // scaling: {
        //   min: 10,
        //   max: 30
        // },
        font: {
          size: 12,
          face: 'Tahoma'
        }
      },
      edges: {
        color: {
          inherit: 'both',
          // hover: '#50ddbb',
          // highlight: '#50ddbb'
        },
        width: 0.15,
        hoverWidth: 0.3,
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 1,
        }
      },
      // interaction: {
      //   hover: true
      // },
      // layout: {
      //   // improvedLayout: false,
      //   hierarchical: {
      //   //   // nodeSpacing: 200,
      //   //   // edgeMinimization: false,
      //   //   // parentCentralization: false,
      //   enabled: false,
      //   levelSeparation: 200,
      //   nodeSpacing: 200,
      //   treeSpacing:300,
      //   blockShifting: false,
      //   edgeMinimization: false,
      //   parentCentralization: true,
      //   direction: 'UD',
      //   sortMethod: 'hubsize'
      //   }
      // },
      groups: {
        switch: {
          color: {
            border: tools.darkenColor(this.state.color.switch, 0.8),
            background: this.state.color.switch,
            highlight: {
              border: tools.darkenColor(this.state.color.switch, 0.8),
              background: this.state.color.switch
            },
            hover: {
              border: tools.darkenColor(this.state.color.switch, 0.8),
              background: this.state.color.switch
            }
          },
        },
        host: {
          color: {
            border: tools.darkenColor(this.state.color.host, 0.8),
            background: this.state.color.host,
            highlight: {
              border: tools.darkenColor(this.state.color.host, 0.8),
              background: this.state.color.host
            },
            hover: {
              border: tools.darkenColor(this.state.color.host, 0.8),
              background: this.state.color.host
            }
          },
        }
      }
    }
    this.setState({
      network: new vis.Network(container || document.createElement('div'), data, options)
    }, () => {
      console.log(this.state.network)
    })
  }

  genTopo (): void {
    if (!Array.isArray(this.state.listLinksInfo) || this.state.listLinksInfo.length === 0) {
      if (this.state.getTopoMode === 'static') {
        message.info('没有拓扑信息')
      }
      return
    }

    // 获得所有设备，建立from-to map
    let deviceList = new Set<string>()
    let map: { [from: string]: string[] } = {}  // { from: [ ...to ] }
    this.state.listLinksInfo.forEach((linksInfo: LinksInfo) => {

      if (!Array.isArray(map[linksInfo['src-device']])) {
        map[linksInfo['src-device']] = []
      }
      if (!Array.isArray(map[linksInfo['dst-device']])) {
        map[linksInfo['dst-device']] = []
      }
      map[linksInfo['src-device']].push(linksInfo['dst-device'])

      deviceList.add(linksInfo['dst-device'])
      deviceList.add(linksInfo['src-device'])
    })

    // 生成nodes
    const nodes = new vis.DataSet(Array.from(deviceList)
      .map((device: string, index: number) => ({ id: device, label: device })))

    // 生成edges
    const mapStrArr: string[] = []
    let edgesArr: Edge[] = []
    this.state.listLinksInfo.forEach((linksInfo: LinksInfo) => {
        // 默认单向箭头，如果src-dst与dst-src都存在，则使用双向箭头
        let arrows = 'to'
        if (map[linksInfo['src-device']].includes(linksInfo['dst-device']) &&
          map[linksInfo['dst-device']].includes(linksInfo['src-device'])) {
          arrows = 'to, from'
        }

        if (mapStrArr.includes(`${linksInfo['dst-device']}->${linksInfo['src-device']}`)) {
          // 有重复的双向箭头
          return
        }
        mapStrArr.push(`${linksInfo['src-device']}->${linksInfo['dst-device']}`)

        edgesArr.push({
          from: linksInfo['src-device'], 
          to: linksInfo['dst-device'],
          arrows: arrows
        })
      })
      const edges = new vis.DataSet(edgesArr)

    const container = document.getElementById('topo-box')
    const data = {
      nodes: nodes,
      edges: edges
      // nodes: mockNodes,
      // edges: mockEdges
    }
    const options = {
      physics: false,
      nodes: {
        shape: 'dot',
        scaling: {
          min: 10,
          max: 30
        },
        font: {
          size: 12,
          face: 'Tahoma'
        }
      },
      edges: {
        color: { inherit: true },
        width: 0.15,
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 1,
        }
      },
    }
    const network = new vis.Network(container || document.createElement('div'), data, options)
    console.log(network)
  }

  formatGotTopoDateTime () {
    const formatter = (num: number) => {
      return num < 10 ? '0' + num : num
    }
    const now = new Date()
    const fullYear = now.getFullYear()
    const month = now.getMonth() + 1
    const date = now.getDate()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()
    const formatMonth = formatter(month)
    const formatDate = formatter(date)
    const formatHours = formatter(hours)
    const formatMinutes = formatter(minutes)
    const formatSeconds = formatter(seconds)
    return `${fullYear}-${formatMonth}-${formatDate} ${formatHours}:${formatMinutes}:${formatSeconds}`
  }

  handleDynamicGetTopoDelayChange (value: number): void {
    this.setState({
      dynamicGetTopoDelay: value
    })
  }

  handleTopoInfoCtrlChange (checked: boolean, event: Event, type: 'info' | 'host'): void {
    this.setState({
      topoInfoPanelCtrl: {
        isShowHostList: type === 'host' ? checked : this.state.topoInfoPanelCtrl.isShowHostList,
        isShowInfo: type === 'info' ? checked : this.state.topoInfoPanelCtrl.isShowInfo
      }
    })
  }

  handleChangeColor (type: 'switch' | 'host', color: ColorResult): void {
    this.setState({
      color: {
        switch: type === 'switch' ? color.hex : this.state.color.switch,
        host: type === 'host' ? color.hex : this.state.color.host,
        isShowSwitchColorPicker: this.state.color.isShowSwitchColorPicker,
        isShowHostColorPicker: this.state.color.isShowHostColorPicker,
      }
    })
  }

  openColorPicker (type: 'switch' | 'host'): void {
    this.setState({
      color: {
        switch: this.state.color.switch,
        host: this.state.color.host,
        isShowSwitchColorPicker: type === 'switch' ? !this.state.color.isShowSwitchColorPicker : this.state.color.isShowSwitchColorPicker,
        isShowHostColorPicker: type === 'host' ? !this.state.color.isShowHostColorPicker : this.state.color.isShowHostColorPicker,
      }
    })
  }

  render() {
    return (
      <Row className={styles['topo']}>
        <Row className={styles['control']}>
          <Col span={14} className={styles['control-left']}>
            <Radio.Group style={{marginRight: '20px'}} 
                         value={this.state.getTopoMode} 
                         buttonStyle="solid" 
                         onChange={this.handleGetTopoModeChange}>
              <Radio.Button value="static">Static</Radio.Button>
              <Radio.Button value="dynamic">Dynamic</Radio.Button>
            </Radio.Group>
            {this.state.getTopoMode === 'dynamic' && 
              <div style={{display: 'inline-block', marginRight: '20px' }}>
                <span style={{marginRight: '10px'}}>Delay: </span>
                <Select defaultValue={this.state.dynamicGetTopoDelay} 
                        style={{ width: 80 }} 
                        onChange={this.handleDynamicGetTopoDelayChange}>
                  {this.state.dynamicGetTopoDelayList.map((delay: number) => (
                    <Select.Option value={delay} key={delay}>{delay / 10 / 10 / 10 + '秒'}</Select.Option>
                  ))}
                </Select>
              </div>
            }
            <div className={styles['color-ctrl']}>
              <span className={styles['switch-color-ctrl']}>switch color:</span>
              <div className={styles['switch-color-preview']} 
                   style={{backgroundColor: this.state.color.switch}} 
                   onClick={this.openColorPicker.bind(this, 'switch')}
              ></div>
              <div className={styles['switch-color-picker']} 
                   style={{display: this.state.color.isShowSwitchColorPicker ? 'block' : 'none'}}>
                <ChromePicker color={ this.state.color.switch } onChangeComplete={this.handleChangeColor.bind(this, 'switch')} />
              </div>
            </div>
            <div className={styles['color-ctrl']}>
              <span className={styles['host-color-ctrl']}>host color:</span>
              <div className={styles['switch-color-preview']} 
                   style={{backgroundColor: this.state.color.host}} 
                   onClick={this.openColorPicker.bind(this, 'host')}
              ></div>
              <div className={styles['host-color-picker']} 
                   style={{display: this.state.color.isShowHostColorPicker ? 'block' : 'none'}}>
                <ChromePicker color={ this.state.color.host } onChangeComplete={this.handleChangeColor.bind(this, 'host')} />
              </div>
            </div>
          </Col>
          <Col span={10} className={styles['control-right']}>
            <span>{this.state.gotTopoDateTime}</span>
            <Button type="link" onClick={this.getTopo.bind(this, true)}><Icon type="reload" />刷新</Button>
          </Col>
        </Row> 

        <div id="topo-info" className={styles['topo-info']} 
             style={{display: this.state.topoInfoPanelCtrl.isShowInfo ? 'block' : 'none'}}>
          <span className={styles['topo-info-item']}>节点数：{this.state.topoInfo.nodeNum !== '-' ? this.state.topoInfo.nodeNum + ' 个' : this.state.topoInfo.nodeNum}</span>
          <span className={styles['topo-info-item']}>Switch：{this.state.topoInfo.switchNum !== '-' ? this.state.topoInfo.switchNum + ' 个' : this.state.topoInfo.switchNum}</span>
          <span className={styles['topo-info-item']}>Host：{this.state.topoInfo.hostNum !== '-' ? this.state.topoInfo.hostNum + ' 个' : this.state.topoInfo.hostNum}</span>
        </div>

        <div id="host-list" className={styles['host-list']} 
             style={{display: this.state.topoInfoPanelCtrl.isShowHostList ? 'block' : 'none'}}>
          {this.state.topoInfo.hostList.map((host: any) => (
            <div dangerouslySetInnerHTML={{__html: host}} 
                 className={styles['host-list-item']} 
                 key={host}
            ></div>
          ))}
        </div>

        <div className={styles['topo-info-ctrl']}>
          <Row className={styles['topo-info-ctrl-item']}>
            <span>显示节点统计</span>
            <Switch style={{width: '44px'}} 
                    defaultChecked 
                    onChange={(checked: boolean, event: Event) => this.handleTopoInfoCtrlChange(checked, event, 'info')} />
          </Row>
          <Row className={styles['topo-info-ctrl-item']}>
            <span>显示Host列表</span>
            <Switch style={{width: '44px'}} 
                    defaultChecked 
                    onChange={(checked: boolean, event: Event) => this.handleTopoInfoCtrlChange(checked, event, 'host')} />
          </Row>
        </div>

        <div className={styles['topo-box']} id="topo-box"></div>
      </Row>
    )
  }
}

export default Topo