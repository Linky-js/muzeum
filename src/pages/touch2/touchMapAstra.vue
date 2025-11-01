<script setup>
import Breadcrums from "@/components/touchScreenComponents/Breadcrums.vue";
import MenuNavigation from "@/components/touchScreenComponents/MenuNavigation.vue";
import MapSceneAstra from '@/components/maps/MapSceneAstra.vue';
import BackBtn from "@/components/touchScreenComponents/BackBtn.vue";
import { ref, computed, onMounted, nextTick } from 'vue';
import { useBroadcastBus } from '@/composables/useBroadcastBus.js'
import { initMasterSync } from '@/composables/syncRouterSimple.js'
import { useRouter } from 'vue-router'

// --- базовые элементы интерфейса ---
const breadcrumbsList = ref([
  { id: 0, title: "Главная", link: "/touch2" },
  { id: 1, title: "Сотрудничество Центра Алмазова с регионами", link: "/touch-screen-3" },
])

const links = ref([
  { id: 0, name: "Курируемые регионы", link: "/touchmaptwo" },
  { id: 1, name: "Карта AstraZeneca", link: "/touchmaptwo" },
  { id: 2, name: "Тепловая карта факторы риска", link: "/touchmaptwo" },
])

// --- подключаем синхронизацию с монитором ---
const router = useRouter()
const bus = useBroadcastBus({ role: 'touch', pairId: '2', debug: true })
initMasterSync(router, bus, '2')

// --- состояние карты и поиска ---
const targetRegionId = ref('')
const targetregion = ref({ id: '', name: '' })
const unFocus = ref(false)

const dataType = ref('xsn') // тип активного списка: 'xsn' или 'xbp'
const dataAll = ref([]) // сырые данные
const tree = ref([]) // иерархическая структура
const currentLevel = ref('okrug') // текущий уровень (okrug / oblast / gorod / lpu)
const currentList = ref([]) // список элементов на экране
const currentRegion = ref(null)
const stack = ref([]) // история для кнопки "Назад"
const searchQuery = ref('')

// --- поиск по всем 
const flattenAll = computed(() => {
  const out = []


  tree.value.forEach((okrug) => {


    // Округ
    out.push({
      name: okrug.name,
      type: 'okrug',
      path: [okrug.name],
      node: okrug,
    })

    // Области (если есть)
    okrug.children.forEach((oblast) => {
      console.log('oblast', oblast);
      out.push({
        name: oblast.name,
        type: 'oblast',
        path: [okrug.name, oblast.name],
        node: oblast,
        parent: okrug,
      })

      // Города
      oblast.children.forEach((gorod) => {
        out.push({
          name: gorod.name,
          type: 'gorod',
          path: [okrug.name, oblast.name, gorod.name],
          node: gorod,
          parent: oblast,
          grandparent: okrug,
        })
      })
    })

    // Если у округа есть города прямо (редкий случай в структуре) — обработаем их тоже
    // (если в tree у тебя бывают города как дети округа без слоя 'oblast')
    if (!Object.values(okrug.children || {}).length) {
      // ничего, уже обработали в общем случае
    }
  })


  return out
})

// 2) Результат поиска — если пусто, возвращаем текущий список (как раньше),
// иначе — результаты из flattenAll, где type !== 'lpu' и name содержит q
const filteredList = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) {
    // старое поведение: показываем текущий уровень
    return currentList.value
  }
  console.log('flattenAll', flattenAll.value);

  // поиск по всем уровням (okrug/oblast/gorod)
  return flattenAll.value.filter(item => item.name.toLowerCase().includes(q))
})

const openSearchItem = (res) => {
  // res: { name, type, path, node, parent, grandparent }
  // Нужно:
  // 1) очистить стек (или сохранить текущее состояние, как считаешь нужным)
  // 2) найти соответствующий объект в tree и выставить currentList так,
  //    чтобы пользователь увидел уровень, из которого можно перейти дальше.

  // Простой, понятный вариант: если это округ — откроем его (показать его children)
  // если область — откроем список областей внутри округа, затем выделим область
  // если город — откроем список городов в области

  if (res.type === 'okrug') {
    // показать дети округа (области)
    stack.value.push({ list: currentList.value, level: currentLevel.value })
    currentList.value = res.node.children || []
    currentLevel.value = 'oblast'
  } else if (res.type === 'oblast') {
    // открыть области внутри округа и затем показать города в этой области
    stack.value.push({ list: currentList.value, level: currentLevel.value })
    // сначала установим список на children округа (чтобы пользователь видел где область)
    currentList.value = res.parent.children || []
    currentLevel.value = 'oblast'
    // затем можно автоматически "открыть" саму область — заменим список на города области
    // и запомним предыдущий уровень в стеке
    stack.value.push({ list: currentList.value, level: currentLevel.value })
    currentList.value = res.node.children || []
    currentLevel.value = 'gorod'
  } else if (res.type === 'gorod') {
    // аналогично — откроем список городов внутри области
    stack.value.push({ list: currentList.value, level: currentLevel.value })
    currentList.value = res.grandparent
      ? (res.parent ? res.parent.children : [])
      : (res.parent ? res.parent.children : [])
    currentLevel.value = 'gorod'
  }

  // очистим поиск
  searchQuery.value = ''

  // опционально — синхронизируем с монитором
  bus.send('navigate', { region: res.name, type: res.type, path: res.path }, { role: 'monitor', pairId: '2' })
}

// --- загрузка и нормализация данных ---
const loadData = async (type = 'xsn') => {
  dataType.value = type
  const url = type === 'xsn' ? '/datas/xsn.json' : '/datas/xbp.json'
  const res = await fetch(url)
  const raw = await res.json()
  console.log('raw', raw);

  dataAll.value = raw

  const treeMap = {}

  raw.forEach(item => {
    const okrug = item['Федеральный округ']
    const oblast = item['Область/Регион'] || ''
    const city = item['Город']
    if (okrug == '') console.log(item);

    if (!treeMap[okrug]) {
      treeMap[okrug] = { name: okrug, type: 'okrug', children: {} }
    }
    if (oblast && !treeMap[okrug].children[oblast]) {
      treeMap[okrug].children[oblast] = { name: oblast, type: 'oblast', children: {} }
    }

    const cityTarget = oblast ? treeMap[okrug].children[oblast].children : treeMap[okrug].children
    if (!cityTarget[city]) {
      cityTarget[city] = { name: city, type: 'gorod', children: [] }
    }

    cityTarget[city].children.push({
      name: type === 'xsn'
        ? item['ЛПУ (сокращенное наименование)']
        : item['ЛПУ'],
      type: 'lpu',
      patients: type === 'xsn'
        ? item['Набор пациентов']
        : item['Набор пациентов'],
      fullname: item['Полное']
    })
  })



  // преобразуем в массивы
  tree.value = Object.values(treeMap).map(o => ({
    ...o,
    children: Object.values(o.children).map(ob => ({
      ...ob,
      children: Object.values(ob.children),
    })),
  }))
  console.log('tree', tree);
  currentLevel.value = 'okrug'
  currentList.value = tree.value
  stack.value = []
  searchQuery.value = ''
}

function sumPatients(node) {
  if (!node) return 0

  // Если у узла есть поле patients — это LPU
  if (node.patients) return Number(node.patients) || 0

  // Если есть дети — суммируем всех потомков
  if (node.children && node.children.length) {
    return node.children.reduce((sum, child) => sum + sumPatients(child), 0)
  }

  return 0
}
// --- открытие следующего уровня ---
const openItem = async (item, el) => {
  let newItem = {}

  if (item.type === 'okrug') {
    currentRegion.value = item
    newItem = {
      okrug: item.name,
      patients: sumPatients(item),
      type: 'okrug',
    }
  } else if (item.type === 'oblast') {
    newItem = {
      ...JSON.parse(JSON.stringify(currentRegion.value)),
    }
    newItem.oblast = item.name
    newItem.type = 'oblast'
    newItem.patients = sumPatients(item)
  } else if (item.type === 'gorod') {
    newItem = {
      ...JSON.parse(JSON.stringify(currentRegion.value)),
    }
    newItem.gorod = item.name
    newItem.type = 'gorod'
    newItem.patients = sumPatients(item)
  } else if (item.type === 'lpu') {
    newItem = {
      ...JSON.parse(JSON.stringify(currentRegion.value)),
    }
    newItem.lpu = item.name
    newItem.fullname = item.fullname
    newItem.type = 'lpu'
    newItem.patients = sumPatients(item)
  }
  currentRegion.value = newItem

  bus.send('navigate', { region: newItem, type: dataType.value }, { role: 'monitor', pairId: '2' })

  const elements = document.querySelectorAll('.region')
  elements.forEach(el => el.classList.remove('active'))
  const currentElement = el.target
  console.log('currentElement', currentElement);

  currentElement.classList.add('active')
  const activeEl = document.querySelector(`.region.active`)
  if (activeEl) {
    const wrapper = document.querySelector('.custom_list')
    const offsetTop = activeEl.offsetTop - 500
    wrapper?.scrollTo({
      top: offsetTop > 0 ? offsetTop : 0,
      behavior: 'smooth',
    })
  }


  if (!item.children) return
  stack.value.push({
    list: currentList.value,
    level: currentLevel.value,
  })
  currentList.value = item.children
  currentLevel.value = item.children[0]?.type || 'lpu'
  searchQuery.value = ''


}

// --- кнопка Назад ---
const goBack = () => {
  const prev = stack.value.pop()
  if (!prev) return
  currentList.value = prev.list
  currentLevel.value = prev.level
  searchQuery.value = ''
}

// --- очистка поиска ---
const clearRegion = () => {
  targetregion.value = { id: '', name: '' }
  unFocus.value = true
  setTimeout(() => { unFocus.value = false }, 100)
}

// --- при монтировании загружаем ХСН по умолчанию ---
onMounted(() => {
  loadData('xsn')
})
</script>


<template>
  <div class="wrapper-content">
    <div class="header">
      <Breadcrums :list="breadcrumbsList" />
      <div class="header__logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="237" height="60" viewBox="0 0 237 60" fill="none">
          <path
            d="M79.3457 54.6206L79.2016 44.6736C79.2016 44.6736 79.2592 41.4444 77.0968 39.801C75.5687 38.6188 73.2333 38.1575 71.4458 38.1575C68.1877 38.1575 65.91 39.4838 64.7567 41.6174C64.6991 41.7327 64.6414 41.8192 64.5837 41.9345L67.5823 43.2031C67.8994 42.021 68.8221 40.6947 71.5611 40.6947C75.8859 40.6947 75.8859 44.0681 75.8859 46.0575V46.5476L72.8009 46.8071C67.0345 47.2684 64.9586 48.5659 63.8629 50.2093C63.2863 51.0743 62.998 52.0834 62.998 53.1213C62.998 56.4082 65.7947 58.6283 69.5717 58.6283C73.2622 58.6283 75.0786 56.5235 76.0589 55.4856C76.1454 56.9848 76.4337 58.3399 76.4337 58.3399H79.8359C79.4611 57.5038 79.3457 54.6206 79.3457 54.6206ZM75.4246 52.9772C74.4731 54.9954 72.5702 55.8892 70.2925 55.8892C67.8706 55.8892 66.6597 54.5629 66.6597 53.006C66.6597 51.6509 67.2651 50.2958 70.8691 49.5173C72.9739 49.056 74.6749 48.8254 75.9436 48.6235C75.9436 51.4491 75.9147 51.9104 75.4246 52.9772ZM192.108 54.6206L191.964 44.6736C191.964 44.6736 192.021 41.4444 189.859 39.801C188.331 38.6188 185.995 38.1575 184.208 38.1575C180.95 38.1575 178.672 39.4838 177.519 41.6174C177.461 41.7327 177.403 41.8192 177.346 41.9345L180.344 43.2031C180.661 42.021 181.584 40.6947 184.323 40.6947C188.648 40.6947 188.648 44.0681 188.648 46.0575V46.5476L185.563 46.8071C179.797 47.2684 177.721 48.5659 176.625 50.2093C176.048 51.0743 175.76 52.0834 175.76 53.1213C175.76 56.4082 178.557 58.6283 182.334 58.6283C186.024 58.6283 187.841 56.5235 188.821 55.4856C188.907 56.9848 189.196 58.3399 189.225 58.3399H192.598C192.223 57.5038 192.108 54.6206 192.108 54.6206ZM188.187 52.9772C187.235 54.9954 185.332 55.8892 183.055 55.8892C180.633 55.8892 179.393 54.5629 179.393 53.006C179.393 51.6509 179.998 50.2958 183.602 49.5173C185.707 49.056 187.408 48.8254 188.677 48.6235C188.734 51.4491 188.677 51.9104 188.187 52.9772ZM148.427 56.2352C143.843 56.3217 142.488 52.1987 142.574 48.9695H156.529C156.529 48.1622 156.529 46.663 156.154 45.0195C155.001 40.1469 151.599 38.1863 148.024 38.1863C143.929 38.1863 139.115 40.9831 139.115 48.2776C139.115 54.7936 142.401 58.7148 148.139 58.7148C152.348 58.7148 154.511 56.5524 155.606 54.6494L152.435 54.044C151.628 55.3414 150.301 56.1775 148.427 56.2352ZM147.764 40.6659C149.725 40.6659 152.637 41.5309 152.925 46.6053H142.632C143.007 42.713 144.996 40.6659 147.764 40.6659ZM111.407 56.2352C106.823 56.3217 105.468 52.1987 105.554 48.9695H119.509C119.509 48.1622 119.509 46.663 119.134 45.0195C117.981 40.1469 114.578 38.1863 111.003 38.1863C106.909 38.1863 102.094 40.9831 102.094 48.2776C102.094 54.7936 105.381 58.7148 111.119 58.7148C115.357 58.7148 117.491 56.5524 118.586 54.6494L115.415 54.044C114.578 55.3414 113.281 56.1775 111.407 56.2352ZM110.744 40.6659C112.704 40.6659 115.616 41.5309 115.905 46.6053H105.612C105.987 42.713 107.947 40.6659 110.744 40.6659ZM167.485 56.2064C165.294 56.2064 161.604 54.8224 161.604 48.4217C161.604 46.6918 161.921 40.6082 167.255 40.6082C169.965 40.6082 171.205 42.0787 171.781 43.3473L174.837 42.0787C172.963 38.936 169.561 38.2152 167.139 38.2152C160.969 38.2152 157.971 43.2031 157.971 48.6812C157.971 53.4385 160.566 58.7148 167.428 58.7148C171.406 58.7148 173.598 56.783 174.837 54.8801L171.954 53.6691C171.262 54.9954 169.994 56.2064 167.485 56.2064ZM137.039 42.8283C136.087 39.628 133.117 38.3882 130.667 38.3882C129.513 38.3882 126.428 38.6765 124.612 41.848V39.0225H121.354V58.3111H124.612V47.2973C124.612 45.8557 124.612 44.3852 126.054 42.9436C127.092 41.9057 128.331 41.4732 129.773 41.4732C131.532 41.4732 133.348 42.2805 133.925 44.1258C134.127 44.7889 134.127 45.3655 134.127 47.3261V58.3111H137.385V46.8071C137.385 45.1637 137.385 43.9816 137.039 42.8283ZM86.1213 55.2549L100.566 35.9663V32.7948H82.1713V35.9375H96.6738L82.1713 54.9954V58.3111H100.941V55.2549H86.1213ZM56.2513 42.367V38.8783H52.9933V58.2823H56.2513V49.3732C56.2513 47.7009 56.1936 45.7403 57.0874 44.3276C58.1542 42.5976 59.7111 41.9345 62.9115 41.9345V38.5612C61.5852 38.6188 58.0965 38.7053 56.2513 42.367ZM50.0524 41.5597V38.8495H46.5349V32.7948L43.1615 34.2075V38.8495H40.0765V41.5597H43.1615V54.0728C43.1327 56.61 43.1327 58.4264 46.9097 58.4264C48.1495 58.4264 49.5046 58.167 50.0812 58.1093V55.4279C49.4181 55.6297 48.5531 55.8892 47.9477 55.8892C46.5637 55.8892 46.5637 54.9089 46.5637 52.6024V41.5597H50.0524ZM31.3692 46.6053C29.2933 46.2017 26.8714 45.4232 26.8714 43.5779C26.8714 42.2805 28.1401 40.7524 30.7061 40.7524C33.3298 40.7524 34.8868 42.54 35.1174 43.232L38.1448 41.9634C36.7608 39.3108 33.993 38.244 31.0809 38.244C26.5831 38.244 23.6134 40.4641 23.6134 43.9816C23.6134 47.9892 27.0444 48.7677 30.3601 49.4885C33.2145 50.1228 35.9824 50.8148 35.9824 53.006C35.9824 55.0819 34.2813 56.1775 31.3981 56.1775C29.0627 56.1775 27.5058 55.5144 26.6408 54.0151L23.2098 54.6206C24.5649 57.3596 27.3328 58.6859 31.2827 58.6859C36.6167 58.6859 39.4134 55.7451 39.4134 52.6024C39.3845 48.5659 35.6652 47.4703 31.3692 46.6053ZM13.2627 32.7659H9.71639L0 58.3111H3.604L6.45837 50.4976H16.1748L18.9426 58.3111H22.5178L13.2627 32.7659ZM7.55399 47.6144L11.4463 37.0042L15.1656 47.6144H7.55399Z"
            fill="white" />
          <path
            d="M221.488 21.8098C221.055 17.8598 223.045 -6.07079 212.06 1.45437C205.14 7.22077 195.049 19.4456 190.984 27.259C189.455 30.3441 191.214 30.9207 193.636 32.4488L193.924 32.593L200.959 36.2546L207.966 40.0604L213.184 43.0013C207.62 46.0863 194.328 58.2823 208.6 59.2049C212.579 59.0319 227.456 56.1776 229.791 53.2944C230.195 52.7177 230.224 52.1122 229.878 51.4779L229.532 50.9878L229.128 50.5841L228.754 50.2958L225.582 48.3641L221.661 46.0575C238.701 35.1302 245.332 28.5853 221.488 21.8098ZM215.491 20.0799L210.676 18.9554L206.178 18.2058L204.736 18.1193C214.655 8.48939 214.338 4.48173 215.491 20.0799ZM223.045 48.9407L224.631 50.0075L225.697 50.8436L226.13 51.2761L226.447 51.6509V51.6798V51.7086V51.7374L226.418 51.7663L226.36 51.7951L211.916 52.9195L212.521 52.3429L215.606 50.0363L220.104 46.9801L223.045 48.9407ZM227.917 32.5065L227.831 32.7083L227.485 33.1696L226.216 34.2652L224.602 35.4762L222.468 36.9466L214.568 42.021L202.92 35.3608L196.519 31.5262L194.905 30.3729L194.674 30.1422L194.415 29.6809C194.213 29.0754 194.934 28.2682 195.308 27.8933L202.286 20.7718C206.524 30.3152 220.133 51.3914 221.257 27.951L224.169 29.3061L226.908 30.8919L227.6 31.4685L227.889 31.9298L227.946 32.1893L227.917 32.5065Z"
            fill="white" />
        </svg>
      </div>
    </div>
    <div class="content relative">
      <div class="content__top">
        <h1 class="content__title animBtn">Сотрудничество Центра Алмазова с регионами</h1>
      </div>
    </div>
    <MapSceneAstra class="map" :targetregion="currentRegion" :dontscale="true" :un-focus="unFocus" />
    <div class="regions__btns">
      <div class="question">
        <p class="dopText">
          Выбери диагноз и регион, <br>чтобы узнать данные исследований AstraZeneca
        </p>
        <div class="regions__switch">
          <button @click="loadData('xsn')" :class="{ active: dataType === 'xsn' }">
            ХСН
            <svg width="48" height="53" viewBox="0 0 48 53" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19.8362 0H25.6696V3.85583C27.526 3.74208 29.3242 3.85 30.94 4.19125C24.0858 6.88917 20.9315 13.8235 20.4152 14.9581L20.3831 15.0281C18.7075 14.7744 16.8933 14.5615 15.1769 14.5775C13.4065 14.7292 11.69 14.9902 8.86229 16.5827C8.46271 16.8656 7.92604 17.3265 7.19542 18.0323C7.14292 17.9929 7.08604 17.9594 7.01167 17.9112L6.79146 17.7712C6.23958 17.4136 5.66797 17.0874 5.07937 16.7942C3.59771 16.0592 1.78062 15.4335 0 15.4335V9.77667C3.07854 9.77667 5.84792 10.8223 7.73646 11.76C8.39125 12.0852 8.96583 12.409 9.44271 12.6977C9.87224 11.7918 10.4243 10.9493 11.0833 10.1937L7.87792 5.16687L13.0127 1.83167L15.9687 6.46917C17.2084 5.83571 18.5022 5.31447 19.8348 4.91167L19.8362 0ZM35.5235 12.6744C33.3973 13.6602 31.5569 15.279 29.8987 18.3969C29.8987 18.3969 26.2179 16.714 23.2312 15.839C25.5237 11.1927 28.1896 8.57938 32.1227 6.75646C35.9275 4.99188 40.4644 4.53979 45.8573 4.72792L45.6006 11.6667C40.6277 11.4946 37.7767 11.6302 35.5235 12.6744Z"
                fill="white" />
              <path
                d="M10.0391 19.2795C-0.552757 28.7266 14.5775 52.3443 26.6831 52.3443C38.7887 52.3443 55.456 28.747 43.327 17.9291C43.0745 17.7034 42.8237 17.4759 42.5745 17.2466C41.5712 16.3278 40.9047 15.7153 39.0541 14.6157C35.3324 14.6157 33.0895 18.3388 32.0687 20.608C32.0171 20.7214 31.9536 20.829 31.8791 20.9288L29.5239 27.4768L28.6766 30.5232C28.587 30.8445 28.6101 31.1868 28.7422 31.493L29.7339 33.7826L34.8629 33.1876L35.1997 36.0838L30.3741 36.6453L30.6877 41.2405L27.7783 41.4389L27.3875 35.7061L26.0662 32.6509C25.6685 31.7321 25.598 30.7047 25.8664 29.7401L25.8912 29.6497L22.925 30.9913L20.9854 35.8928L18.2729 34.8195L19.81 30.9374L15.1287 29.8349L15.7966 26.9955L21.6387 28.3722L26.9689 25.9586L28.7627 20.9711C24.1427 18.7997 14.6547 15.1597 10.0377 19.2766"
                fill="white" />
            </svg>

          </button>
          <button @click="loadData('xbp')" :class="{ active: dataType === 'xbp' }">
            ХБП
            <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75" fill="none">
              <path
                d="M28.2969 34.375L28.7281 33.0875L28.7906 32.8937C29.3844 31.1437 30.1187 28.9562 30.6125 26.8687C31.0687 24.9562 31.6406 21.9375 30.8719 19.0875C30.3746 17.1503 29.2287 15.4419 27.625 14.2469C25.8031 12.9063 23.7594 12.5 22 12.5C14.6531 12.5 10.75 18.7312 9.07812 22.3719C7.19375 26.4656 6.25 31.1875 6.25 34.0906C6.25 37.1219 7.29688 41.175 8.64375 44.3563C9.3375 45.9969 10.2812 47.825 11.525 49.3563C12.5625 50.6344 14.9562 53.125 18.6906 53.125C20.075 53.125 21.6062 52.7938 23.025 51.8938C24.2276 51.1216 25.2053 50.0458 25.8594 48.775C26.8281 46.9188 27.0219 44.8969 27.1031 43.7812C27.1656 42.95 27.1906 41.9125 27.2156 41.0312L27.2281 40.625C28.2594 40.625 29.0562 40.6281 29.6875 40.6469V59.375C29.6879 60.2038 30.0176 60.9985 30.6039 61.5843C31.1902 62.17 31.9853 62.4989 32.8141 62.4984C33.6429 62.498 34.4376 62.1684 35.0233 61.582C35.6091 60.9957 35.9379 60.2007 35.9375 59.3719V39.8094C35.9375 39.3406 35.9437 38.4563 35.7187 37.6656C35.5418 37.0342 35.2179 36.4536 34.7736 35.9714C34.3294 35.4891 33.7773 35.1187 33.1625 34.8906C32.2406 34.5344 31.1844 34.4531 30.3094 34.4156C29.6388 34.3911 28.9679 34.3786 28.2969 34.3781M47.7719 40.625C46.7375 40.625 45.9406 40.6281 45.3125 40.6469V59.375C45.3121 60.2038 44.9824 60.9985 44.3961 61.5843C43.8098 62.17 43.0147 62.4989 42.1859 62.4984C41.3571 62.498 40.5624 62.1684 39.9767 61.582C39.3909 60.9957 39.0621 60.2007 39.0625 59.3719V39.8094C39.0625 39.3406 39.0562 38.4563 39.2812 37.6656C39.4582 37.0342 39.7821 36.4536 40.2263 35.9714C40.6706 35.4891 41.2227 35.1187 41.8375 34.8906C42.7562 34.5344 43.8156 34.4531 44.6906 34.4156C45.2594 34.3948 45.9292 34.3823 46.7 34.3781L46.2687 33.0875L46.2062 32.8937C45.6156 31.1437 44.8781 28.9562 44.3844 26.8687C43.9281 24.9562 43.3594 21.9375 44.1281 19.0875C44.6246 17.1507 45.7693 15.4424 47.3719 14.2469C49.1937 12.9063 51.2406 12.5 53 12.5C60.3469 12.5 64.25 18.7312 65.9219 22.3719C67.8062 26.4656 68.7469 31.1906 68.7469 34.0906C68.7469 37.1219 67.7 41.175 66.3531 44.3563C65.6594 45.9969 64.7156 47.825 63.4719 49.3563C62.4375 50.6344 60.0406 53.125 56.3125 53.125C54.925 53.125 53.3969 52.7938 51.975 51.8938C50.7724 51.1216 49.7947 50.0458 49.1406 48.775C48.1719 46.9188 47.9812 44.8969 47.9 43.7812C47.833 42.7303 47.7913 41.6779 47.775 40.625"
                fill="white" />
            </svg>
          </button>
        </div>
        <div class="input_wrap">
          <div @click="clearRegion" class="btnSearch">
            <svg v-if="targetregion.name === '' || !targetregion.name" xmlns="http://www.w3.org/2000/svg" width="64"
              height="64" viewBox="0 0 64 64" fill="none" opacity="0.2">
              <path
                d="M48.0814 44.3121L59.5019 55.7326L55.7307 59.5038L44.3102 48.0833C40.2038 51.3686 34.996 53.334 29.332 53.334C16.084 53.334 5.33203 42.582 5.33203 29.334C5.33203 16.086 16.084 5.33398 29.332 5.33398C42.58 5.33398 53.332 16.086 53.332 29.334C53.332 34.998 51.3667 40.2057 48.0814 44.3121ZM42.7312 42.3334C45.992 38.9729 47.9987 34.3889 47.9987 29.334C47.9987 19.0206 39.6454 10.6673 29.332 10.6673C19.0187 10.6673 10.6654 19.0206 10.6654 29.334C10.6654 39.6473 19.0187 48.0006 29.332 48.0006C34.387 48.0006 38.971 45.994 42.3315 42.7332L42.7312 42.3334Z"
                fill="white" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" opacity="0.2" fill="white"
              class="bi bi-x-lg" viewBox="0 0 16 16">
              <path
                d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
            </svg>
          </div>
          <input @focus="regionUp = true" type="text" class="input_quiz" v-model="searchQuery"
            placeholder="Поиск по округу, региону, городу" />
          <div class="custom_list-wrapper">
            <div class="custom_list">
              <!-- если поиск пуст — item это node с children и т.д. -->
              <template v-if="!searchQuery.trim()">
                <div v-for="item in filteredList" :key="item.name" class="region" @click="openItem(item, $event)">
                  {{ item.name }}
                </div>
              </template>

              <template v-else>
                <div v-for="res in filteredList" :key="res.path.join('>')" class="region search-result"
                  @click="openSearchItem(res)">
                  <div class="name">{{ res.name }}</div>

                </div>
              </template>
            </div>
          </div>
          <div class="footer relative">
            <BackBtn @click="goBack" :dontlink="true" class="footer__btn" />
            <MenuNavigation class="footer__btn" :links="links" />
          </div>
        </div>
      </div>
    </div>

  </div>


</template>

<style scoped>
.regions__switch {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4rem;
}

.regions__switch button {
  border-radius: 2.375rem;
  border: 3px solid #FFF;
  background: rgba(0, 0, 0, 0.00);
  display: flex;
  width: 25.25rem;
  height: 6.625rem;
  padding: 1.5rem 1.5rem 1.5rem 5.9375rem;
  align-items: center;
  gap: 5.8125rem;
  color: var(--White, #FFF);
  font-family: "TT Hoves";
  font-size: 2.5rem;
  font-style: normal;
  font-weight: 500;
  line-height: 110%;
  /* 2.75rem */
  letter-spacing: -0.05rem;
  opacity: 0.5;
}

.regions__switch button.active {
  opacity: 1;
}

.dopText {
  color: var(--White, #FFF);
  text-align: center;
  -webkit-text-stroke-width: 0.54px;
  -webkit-text-stroke-color: rgba(255, 255, 255, 0.15);
  font-family: "TT Hoves";
  font-size: 1.5rem;
  font-style: normal;
  font-weight: 400;
  line-height: 100%;
  /* 1.5rem */
  letter-spacing: -0.03rem;
  opacity: 0.3;
  margin-bottom: 2rem;
}

.wrapper-content .map {
  position: absolute;
      bottom: -12.89rem;
    left: -16rem;
    width: 192.19356rem;
    height: 131.82969rem;
  flex-shrink: 0;
}

.wrapper-content {
  padding: 10rem 31.875rem;
  color: rgb(245, 245, 245);
  display: flex;
  flex-direction: column;

  position: relative;
  width: 100%;
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(25deg, #000 -3.55%, #030E22 122.6%, #000 179.53%);
}

.content {
  margin-top: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content__top {
  margin-bottom: 5.625rem;
}

.content__title {
  font-family: "TT Commons";
  font-weight: 500;
  font-size: 8.75rem;
  line-height: 100%;
  letter-spacing: -0.03em;
  color: #ffffff;
  text-align: center;
}

.regions__btns {
  width: 52.3125rem;
  margin-left: auto;
  position: relative;
  z-index: 3;
}

.input_quiz {
  border-radius: 2.375rem;
  border: 3px solid #ffffff44;
  background: linear-gradient(85deg, rgba(217, 217, 217, 0.10) 3.83%, rgba(115, 115, 115, 0.10) 99.95%);
  color: var(--White, #FFF);
  font-family: "TT Hoves";
  font-size: 2rem;
  font-style: normal;
  font-weight: 500;
  line-height: 110%;
  letter-spacing: -0.04rem;
  padding: 2.59rem 3.37rem;
  width: 100%;
}

.input_wrap {
  height: 7.375rem;
  position: relative;
}

.btnSearch {
  position: absolute;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  display: flex;
  width: 4rem;
  height: 4rem;
}

.btnSearch svg {
  width: 100%;
  height: 100%;
}

.custom_list-wrapper {
  border-radius: 2.375rem;
  border: 3px solid #ffffff44;
  background: linear-gradient(85deg, rgba(217, 217, 217, 0.10) 3.83%, rgba(115, 115, 115, 0.10) 99.95%);
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.custom_list {

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 46.25rem;

  max-height: 46.25rem;
  overflow-y: scroll;
}

.custom_list::-webkit-scrollbar {
  width: 0.375rem;
}

.custom_list::-webkit-scrollbar-track {
  border-radius: 0.0625rem;
  background: rgba(68, 83, 113, 0.10);
}

.custom_list::-webkit-scrollbar-thumb {
  border-radius: 0.25rem;
  background: var(--scroll-knob-bg-color-default, #A1A9B8);
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.00) inset;
}


.region {
  color: var(--White, #FFF);
  font-family: "TT Hoves";
  font-size: 2.5rem;
  font-style: normal;
  font-weight: 500;
  line-height: 110%;
  letter-spacing: -0.05rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  padding: 1.5rem 2rem;
}

.active {
  background: rgba(124, 123, 123, 0.158);
}

.footer {
  margin-top: 6.25rem;
  display: flex;
  width: 100%;
  justify-content: space-between;
}
</style>