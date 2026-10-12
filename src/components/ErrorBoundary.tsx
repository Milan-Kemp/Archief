import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error('Onverwachte fout:', error, info.componentStack)
  }

  handleBack = () => {
    this.setState({ error: null })
    window.location.hash = '/'
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#FAFAF7] px-4 text-center text-[#1C1C1A] dark:bg-[#161614] dark:text-[#F5F5F2]">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Er ging iets mis.
          </p>
          <button
            type="button"
            onClick={this.handleBack}
            className="rounded-lg bg-[#1C1C1A] px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-[#1C1C1A]"
          >
            Terug naar start
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
