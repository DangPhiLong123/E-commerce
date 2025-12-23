import { useSelector } from 'react-redux'
import { translate } from 'ultils/i18n'

const useI18n = () => {
  const lang = useSelector(state => state.app.language)
  const t = (key) => translate(lang, key)
  return { t, lang }
}

export default useI18n















