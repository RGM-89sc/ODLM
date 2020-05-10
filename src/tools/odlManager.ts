import { OdlInstane } from '../libs/odl.d'

export default {
  addOdl: (odlInstane: OdlInstane): void => {
    let odlList: OdlInstane[] = JSON.parse(window.localStorage.getItem('odlList') || '[]') || []
    odlList.push(odlInstane)
    window.localStorage.setItem('odlList', JSON.stringify(odlList))
  },

  updateOdlList: (odlList: OdlInstane[]): void => {
    window.localStorage.setItem('odlList', JSON.stringify(odlList))
  },

  editOdl: function (odlInstane: OdlInstane): void {
    const odlList: OdlInstane[] = this.getOdlList()
    const index = this.findOdlByIdInOdlList(odlList, odlInstane.id).index
    odlList[index] = odlInstane
    window.localStorage.setItem('odlList', JSON.stringify(odlList))
  },

  getOdlList: (): OdlInstane[] => {
    return JSON.parse(window.localStorage.getItem('odlList') || '[]') || []
  },

  getOdlById: function (id: string): OdlInstane | {} {
    const odlList: OdlInstane[] = this.getOdlList()
    return this.findOdlByIdInOdlList(odlList, id).odlInstane
  },

  deleteOblById: function (id: string): OdlInstane {
    const odlList: OdlInstane[] = this.getOdlList()
    const index = this.findOdlByIdInOdlList(odlList, id).index
    const odlInstane = odlList.splice(index, 1)[0]
    window.localStorage.setItem('odlList', JSON.stringify(odlList))
    return odlInstane
  },

  findOdlByIdInOdlList: (odlList: OdlInstane[], id: string): { odlInstane: OdlInstane | {}, index: number } => {
    let odlInstane: OdlInstane | {} = {}
    let i = 0
    odlList.some((odl: OdlInstane, index: number) => {
      if (odl.id === id) {
        odlInstane = odl
        i = index
        return true
      }
      return false
    })
    return {
      odlInstane: odlInstane,
      index: i
    }
  }
}