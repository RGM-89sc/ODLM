import React from 'react'
import { Row, Input, Icon } from 'antd'
import { Path, LocationDescriptorObject } from 'history'
import styles from './side-menu.module.scss'
import { OdlInstane } from '../../libs/odl.d'

interface IProps {
  ref: React.RefObject<SideMenu>
  odlList: OdlInstane[]
  changeRouteWithPath: (path: Path) => void
  changeRouteWithLocationDescObj: (location: LocationDescriptorObject) => void
}

interface IState {
  odlList: OdlInstane[]
  searchKey: string
}

class SideMenu extends React.Component<IProps, IState> {
  constructor(props: Readonly<IProps>) {
    super(props)
    this.state = {
      odlList: this.props.odlList,
      searchKey: ''
    }
    this.onSearch = this.onSearch.bind(this)
    this.routeToWithPath = this.routeToWithPath.bind(this)
    this.onSearchChange = this.onSearchChange.bind(this)
  }

  updateOdlList (odlList: OdlInstane[]): void {
    this.setState({
      odlList: odlList,
      searchKey: ''
    })
  }

  onSearch (value: string): void {
    if (!value) {
      this.setState({
        odlList: this.props.odlList
      })
    }
    const reg = new RegExp(value)
    this.setState({
      odlList: this.props.odlList.filter((odl: OdlInstane) => {
        return reg.test(odl.name) || reg.test(odl.remark || '')
      })
    })
  }

  onSelectODL (odl: OdlInstane): void {
    this.routeToWithLocationDescObj({
      pathname: `/odl/${odl.id}`,
      state: {
        odl: odl
      }
    })
  }

  onSearchChange (e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({
      searchKey: e.target.value
    }, () => {
      this.onSearch(this.state.searchKey)
    })
  }

  routeToWithPath (path: Path): void {
    this.props.changeRouteWithPath(path)
  }

  routeToWithLocationDescObj (location: LocationDescriptorObject): void {
    this.props.changeRouteWithLocationDescObj(location)
  }

  render () {
    return (
      <div className={styles['side']}>
        <Row className={styles['app']} 
             type="flex" 
             justify="center" 
             align="middle">
          <Icon type="home" onClick={this.routeToWithPath.bind(this, '/')} />
          <span>ODLM</span>
        </Row>
        <Row className={styles['search-box']}>
          <Input.Search placeholder="搜索ODL实例" 
                        value={this.state.searchKey} 
                        onChange={this.onSearchChange} 
                        onSearch={this.onSearch} 
          />
        </Row>
        <Row className={styles['list']}>
          {this.state.odlList.map((odl: OdlInstane) => (
            <Row key={odl.id} className={styles['list-item']} onClick={this.onSelectODL.bind(this, odl)}>
              <span className={styles['name']}>{odl.name}</span>
              <span className={styles['remark']}>{odl.remark || '无详细描述'}</span>
            </Row>
          ))}
        </Row>
      </div>
    )
  }
}

export default SideMenu