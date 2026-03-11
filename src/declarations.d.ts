declare module '@dtsl/icons/dist/icons/react/*' {
  import * as React from 'react'
  interface IconProps {
    size?: number | string
    color?: string
    style?: React.CSSProperties
    className?: string
  }
  const Icon: React.FC<IconProps>
  export default Icon
}

declare module '@dtsl/react/dist/components/*' {
  const component: any
  export default component
  export const NaosButton: any
  export const VARIANTS: any
  export const COLORS: any
  export const SIZES: any
}
