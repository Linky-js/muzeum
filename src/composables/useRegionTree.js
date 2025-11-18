import { ref, computed } from 'vue'

export function useRegionTree() {
  const dataType = ref('xsn')
  const dataAll = ref([])
  const tree = ref([])

  const buildTree = (raw, type) => {
    const treeMap = {}

    raw.forEach(item => {
      const okrug = item['Федеральный округ']
      const oblast = item['Область/Регион'] || ''
      const city = item['Город']

      if (!treeMap[okrug]) {
        treeMap[okrug] = { name: okrug, type: 'okrug', children: {} }
      }

      if (oblast && !treeMap[okrug].children[oblast]) {
        treeMap[okrug].children[oblast] = { name: oblast, type: 'oblast', children: {} }
      }

      const cityTarget = oblast
        ? treeMap[okrug].children[oblast].children
        : treeMap[okrug].children

      if (!cityTarget[city]) {
        cityTarget[city] = { name: city, type: 'gorod', children: [] }
      }

      cityTarget[city].children.push({
        name: type === 'xsn'
          ? item['ЛПУ (сокращенное наименование)']
          : item['ЛПУ'],
        type: 'lpu',
        patients: item['Набор пациентов'],
        fullname: item['Полное']
      })
    })

    tree.value = Object.values(treeMap).map(o => ({
      ...o,
      children: Object.values(o.children).map(ob => ({
        ...ob,
        children: Object.values(ob.children),
      })),
    }))
  }

  const sumPatients = (node) => {
    if (!node) return 0
    if (node.patients) return Number(node.patients) || 0
    if (node.children && node.children.length) {
      return node.children.reduce((s, c) => s + sumPatients(c), 0)
    }
    return 0
  }

  return {
    dataType, dataAll, tree,
    buildTree, sumPatients
  }
}
