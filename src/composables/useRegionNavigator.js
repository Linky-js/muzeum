import { ref, computed } from 'vue'

export function useRegionNavigator(tree, sumPatients) {
  const currentList = ref([])
  const currentLevel = ref('okrug')
  const currentRegion = ref(null)
  const stack = ref([])

  const setRoot = () => {
    currentList.value = tree.value
    currentLevel.value = 'okrug'
    stack.value = []
  }

  const openChildren = (item) => {
    if (!item.children) return

    stack.value.push({
      list: currentList.value,
      level: currentLevel.value
    })

    currentList.value = item.children
    currentLevel.value = item.children[0]?.type || 'lpu'
  }

  const goBack = () => {
    const prev = stack.value.pop()
    if (!prev) return
    currentList.value = prev.list
    currentLevel.value = prev.level
  }

  const makeRegionPayload = (item, parentChain) => {
    const region = {}

    if (item.type === 'okrug') region.okrug = item.name
    if (item.type === 'oblast') Object.assign(region, { okrug: parentChain[0], oblast: item.name })
    if (item.type === 'gorod') Object.assign(region, { okrug: parentChain[0], oblast: parentChain[1], gorod: item.name })
    if (item.type === 'lpu') Object.assign(region, { ...parentChain, lpu: item.name, fullname: item.fullname })

    region.patients = sumPatients(item)
    region.type = item.type

    return region
  }

  return {
    currentList,
    currentLevel,
    currentRegion,
    stack,
    setRoot,
    openChildren,
    goBack,
    makeRegionPayload
  }
}
