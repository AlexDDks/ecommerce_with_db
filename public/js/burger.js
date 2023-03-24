const toggleButton = document.getElementsByClassName('aBurgerButton')[0]
const navbarLinks = document.getElementsByClassName('navHide')[0]

toggleButton.addEventListener('click', () => {
  navbarLinks.classList.toggle('active')
})