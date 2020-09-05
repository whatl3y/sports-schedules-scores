// scss files
import 'bootstrap/scss/bootstrap.scss'
import '../scss/app.scss'

// js files
import * as utils from './utils'

window.addEventListener('DOMContentLoaded', (/*event*/) => {
  const searchInput = document.querySelector('#team-search')
  const searchForTeam = utils.debounce(() => {
    const [, , leagueName] = window.location.pathname.split('/')
    window.location.href = `/league/${leagueName}?search=${searchInput.value}`
  }, 400)

  searchInput.addEventListener('keydown', (event) => {
    searchForTeam()
  })
})
