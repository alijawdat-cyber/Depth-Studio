import { render } from '@testing-library/react'
import { vi } from 'vitest'
import { Button } from '../button'

describe('Button Component', () => {
  it('renders button with text', () => {
    const { getByText } = render(<Button>اضغط هنا</Button>)
    
    const button = getByText('اضغط هنا')
    expect(button).toBeInTheDocument()
  })



  it('handles click events', () => {
    const handleClick = vi.fn()
    const { getByText } = render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = getByText('Click me')
    button.click()
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    const { getByText } = render(<Button disabled>Disabled Button</Button>)
    
    const button = getByText('Disabled Button')
    expect(button).toBeDisabled()
  })
}) 