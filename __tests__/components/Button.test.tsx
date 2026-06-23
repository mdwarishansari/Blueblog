/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/Button'

describe('Button component', () => {
  it('renders children and handles click events', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()

    render(<Button onClick={onClick}>Save Post</Button>)

    const button = screen.getByRole('button', { name: /save post/i })
    await user.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disables interaction while loading', () => {
    render(<Button loading>Submit</Button>)

    const button = screen.getByRole('button', { name: /submit/i })
    expect(button).toBeDisabled()
  })

  it('applies variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-pure-white')
  })
})
