import React from 'react'
import classnames from 'classnames'
import Link from 'next/link'

interface BaseButtonProps {
  onClick?: any
  label: string | JSX.Element
  variant?: ButtonVariant
  size?: 'sm'|'md'
  href?: string
  type?: 'button' | 'reset' | 'submit'
  disabled?: boolean
}

export const BaseButton = React.forwardRef<HTMLInputElement, BaseButtonProps>(({
  onClick = null,
  label,
  variant = ButtonVariant.DEFAULT,
  size = 'md',
  type = 'button',
  disabled: disable = false
}: BaseButtonProps, ref: any): JSX.Element => {
  let sz: string = size
  if (variant === ButtonVariant.ROUNDED_ICON_CONTRAST) {
    switch (sz) {
      case 'sm':
        sz = 'smRounded'
        break
      case 'md':
        sz = 'mdRounded'
        break
      default:
        sz = 'mdRounded'
    }
  }
  return (
    <button
      type={type}
      onClick={onClick}
      ref={ref}
      className={classnames(
        'inline-flex space-x-2 items-center',
        'cursor-pointer disabled:cursor-auto disabled:opacity-50',
        variant,
        SIZE[sz]
      )}
      disabled={disable}
    >
      {label}
    </button>
  )
})

export const Button = ({
  onClick,
  label,
  variant,
  href,
  size = 'md',
  type = 'button',
  disabled: disable = false
}: BaseButtonProps): JSX.Element => {
  if (href != null) {
    return (
      <Link href={href} passHref>
        <a>
          <BaseButton
            onClick={onClick}
            label={label}
            variant={variant}
            type={type}
            disabled={disable}
            size={size}
          />
        </a>
      </Link>
    )
  }
  return (<BaseButton onClick={onClick} label={label} variant={variant} type={type} disabled={disable} />)
}

const SIZE = {
  sm: 'px-2 py-0.5 text-sm',
  md: 'px-2.5 py-1 text-base',
  smRounded: 'p-0.5',
  mdRounded: 'p-1.5'
}

export enum ButtonVariant {
  DEFAULT = 'text-primary hover:underline',
  TEXT_CONTRAST = 'text-white hover:underline',
  OUTLINED_PRIMARY = 'border rounded-md bg-inherit text-ob-primary border-ob-primary drop-shadow-sm hover:ring-2',
  OUTLINED_SECONDARY = 'border rounded-md bg-inherit text-ob-secondary border-ob-secondary drop-shadow-sm hover:ring-2',
  OUTLINED_CONTRAST = 'border  border-gray-600 rounded-md bg-inherit text-white drop-shadow-md hover:ring-2',
  SOLID_PRIMARY = 'border  border-gray-600 rounded-md bg-ob-primary text-white drop-shadow-md hover:ring-2',
  OUTLINED_DEFAULT = 'border rounded-md border-gray-800 text-black drop-shadow-sm hover:ring-1',
  SOLID_SECONDARY = 'border-0 rounded-md bg-ob-secondary text-black drop-shadow-sm hover:ring-1',
  SOLID_DEFAULT = 'border-0 rounded-md bg-slate-800 text-white drop-shadow-sm hover:ring-1',
  ROUNDED_ICON_CONTRAST = 'rounded-full text-white hover:ring-1'
}
