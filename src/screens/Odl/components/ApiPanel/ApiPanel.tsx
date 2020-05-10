import React from 'react'
import { Row, Col, Tree } from 'antd'
import { AntTreeNode, AntTreeNodeSelectedEvent } from 'antd/lib/tree/index.d'
import { AxiosError } from 'axios'
import { RestconfModuleInfo } from '../../../../libs/odl.d'
import { OdlInstane } from '../../../../libs/odl.d'
import { ApiDetail } from '../index.d'
import styles from './api-panel.module.scss'
import ApiConsole from '../ApiConsole'
import restconfModulesProviderCreator from '../../../../apis/src/base/restconf-modules'
import axiosCreator  from '../../../../apis/axios'

let restconfModulesProvider: any = {}
let restconfModulesProviderForAPI: any = {}

interface IProps {
  currentOdl: OdlInstane
}

interface RestconfModulesTreeData extends RestconfModuleInfo {
  title: string
  key: string | undefined
  children?: RestconfModulesTreeData[]
  isLeaf?: boolean
}

interface IState {
  restconfModulesTreeData: RestconfModulesTreeData[]
  currentApiDetail: ApiDetail
}

type RestconfType = 'operations' | 'config'

class ApiPanel extends React.Component<IProps, IState> {
  apiConsoleRef: React.RefObject<ApiConsole>

  constructor(props: IProps) {
    super(props)
    this.state = {
      restconfModulesTreeData: [],
      currentApiDetail: {}
    }

    const axios = axiosCreator({
      baseURL: this.props.currentOdl.url,
      auth: this.props.currentOdl.auth,
    })
    restconfModulesProvider = restconfModulesProviderCreator(axios)

    const axiosForAPI = axiosCreator({
      baseURL: this.props.currentOdl.url,
      auth: this.props.currentOdl.auth,
    }, { request: {}, response: {
      onRejected: (error: AxiosError) => {
        return Promise.resolve(error.response)
      }
    } })
    restconfModulesProviderForAPI = restconfModulesProviderCreator(axiosForAPI)

    this.apiConsoleRef = React.createRef<ApiConsole>()

    this.onRequest = this.onRequest.bind(this)
    this.onSelectApi = this.onSelectApi.bind(this)
    this.getRestconfModulesTreeData = this.getRestconfModulesTreeData.bind(this)
    this.onLoadRestconfModuleData = this.onLoadRestconfModuleData.bind(this)
    this.renderRestconfModulesTreeNodes = this.renderRestconfModulesTreeNodes.bind(this)
  }

  componentDidMount () {
    this.getRestconfModulesTreeData()
  }

  onRequest (apiDetail: ApiDetail, method?: string): void {
    restconfModulesProviderForAPI.request((apiDetail.requestBaseURL || '') + (apiDetail.apiName || ''), { 
      method: method || 'post',
      data: apiDetail.payload
    }).then((res: any) => {
      console.log(res)
      this.setState({
        currentApiDetail: Object.assign({}, apiDetail, { response: res })
      }, () => {
        this.apiConsoleRef.current?.updateApiDetail(this.state.currentApiDetail)
      })
    }).catch((e: Error) => {
      console.log(e)
    })
  }

  getRestconfModulesTreeData (): void {
    restconfModulesProvider.getRestconfModules()
      .then((modules: RestconfModuleInfo[]) => {
        const restconfModulesTreeData = modules.length === 0 ? [] : modules.map((module: RestconfModuleInfo) => {
          return Object.assign({}, module, { 
            title: `${module.name} (rev.${module.revision})`,
            key: `${module.name}@${module.revision}`
          })
        })
        this.setState({
          restconfModulesTreeData: restconfModulesTreeData
            .sort((module1: RestconfModulesTreeData, module2: RestconfModulesTreeData) => {
              return module1.name > module2.name ? 1 : -1
            })
        })
      })
      .catch((e: Error) => {
        console.log(e)
      })
  }

  onLoadRestconfModuleData (moduleNode: AntTreeNode): Promise<void> {
    return new Promise(resolve => {
      if (moduleNode.props.children) {
        resolve()
        return
      }

      type RestApi = { apiName: string, types: RestconfType[], methods: string[] }

      restconfModulesProvider.getModuleRestApi(moduleNode.props.dataRef.name, moduleNode.props.dataRef.revision)
        .then((restApis: RestApi[]) => {
          moduleNode.props.dataRef.children = 
            restApis.length === 0 ? [] : restApis.map((restApi: RestApi) => {
              return {
                title: restApi.apiName,
                key: JSON.stringify(Object.assign({}, { moduleName: moduleNode.props.dataRef.name }, restApi)),
                isLeaf: true
              }
            })
          this.setState({
            restconfModulesTreeData: [...this.state.restconfModulesTreeData],
          })
          resolve()
        })
        .catch((e: Error) => {
          console.log(e)
        })
    })
  }

  renderRestconfModulesTreeNodes (data: RestconfModulesTreeData[]) {
    return data.map((item: RestconfModulesTreeData) => {
      if (item.children) {
        return (
          <Tree.TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderRestconfModulesTreeNodes.bind(this, item.children)()}
          </Tree.TreeNode>
        )
      }
      return <Tree.TreeNode key={item.key} title={item.title} isLeaf={item.isLeaf} dataRef={item} />
    })
  }

  onSelectApi (selectedKeys: string[], e: AntTreeNodeSelectedEvent) {
    if (e.selectedNodes && e.selectedNodes[0].props.isLeaf) {
      const { moduleName, apiName, types, methods } = JSON.parse(e.selectedNodes[0].props.dataRef.key)

      
      const restconfType: RestconfType = 'operations'

      this.setState({
        currentApiDetail: {
          baseUrl: this.props.currentOdl.url,
          requestBaseURL: `${this.props.currentOdl.url}restconf/${restconfType}/${moduleName}:`,
          apiName: apiName,
          payload: {input: {}},
          response: {},
          types: types,
          methods: methods
        }
      }, () => {
        this.apiConsoleRef.current?.updateApiDetail(this.state.currentApiDetail)
      })
    }
  }

  render() {
    return (
      <Row gutter={16} className={styles['api-panel']}>
        <Col span={8}>
          <Row>
            <span>Module: {this.state.restconfModulesTreeData.length}</span>
          </Row>
          <Row className={styles['api-list']}>
            <Tree onSelect={this.onSelectApi} loadData={this.onLoadRestconfModuleData}>{this.renderRestconfModulesTreeNodes(this.state.restconfModulesTreeData)}</Tree>
          </Row>
        </Col>
        <Col span={16}>
          <ApiConsole ref={this.apiConsoleRef} apiDetail={this.state.currentApiDetail} onRequest={this.onRequest} />
        </Col>
      </Row>
    )
  }
}

export default ApiPanel