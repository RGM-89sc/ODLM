import React from 'react'
import { Form, Input, Icon, Button, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { OdlInstane } from '../../libs/odl'
import uuid from 'uuid/v4'
import odlManager from '../../tools/odlManager'
import styles from './save-odl-form.module.scss'

interface IProps extends FormComponentProps {
  onCloseModal: () => void
  updateOdlList: () => void
  returnToHomePage: () => void
  odlInstane?: OdlInstane
}

class SaveOdlForm extends React.Component<IProps, {}> {
  constructor(props: Readonly<IProps>) {
    super(props)

    this.save = this.save.bind(this)
  }

  componentDidMount () {
    if (this.props.odlInstane) {
      this.props.form.setFieldsValue({
        name: this.props.odlInstane.name,
        url: this.props.odlInstane.url,
        remark: this.props.odlInstane.remark,
        username: this.props.odlInstane.auth?.username,
        password: this.props.odlInstane.auth?.password
      })
    }
  }

  save: (e: React.FormEvent<HTMLFormElement>) => void = e => {
    e.preventDefault()
    this.props.form.validateFields((err: any, values: any) => {
      if (!err) {
        const odlInstane: OdlInstane = {
          id: this.props.odlInstane?.id || uuid(),
          name: values.name,
          url: values.url,
          remark: values.remark,
        }
        if (values.username && values.password) {
          odlInstane.auth = {
            username: values.username,
            password: values.password
          }
        }
        if (!this.props.odlInstane) {
          odlManager.addOdl(odlInstane)
        } else {
          odlManager.editOdl(odlInstane)
          setTimeout(() => {
            this.props.returnToHomePage()
          }, 0)
        }
        message.success('保存成功')
        this.props.form.resetFields()
        this.props.updateOdlList()
        this.props.onCloseModal()
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <Form ref="form" onSubmit={this.save}>
        <Form.Item>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入设ODL实例名称！' }],
          })(
            <Input
              prefix={<Icon type="form" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
              placeholder="请输入ODL实例名称"
            />,
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('url', {
            rules: [{ required: true, message: '请输入ODL网络地址！' }],
          })(
            <Input
              prefix={<Icon type="environment" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
              type="text"
              placeholder="请输入ODL网络地址"
            />,
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('username', {
            rules: [{ required: false, message: '请输入用户名！' }],
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
              type="text"
              placeholder="请输入用户名"
            />,
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('password', {
            rules: [{ required: false, message: '请输入密码！' }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
              type="password"
              placeholder="请输入密码"
            />,
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('remark', {})(
            <Input.TextArea placeholder="请输入备注" autoSize={{ minRows: 5, maxRows: 5 }} />
          )}
        </Form.Item>
        <div className={styles['form-buttons']}>
          <Button type="primary" htmlType="submit">确定</Button>
        </div>
      </Form>
    )
  }
}

export default Form.create<IProps>({ name: 'add_odl_form' })(SaveOdlForm)