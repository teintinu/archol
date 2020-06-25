import {
  reactive
} from '@vue/composition-api'

const lang = reactive({
  lang: 'pt'
})

export function useLang () {
  return lang
}
