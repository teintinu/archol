import { useLang } from 'components/lang'
import { askAndShowName } from 'components/archol/hw/processes'
import { newInstance } from 'components/archollib'

export function useMenu () {
  const lang = useLang().lang
  return [
    {
      title: askAndShowName.title[lang](),
      caption: askAndShowName.caption[lang](),
      icon: askAndShowName.icon,
      run () {
        newInstance(askAndShowName)
      }
    }
  ]
}
