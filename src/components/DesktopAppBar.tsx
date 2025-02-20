import Image from 'next/image'
import { useSession, signIn } from 'next-auth/react'

import DesktopNavBar, { NavListItem } from './ui/DesktopNavBar'
import ClimbSearch from './search/ClimbSearch'
import XSearch from './search/XSearch'
import DesktopFilterBar from './finder/filters/DesktopFilterBar'
import NavMenuButton from './ui/NavMenuButton'

import { useCanary } from '../js/hooks'
import { ButtonVariant } from './ui/BaseButton'

import ProfileNavButton from './ProfileNavButton'
import NewPost from './NewPost'

interface DesktopAppBarProps {
  expanded: boolean
  onExpandSearchBox: Function
  onClose: Function
  showFilterBar?: boolean
}

export default function DesktopAppBar ({ expanded, onExpandSearchBox, onClose, showFilterBar = true }: DesktopAppBarProps): JSX.Element {
  const canary = useCanary()
  const { status } = useSession()

  let navList: JSX.Element | null | JSX.Element[]
  switch (status) {
    case 'authenticated':
      navList = navListAuthenticated
      break
    case 'loading':
      navList = null
      break
    default:
      navList = navListDefault
  }

  return (
    <header className='sticky top-0 z-10'>
      <DesktopNavBar
        expanded={expanded}
        branding={
          <a href='/' className='inline-flex flex-rows justify-start items-center md:gap-x-2'>
            <Image className='align-middle' src='/tortilla.png' height={32} width={32} />
            <span className='hidden md:inline-flex items-center font-semibold text-xl lg:text-2xl text-custom-primary pt-1'>OpenTacos</span>
          </a>
      }
        search={
          canary
            ? <XSearch isMobile={false} />
            : <ClimbSearch
                expanded={expanded}
                onClick={onExpandSearchBox}
                onClickOutside={onClose}
              />
      }
        navList={navList}
      />
      {showFilterBar && <DesktopFilterBar />}
    </header>
  )
}

const navListDefault: JSX.Element[] = [
  {
    action: async () => await signIn('auth0', { callbackUrl: '/api/user/me' }),
    title: 'Login',
    variant: ButtonVariant.SOLID_PRIMARY
  },
  {
    route: '/about',
    title: 'About'
  },
  {
    route: 'https://docs.openbeta.io',
    title: 'Docs'
  },
  {
    route: 'https://discord.gg/2A2F6kUtyh',
    title: 'Discord',
    variant: ButtonVariant.OUTLINED_SECONDARY
  }
].map(
  ({ action, variant, title, route }: NavListItem) => (
    <NavMenuButton
      key={title}
      onClick={action}
      variant={variant}
      label={title}
      to={route}
    />)
)

const navListAuthenticated = (
  <>
    <NewPost isMobile={false} />
    <ProfileNavButton key='dropdown' isMobile={false} />
  </>
)
