import React from 'react'
import { Row, Input, Select, message } from 'antd'
import styles from './api-console.module.scss'
import { ApiDetail } from '../index.d'

interface IProps {
  ref: React.RefObject<ApiConsole>
  apiDetail: ApiDetail
  onRequest: (apiDetail: ApiDetail, method: string) => void
}

interface IState {
  payloadString: string
  responseString: string
  response: any
  types: string[]
  methods: string[]
  currentType: string
  currentMethod: string
  requestBaseURL: string
}

class ApiConsole extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    console.log(props)
    this.state = {
      payloadString: '',
      responseString: '',
      response: {},
      types: ['operations'],
      methods: ['GET', 'POST'],
      currentType: 'operations',
      currentMethod: 'POST',
      requestBaseURL: ''
    }

    this.onPayloadInput = this.onPayloadInput.bind(this)
    this.updateApiDetail = this.updateApiDetail.bind(this)
    this.onRequest = this.onRequest.bind(this)
    this.onFilterInput = this.onFilterInput.bind(this)
    this.onSelectMethod = this.onSelectMethod.bind(this)
    this.onSelectType = this.onSelectType.bind(this)
  }

  onPayloadInput (e: React.ChangeEvent<HTMLTextAreaElement>): void {
    this.setState({
      payloadString: e.target.value
    })
  }

  updateApiDetail (apiDetail: ApiDetail): void {
    this.setState({
      payloadString: JSON.stringify(apiDetail.payload || '', null, 4).replace(/^"/, '').replace(/"$/, ''),
      responseString: JSON.stringify(apiDetail.response.data || '', null, 4).replace(/^"/, '').replace(/"$/, ''),
      response: apiDetail.response.data,
      types: apiDetail.types || ['operations'],
      methods: apiDetail.methods || ['GET', 'POST'],
      requestBaseURL: apiDetail.requestBaseURL || ''
    })
  }

  onFilterInput (e: React.ChangeEvent<HTMLInputElement>): void {
    const filterString = e.target.value
    if (!filterString) {
      this.setState({
        responseString: JSON.stringify(this.state.response || '', null, 4).replace(/^"/, '').replace(/"$/, ''),
      })
      return
    }

    const filterStrArr = filterString.split(',').filter(item => item)
      .map(item => item.trim().split('.').filter(item2 => item2))
    if (filterStrArr.length > 0) {
      let result: any = {}
      filterStrArr.forEach(arr => {
        if (arr.length > 0) {
          let prevValue: any = null
          arr.forEach(key => {
            prevValue = prevValue ? prevValue[key] : this.state.response[key]
          })
          result[arr[arr.length - 1]] = prevValue
        }
      })
      this.setState({
        responseString: JSON.stringify(result || '', null, 4).replace(/^"/, '').replace(/"$/, '')
      })
    }
  }

  onRequest (): void {
    if (!this.props.apiDetail || !this.props.apiDetail.apiName) {
      return
    }
    try {
      const payload = JSON.parse(this.state.payloadString.replace(/[\r\n ]/g, ''))
      this.props.onRequest(Object.assign({}, this.props.apiDetail, { payload: payload, requestBaseURL: this.state.requestBaseURL }), this.state.currentMethod)
    } catch (e) {
      console.log(e)
      message.error('入参格式错误！')
    }
  }

  onSelectMethod (value: string): void {
    this.setState({
      currentMethod: value
    })
  }

  onSelectType (value: string): void {
    this.setState({
      currentType: value,
      requestBaseURL: this.state.requestBaseURL ? this.state.requestBaseURL
        .replace(new RegExp(`/restconf/.+/`), `/restconf/${value}/`) : ''
    })
  }

  render() {
    return (
      <Row className={styles['api-console']}>
        <Row className={styles['api-name']}>
          <Input.Search placeholder="请选择REST API"
                  addonBefore={
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      <Select defaultValue={this.state.currentMethod} style={{width: '80px', margin: '0'}} onChange={this.onSelectMethod}>
                        {this.state.methods.map(method => (
                          <Select.Option value={method} key={method}>{method}</Select.Option>
                        ))}
                      </Select>
                      <Select defaultValue={this.state.currentType} style={{width: '100px', margin: '0'}} onChange={this.onSelectType}>
                        {this.state.types.map(type => (
                          <Select.Option value={type} key={type}>{type}</Select.Option>
                        ))}
                      </Select>
                      <span>{this.state.requestBaseURL}</span>
                    </div>
                  }
                  value={this.props.apiDetail.apiName}
                  enterButton="Send"
                  size="large"
                  readOnly
                  onSearch={this.onRequest}
          />
        </Row>
        <Row className={styles['request']}>
          <span className={styles['title']}>Payload:</span>
          <Input.TextArea placeholder="请求入参" 
                          autoSize={{ minRows: 10, maxRows: 10 }}
                          value={this.state.payloadString}
                          onChange={this.onPayloadInput} 
          />
        </Row>
        <Row className={styles['response']}>
          <span className={styles['title']}>Response:</span>
          <Input placeholder="过滤字段（支持对象属性访问器“.”语法，多个字段用英文半角逗号分隔）" 
                 onChange={this.onFilterInput} 
                 style={{marginBottom: '10px'}} />
          <Input.TextArea placeholder="响应报文" 
                          autoSize={{ minRows: 20, maxRows: 20 }}
                          readOnly 
                          value={this.state.responseString} 
          />
        </Row>
      </Row>
    )
  }
}

export default ApiConsole