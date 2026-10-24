import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Не удалось отрисовать приложение', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app">
          <main className="app-main">
            <div className="app-main__inner">
              <section className="section" role="alert">
                <h1 className="section__title">Не удалось построить план</h1>
                <p className="section__description">
                  Произошла непредвиденная ошибка. Перезагрузите страницу — сохранённые долги
                  и параметры останутся на месте.
                </p>
                <button type="button" className="btn btn--primary" onClick={this.handleReload}>
                  Перезагрузить
                </button>
              </section>
            </div>
          </main>
        </div>
      )
    }

    return this.props.children
  }
}
